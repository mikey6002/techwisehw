import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import User from './models/User.js';
import GameSession from './models/GameSession.js';

const app = express();
const PORT = 3001;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Helper function to generate unique game ID
function generateGameId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

//a helper function to help calculate card score
function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  
  cards.forEach(card => {
    if (card.value === 'ACE') {
      aces++;
      score += 11;
    } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  });
  
  // Adjust for aces since they're weird
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// Helper function and API to draw cards from deck
async function drawCards(deckId, count) {
  try {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await response.json();
    return data.cards || [];
  } catch (error) {
    console.error('Error drawing cards:', error);
    return [];
  }
}

// Route to create or get user profile
app.post('/api/user/login', async (req, res) => {
  try {
    const { playerId, username } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID is required' 
      });
    }

    const user = await User.findOrCreate(playerId, username);
    
    res.json({
      success: true,
      user: {
        playerId: user.playerId,
        username: user.username,
        money: user.money,
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        winRate: user.totalGamesPlayed > 0 ? ((user.totalWins / user.totalGamesPlayed) * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to get user profile
app.get('/api/user/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const user = await User.findOne({ playerId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        playerId: user.playerId,
        username: user.username,
        money: user.money,
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        winRate: user.totalGamesPlayed > 0 ? ((user.totalWins / user.totalGamesPlayed) * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to start a new game
app.post('/api/start-game', async (req, res) => {
  try {
    const { bet, playerId } = req.body;
    
    if (!bet || bet <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid bet amount' 
      });
    }

    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID is required' 
      });
    }

    // Get user from database
    const user = await User.findOne({ playerId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please login first.' 
      });
    }

    // Check if user has enough money
    if (user.money < bet) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient funds' 
      });
    }
    // using https://www.deckofcardsapi.com API
    // Create new deck
    const deckResponse = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const deckData = await deckResponse.json();
    
    if (!deckData.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create deck' 
      });
    }

    const gameId = generateGameId();
    const deckId = deckData.deck_id;

    // Deal initial cards (2 for player, 2 for dealer)
    const cards = await drawCards(deckId, 4);
    
    if (cards.length !== 4) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to deal cards' 
      });
    }

    const playerCards = [cards[0], cards[1]];
    const dealerCards = [cards[2], cards[3]];
    
    const playerScore = calculateScore(playerCards);
    const dealerScore = calculateScore(dealerCards);

    // Deduct bet from user's money
    user.money -= bet;
    await user.save();

    // Create game session in database
    const gameSession = new GameSession({
      gameId,
      playerId,
      deckId,
      bet,
      playerCards,
      dealerCards,
      playerScore,
      dealerScore,
      gameState: 'playing',
      moneyBefore: user.money + bet, // Original amount before bet
      message: 'Game started! Choose your action.'
    });

    // Check for blackjack
    if (playerScore === 21) {
      if (dealerScore === 21) {
        // Push - return bet
        user.money += bet;
        await user.save();
        
        gameSession.gameState = 'ended';
        gameSession.result = 'push';
        gameSession.message = 'Both have blackjack! Push!';
        gameSession.moneyAfter = user.money;
        gameSession.isActive = false;
        gameSession.completedAt = new Date();
        
        await user.updateGameStats('push', bet);
      } else {
        // winning calculations
        const winnings = Math.floor(bet * 2.5);
        user.money += winnings;
        await user.save();
        
        gameSession.gameState = 'ended';
        gameSession.result = 'blackjack';
        gameSession.message = 'Blackjack! You win!';
        gameSession.moneyAfter = user.money;
        gameSession.isActive = false;
        gameSession.completedAt = new Date();
        
        await user.updateGameStats('blackjack', winnings);
      }
    }

    await gameSession.save();

    // Return game state (hide dealer's second card if game is still playing)
    const responseData = {
      success: true,
      gameId,
      playerCards,
      dealerCards: gameSession.gameState === 'playing' ? [dealerCards[0]] : dealerCards,
      playerScore,
      dealerScore: gameSession.gameState === 'playing' ? calculateScore([dealerCards[0]]) : dealerScore,
      gameState: gameSession.gameState,
      money: user.money,
      bet,
      message: gameSession.message
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to hit (draw a card)
app.post('/api/hit', async (req, res) => {
  try {
    const { gameId } = req.body;
    
    const gameSession = await GameSession.findOne({ gameId, isActive: true });
    if (!gameSession) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found or already ended' 
      });
    }

    if (gameSession.gameState !== 'playing') {
      return res.status(400).json({ 
        success: false, 
        message: 'Game is not in playing state' 
      });
    }

    // Draw one card
    const cards = await drawCards(gameSession.deckId, 1);
    if (cards.length !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to draw card'
      });
    }

    // Add card to player's hand
    gameSession.playerCards.push(cards[0]);
    gameSession.playerScore = calculateScore(gameSession.playerCards);

    let message = 'Card drawn! Choose your action.';

    // Check if cards over 21
    if (gameSession.playerScore > 21) {
      const user = await User.findOne({ playerId: gameSession.playerId });
      
      gameSession.gameState = 'ended';
      gameSession.result = 'bust';
      gameSession.moneyAfter = user.money;
      gameSession.isActive = false;
      gameSession.completedAt = new Date();
      message = 'Bust! You lose!';
      
      // Update user stats (no money change as bet was already deducted)
      await user.updateGameStats('bust', 0);
    }

    gameSession.message = message;
    await gameSession.save();

    res.json({
      success: true,
      playerCards: gameSession.playerCards,
      playerScore: gameSession.playerScore,
      gameState: gameSession.gameState,
      message
    });

  } catch (error) {
    console.error('Error hitting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to stand (dealer plays)
app.post('/api/stand', async (req, res) => {
  try {
    const { gameId } = req.body;
    
    const gameSession = await GameSession.findOne({ gameId, isActive: true });
    if (!gameSession) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found or already ended' 
      });
    }

    if (gameSession.gameState !== 'playing') {
      return res.status(400).json({ 
        success: false, 
        message: 'Game is not in playing state' 
      });
    }

    gameSession.gameState = 'dealer';

    // Dealer plays (hits until 17 or higher)
    let dealerCards = [...gameSession.dealerCards];
    let dealerScore = calculateScore(dealerCards);

    while (dealerScore < 17) {
      const cards = await drawCards(gameSession.deckId, 1);
      if (cards.length === 1) {
        dealerCards.push(cards[0]);
        dealerScore = calculateScore(dealerCards);
      } else {
        break;
      }
    }

    gameSession.dealerCards = dealerCards;
    gameSession.dealerScore = dealerScore;
    gameSession.gameState = 'ended';
    gameSession.isActive = false;
    gameSession.completedAt = new Date();

    // Get user to update money and stats
    const user = await User.findOne({ playerId: gameSession.playerId });

    // Determine winner
    let result, message, winnings = 0;
    if (dealerScore > 21) {
      result = 'win';
      message = 'Dealer busts! You win!';
      winnings = gameSession.bet * 2;
      user.money += winnings;
    } else if (dealerScore > gameSession.playerScore) {
      result = 'lose';
      message = 'Dealer wins!';
      // No money change - bet was already deducted
    } else if (gameSession.playerScore > dealerScore) {
      result = 'win';
      message = 'You win!';
      winnings = gameSession.bet * 2;
      user.money += winnings;
    } else {
      result = 'push';
      message = 'Push! It\'s a tie!';
      winnings = gameSession.bet; // Return original bet
      user.money += winnings;
    }

    gameSession.result = result;
    gameSession.message = message;
    gameSession.moneyAfter = user.money;

    // Save both user and game session
    await user.save();
    await gameSession.save();
    
    // Update user game statistics
    await user.updateGameStats(result, winnings);

    res.json({
      success: true,
      dealerCards: gameSession.dealerCards,
      dealerScore: gameSession.dealerScore,
      gameState: gameSession.gameState,
      result,
      message,
      money: user.money
    });

  } catch (error) {
    console.error('Error standing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to get game status
app.get('/api/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const gameSession = await GameSession.findOne({ gameId });
    if (!gameSession) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found' 
      });
    }

    const user = await User.findOne({ playerId: gameSession.playerId });

    res.json({
      success: true,
      gameId,
      playerCards: gameSession.playerCards,
      dealerCards: gameSession.gameState === 'playing' ? [gameSession.dealerCards[0]] : gameSession.dealerCards,
      playerScore: gameSession.playerScore,
      dealerScore: gameSession.gameState === 'playing' ? calculateScore([gameSession.dealerCards[0]]) : gameSession.dealerScore,
      gameState: gameSession.gameState,
      money: user ? user.money : gameSession.moneyAfter,
      bet: gameSession.bet,
      message: gameSession.message,
      result: gameSession.result
    });

  } catch (error) {
    console.error('Error getting game status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to get user's game history
app.get('/api/user/:playerId/history', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const gameHistory = await GameSession.find({ 
      playerId, 
      gameState: 'ended' 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select('gameId bet result message moneyBefore moneyAfter createdAt completedAt');

    const totalGames = await GameSession.countDocuments({ 
      playerId, 
      gameState: 'ended' 
    });

    res.json({
      success: true,
      gameHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalGames / limit),
        totalGames,
        hasMore: skip + gameHistory.length < totalGames
      }
    });

  } catch (error) {
    console.error('Error getting game history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Blackjack server running on http://localhost:${PORT}`);
  console.log('MongoDB integration enabled');
});
