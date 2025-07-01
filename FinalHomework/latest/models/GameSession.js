import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  playerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  deckId: {
    type: String,
    required: true
  },
  bet: {
    type: Number,
    required: true,
    min: 1
  },
  playerCards: [{
    code: String,
    image: String,
    value: String,
    suit: String
  }],
  dealerCards: [{
    code: String,
    image: String,
    value: String,
    suit: String
  }],
  playerScore: {
    type: Number,
    default: 0
  },
  dealerScore: {
    type: Number,
    default: 0
  },
  gameState: {
    type: String,
    enum: ['playing', 'dealer', 'ended'],
    default: 'playing'
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'push', 'blackjack', 'bust']
  },
  message: {
    type: String,
    default: 'Game started! Choose your action.'
  },
  moneyBefore: {
    type: Number,
    required: true
  },
  moneyAfter: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSessionSchema.index({ playerId: 1, createdAt: -1 });
gameSessionSchema.index({ gameId: 1 });
gameSessionSchema.index({ isActive: 1 });

// Instance method to complete game
gameSessionSchema.methods.completeGame = function(result, moneyAfter, message) {
  this.gameState = 'ended';
  this.result = result;
  this.moneyAfter = moneyAfter;
  this.message = message;
  this.isActive = false;
  this.completedAt = new Date();
  return this.save();
};

// Static method to cleanup old sessions
gameSessionSchema.statics.cleanupOldSessions = async function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const result = await this.updateMany(
    { 
      createdAt: { $lt: oneHourAgo },
      isActive: true 
    },
    { 
      isActive: false,
      gameState: 'ended',
      message: 'Session expired'
    }
  );
  return result;
};

export default mongoose.model('GameSession', gameSessionSchema);
