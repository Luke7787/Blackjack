// Global Variables
let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = true; // Player can draw cards while their total is <= 21

let balance = 100; // Starting balance
let betAmount = 0;

// Initialize Game
window.onload = function() {
    // Build and shuffle deck
    buildDeck();
    shuffleDeck();

    updateBalanceDisplay(); // Show initial balance

    // Add event listeners
    document.getElementById("add-funds-btn").addEventListener("click", showAddFunds);
    document.getElementById("confirm-add").addEventListener("click", addFunds);
    document.getElementById("cancel-add").addEventListener("click", hideAddFunds);
    document.getElementById("place-bet").addEventListener("click", placeBet);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("new-game").addEventListener("click", resetGame);
};

// Build a standard 52-card deck
function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // e.g., "A-C" to "K-S"
        }
    }
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

// Place Bet and Start Game
function placeBet() {
    let bet = parseFloat(document.getElementById("bet-input").value);
    if (isNaN(bet) || bet <= 0 || bet > balance) {
        alert("Please enter a valid bet amount within your balance.");
        return;
    }
    betAmount = bet;
    balance -= betAmount; // Deduct bet from balance temporarily
    updateBalanceDisplay();
    document.getElementById("bet-container").style.display = "none";

    // Enable game controls
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;

    startGame();
}

// Start the game by dealing initial cards
function startGame() {
    // Dealer's initial cards: one hidden, one face-up
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    let dealerCard = deck.pop();
    dealerSum += getValue(dealerCard);
    dealerAceCount += checkAce(dealerCard);
    let dealerCardImg = document.createElement("img");
    dealerCardImg.src = "./cards/" + dealerCard + ".png";
    document.getElementById("dealer-cards").append(dealerCardImg);

    // Player's initial cards (two face-up)
    for (let i = 0; i < 2; i++) {
        let card = deck.pop();
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        let cardImg = document.createElement("img");
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(cardImg);
    }

    // Update player's sum, adjusting for Ace values
    yourSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = yourSum;

    // Check for initial Blackjack
    if (yourSum === 21) {
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        revealHiddenCard();
        setTimeout(endGame, 1000);
    }
}

// Reveal the dealer's hidden card
function revealHiddenCard() {
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    // Update dealer's sum after revealing the hidden card
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    document.getElementById("dealer-sum").innerText = dealerSum;
}

// Player chooses to "Hit"
function hit() {
    if (!canHit) return;

    let card = deck.pop();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);

    let cardImg = document.createElement("img");
    cardImg.src = "./cards/" + card + ".png";
    document.getElementById("your-cards").append(cardImg);

    yourSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = yourSum;

    if (yourSum > 21) {
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        revealHiddenCard();
        setTimeout(endGame, 1000);
    } else if (yourSum === 21) {
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        revealHiddenCard();
        setTimeout(endGame, 1000);
    }
}

// Player chooses to "Stay"
function stay() {
    canHit = false;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    revealHiddenCard();
    // Dealer's turn
    setTimeout(playDealerTurn, 1000);
}

// Dealer's turn logic
function playDealerTurn() {
    let dealerTurnInterval = setInterval(() => {
        if (dealerSum < 17) {
            let card = deck.pop();
            dealerSum += getValue(card);
            dealerAceCount += checkAce(card);
            let cardImg = document.createElement("img");
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("dealer-cards").append(cardImg);

            dealerSum = reduceAce(dealerSum, dealerAceCount);
            document.getElementById("dealer-sum").innerText = dealerSum;
        } else {
            clearInterval(dealerTurnInterval);
            setTimeout(endGame, 500);
        }
    }, 1000);
}

// Determine the outcome and update balance
function endGame() {
    let message = "";

    if (yourSum > 21) {
        message = "You Bust! You Lose!";
    } else if (dealerSum > 21) {
        message = "Dealer Busts! You Win!";
        balance += betAmount * 2;
    } else if (yourSum === dealerSum) {
        message = "It's a Tie!";
        balance += betAmount; // Return the bet
    } else if (yourSum > dealerSum) {
        message = "You Win!";
        balance += betAmount * 2;
    } else {
        message = "You Lose!";
    }

    // Update balance and display message
    updateBalanceDisplay();
    document.getElementById("results").innerText = message;

    // Show New Game button
    document.getElementById("new-game").style.display = "inline-block";
}

// Calculate the value of a card
function getValue(card) {
    let data = card.split("-");
    let value = data[0];

    if (isNaN(value)) { // Face cards
        if (value == "A") {
            return 11; // Ace initially counts as 11
        }
        return 10;
    }
    return parseInt(value);
}

// Check if the card is an Ace
function checkAce(card) {
    return card[0] == "A" ? 1 : 0;
}

// Adjust sum for Aces if over 21
function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10; // Convert an Ace from 11 to 1
        playerAceCount -= 1;
    }
    return playerSum;
}

// Update the displayed balance
function updateBalanceDisplay() {
    document.getElementById("balance").innerText = balance.toFixed(2);
}

// Show the Add Funds modal
function showAddFunds() {
    document.getElementById("add-funds-container").style.display = "block";
}

// Hide the Add Funds modal
function hideAddFunds() {
    document.getElementById("add-funds-container").style.display = "none";
}

// Add funds to the balance
function addFunds() {
    let amount = parseFloat(document.getElementById("add-funds").value);
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    balance += amount;
    updateBalanceDisplay();
    hideAddFunds();
}

// Reset the game for a new round
function resetGame() {
    // Reset variables
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    betAmount = 0;
    canHit = true;

    // Clear UI elements
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';
    document.getElementById("dealer-sum").innerText = '';
    document.getElementById("your-sum").innerText = '';
    document.getElementById("results").innerText = '';
    document.getElementById("bet-input").value = '';

    // Disable game controls
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    // Hide New Game button and show bet container
    document.getElementById("new-game").style.display = "none";
    document.getElementById("bet-container").style.display = "block";

    // Rebuild and shuffle the deck
    buildDeck();
    shuffleDeck();

    // Check if player has enough balance
    if (balance <= 0) {
        alert("You have run out of funds. Please add more funds to continue playing.");
        showAddFunds();
    }
}
