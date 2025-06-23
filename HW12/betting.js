let bankroll = 2022;

// Card deck 
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

function getBankroll() {
    return bankroll;
}

function setBankroll(newBalance) {
    if (Number.isInteger(newBalance)) {
        bankroll = newBalance;
        document.getElementById("bankroll-display").innerText = "$" + bankroll;
    } else {
        console.error("Bankroll must be an integer.");
    }
}

function timeToBet() {
    document.getElementById("playersActions").classList.add("hidden");
    document.getElementById("betting").classList.remove("hidden");
    document.getElementById("bankroll-display").innerText = "$" + getBankroll();
}

function timeToPlay() {
    document.getElementById("betting").classList.add("hidden");
    document.getElementById("playersActions").classList.remove("hidden");
}

//random card
function getRandomCard() {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return `${value} of ${suit}`;
}

//Dealing two random cards and show users  in the UI
function dealPlayerCards() {
    const playerCardSection = document.getElementById("playersCards");
    playerCardSection.innerHTML = ""; 

    const card1 = getRandomCard();
    const card2 = getRandomCard();

    const card1Element = document.createElement("li");
    card1Element.textContent = card1;
    const card2Element = document.createElement("li");
    card2Element.textContent = card2;

    playerCardSection.appendChild(card1Element);
    playerCardSection.appendChild(card2Element);
}

function makeWager() {
    const wagerInput = document.getElementById("users-wager");
    const wager = parseInt(wagerInput.value, 10);

    if (!Number.isInteger(wager) || wager <= 0) {
        alert("Please enter a valid wager.");
        return;
    }

    if (wager > getBankroll()) {
        alert("Insufficient funds.");
        return;
    }

    console.log("Wager placed: $" + wager);
    setBankroll(getBankroll() - wager);

    // Deal cards to the player
    dealPlayerCards();

    // Continue to the play screen
    timeToPlay();
}

// Automatically start betting screen on load
window.onload = timeToBet;
