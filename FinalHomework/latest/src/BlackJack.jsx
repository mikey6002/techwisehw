import { useState, useEffect } from 'react'
import './BlackJack.css'

function BlackJack({ currentUser }) {
  const [gameId, setGameId] = useState(null)
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [money, setMoney] = useState(currentUser?.money || 2022)
  const [bet, setBet] = useState(0)
  const [gameState, setGameState] = useState('betting') // betting, playing, dealer, ended
  const [message, setMessage] = useState('Place your bet to start!')
  const [inputBet, setInputBet] = useState('')
  const [loading, setLoading] = useState(false)

  const API_BASE = 'http://localhost:3001/api'

  // Sync user money from Atlas database when things load
  useEffect(() => {
    const syncUserMoney = async () => {
      if (!currentUser?.playerId) return
      
      try {
        const response = await fetch(`${API_BASE}/user/${currentUser.playerId}`)
        const data = await response.json()
        
        if (data.success) {
          setMoney(data.user.money)
        }
      } catch (error) {
        console.error('Error syncing user money:', error)
      }
    }

    syncUserMoney()
  }, [currentUser?.playerId])

  // Function to refresh $$ money from database
  const refreshMoneyFromDB = async () => {
    if (!currentUser?.playerId) return
    
    try {
      const response = await fetch(`${API_BASE}/user/${currentUser.playerId}`)
      const data = await response.json()
      
      if (data.success) {
        setMoney(data.user.money)
      }
    } catch (error) {
      console.error('Error refreshing money:', error)
    }
  }

  // Reset money in database when starting over
  const resetUserMoney = async () => {
    if (!currentUser?.playerId) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/user/${currentUser.playerId}/reset-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setMoney(data.newBalance)
        setMessage('Money set to $2022! Good luck!')
        newRound()
      } else {
        setMessage(data.message || 'Failed to reset money')
      }
    } catch (error) {
      console.error('Error resetting money:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset for new round
  const newRound = () => {
    setGameState('betting')
    setMessage('Place your bet to start!')
    setInputBet('')
    setBet(0)
    setPlayerCards([])
    setDealerCards([])
    setPlayerScore(0)
    setDealerScore(0)
    setGameId(null)
  }

  // Start new game
  const startGame = async () => {
    if (!inputBet || inputBet <= 0 || inputBet > money) {
      setMessage('Please enter a valid bet amount!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/start-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bet: parseInt(inputBet),
          playerId: currentUser?.playerId || 'default'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGameId(data.gameId)
        setPlayerCards(data.playerCards)
        setDealerCards(data.dealerCards)
        setPlayerScore(data.playerScore)
        setDealerScore(data.dealerScore)
        setGameState(data.gameState)
        setMoney(data.money)
        setBet(data.bet)
        setMessage(data.message)
      } else {
        setMessage(data.message || 'Failed to start game')
      }
    } catch (error) {
      console.error('Error starting game:', error)
      setMessage('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  // Player hits
  const hit = async () => {
    if (gameState !== 'playing' || !gameId) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/hit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId })
      })

      const data = await response.json()
      
      if (data.success) {
        setPlayerCards(data.playerCards)
        setPlayerScore(data.playerScore)
        setGameState(data.gameState)
        setMessage(data.message)
        
        if (data.gameState === 'ended') {
          // Game ended due to bust
        }
      } else {
        setMessage(data.message || 'Failed to hit')
      }
    } catch (error) {
      console.error('Error hitting:', error)
      setMessage('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  //stand 
  const stand = async () => {
    if (gameState !== 'playing') return
    
    setGameState('dealer')
    setMessage('Dealer is playing...')
    setLoading(true)
    
    try {
      const response = await fetch(`${API_BASE}/stand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId })
      })

      const data = await response.json()
      
      if (data.success) {
        setDealerCards(data.dealerCards)
        setDealerScore(data.dealerScore)
        setGameState(data.gameState)
        setMessage(data.message)
        setMoney(data.money)
        
        // Refresh money from database to be sure that it is uptodate
        setTimeout(() => {
          refreshMoneyFromDB()
        }, 1000)
      } else {
        setMessage(data.message || 'Failed to stand')
      }
    } catch (error) {
      console.error('Error standing:', error)
      setMessage('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="blackjack-container">
      <h1>Blackjack Game</h1>
      
      <div className="game-info">
        <div className="money">
          Money: ${money}
        </div>
        {bet > 0 && <div className="bet">Current Bet: ${bet}</div>}
        <div className="message">{message}</div>
      </div>
      
      {/* Betting Section */}
      {gameState === 'betting' && (
        <div className="betting-section">
          <input
            type="number"
            value={inputBet}
            onChange={(e) => setInputBet(e.target.value)}
            placeholder="Enter bet amount"
            min="1"
            max={money}
          />
          <button onClick={startGame} disabled={loading}>
            {loading ? 'Starting...' : 'Deal Cards'}
          </button>
        </div>
      )}


      {/* Playing Section */}
      {(gameState === 'playing' || gameState === 'dealer' || gameState === 'ended') && (
        <div className="game-area">
          <div className="dealer-section">
            <h3>Dealer {gameState !== 'betting' && gameState !== 'playing' ? `(${dealerScore})` : ''}</h3>
            <div className="cards">
              {dealerCards.map((card, index) => (
                <div key={index} className="card">
                  {(index === 1 && gameState === 'playing') ? (
                    <div className="card-back">🂠</div>
                  ) : (
                    <img src={card.image} alt={`${card.value} of ${card.suit}`} />
                  )}
                </div>
              ))}
            </div>
          </div>



          <div className="player-section">
            <h3>Player ({playerScore})</h3>
            <div className="cards">
              {playerCards.map((card, index) => (
                <div key={index} className="card">
                  <img src={card.image} alt={`${card.value} of ${card.suit}`} />
                </div>
              ))}
            </div>
          </div>

          {gameState === 'playing' && (
            <div className="actions">
              <button onClick={hit}>Hit</button>
              <button onClick={stand}>Stand</button>
            </div>
          )}

          {gameState === 'ended' && (
            <div className="actions">
              <button onClick={newRound}>New Round</button>
            </div>
          )}
        </div>
      )}

      {money <= 0 && (
        <div className="game-over">
          <h2>Game Over! You're out of money!</h2>
          <button onClick={resetUserMoney} disabled={loading}>
            {loading ? 'Resetting...' : 'Start Over ($2022)'}
          </button>
        </div>
      )}
    </div>
  )
}

export default BlackJack
