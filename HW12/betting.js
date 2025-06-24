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

// two random cards and show users  in the UI
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

    // Dealing player
    dealPlayerCards();

    
    timeToPlay();
}

// Player action functions
function hit() {
    const playerCardSection = document.getElementById("playersCards");
    const newCard = getRandomCard();
    
    const cardElement = document.createElement("li");
    cardElement.textContent = newCard;
    playerCardSection.appendChild(cardElement);
    
    console.log("Player hit: " + newCard);
}

function stand() {
    console.log("Player stands");
    alert("You chose to stand!");
}

function double() {
    const wagerInput = document.getElementById("users-wager");
    const originalWager = parseInt(wagerInput.value, 10) || 0;
    
    if (originalWager > getBankroll()) {
        alert("Insufficient funds to double down.");
        return;
    }
    
    setBankroll(getBankroll() - originalWager);
    hit(); // Dealing one more card
    console.log("Player doubled down");
    alert("You doubled down! One more card dealt.");
}

function split() {
    console.log("Player split");
    alert("I don't know how to handle splitting yet.");
}

function surrender() {
    console.log("Player surrendered");
    const wagerInput = document.getElementById("users-wager");
    const wager = parseInt(wagerInput.value, 10) || 0;
    
    // Return half the money that was bet on the game
    setBankroll(getBankroll() + Math.floor(wager / 2));
    alert("You surrendered and received half your wager back.");
    timeToBet(); // Starts new round
}

window.onload = timeToBet;
