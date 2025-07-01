import { useState } from 'react'
import Signup from './Signup.jsx'
import BlackJack from './BlackJack.jsx'
import './index.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showGame, setShowGame] = useState(false)

  const handleSignupSuccess = (userData) => {
    setCurrentUser(userData)
    setShowGame(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setShowGame(false)
  }

  return (
    <div className="app">
      {!showGame ? (
        <Signup onSignupSuccess={handleSignupSuccess} />
      ) : (
        <div className="game-container">
          <div className="user-header">
            <div className="user-info">
              <span className="welcome-text">Welcome, {currentUser?.username}!</span>
              <span className="player-id">ID: {currentUser?.playerId}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
            Logout
            </button>
          </div>
          <BlackJack currentUser={currentUser} />
        </div>
      )}
    </div>
  )
}

export default App
