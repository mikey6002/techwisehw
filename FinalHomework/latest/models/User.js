import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  money: {
    type: Number,
    default: 2022,
    min: 0
  },
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  ,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Instance method to update stats
userSchema.methods.updateGameStats = function(result, amountWon = 0) {
  this.totalGamesPlayed += 1;
  
  if (result === 'win' || result === 'blackjack') {
    this.totalWins += 1;
    this.money += amountWon;
  } else if (result === 'lose' || result === 'bust') {
    this.totalLosses += 1;
  } else if (result === 'push') {
    // Push doesn't count as win or loss, but money is returned
    this.money += amountWon;
  }
  
  return this.save();
};

//Find or create user
userSchema.statics.findOrCreate = async function(playerId, username = null) {
  let user = await this.findOne({ playerId });
  
  if (!user) {
    user = new this({
      playerId,
      username: username || `Player_${playerId}`,
      money: 2022
    });
    await user.save();
  } else {
    // Update last login
    user.lastLogin = new Date();
    await user.save();
  }
  
  return user;
};

export default mongoose.model('User', userSchema);
