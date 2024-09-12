// Global Variables
let dealerSum = 0;
let dealerAceCount = 0;
let hidden;
let deck;
let canHit = true; // Player can draw cards while their total is <= 21
let balance = 100; // Starting balance
let betAmount = 0;
let doubledDown = false; // Tracks if the player has doubled down
let currentHandIndex = 0; // Tracks which hand the player is currently playing
let playerHands = []; // Array to hold player hands
let playerSums = []; // Array to hold sums for each hand
let playerAceCounts = []; // Array to hold ace counts for each hand
let handBets = []; // Array to hold bet amounts for each hand
let handFinished = []; // Array to track if a hand is finished
let isBlackjack = []; // Array to track natural Blackjack for each hand

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
    document.getElementById("double").addEventListener("click", doubleDown);
    document.getElementById("split").addEventListener("click", splitHand);
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

    // Update the current bet display
    document.getElementById("current-bet").innerText = betAmount.toFixed(2);

    // Show the current bet display
    document.getElementById("current-bet-container").style.display = "block";

    document.getElementById("bet-container").style.display = "none";

    // Enable game controls
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
    document.getElementById("double").disabled = false;
    document.getElementById("split").disabled = false;

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

    // Player's initial hand
    playerHands = [[]]; // Initialize with one hand
    playerSums = [0];
    playerAceCounts = [0];
    handBets = [betAmount];
    handFinished = [false];
    isBlackjack = [false]; // Initialize isBlackjack array
    currentHandIndex = 0;

    // Deal two cards to the player's first hand
    for (let i = 0; i < 2; i++) {
        hitCard(currentHandIndex, false);
    }

    updateHandDisplay();

    // Check for initial Blackjack
    if (playerSums[currentHandIndex] === 21 && playerHands[currentHandIndex].length === 2) {
        isBlackjack[currentHandIndex] = true; // Set Blackjack flag
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("double").disabled = true;
        document.getElementById("split").disabled = true;

        // Reveal dealer's hidden card
        revealHiddenCard();

        // Check if dealer also has Blackjack
        setTimeout(() => {
            // Dealer's turn is not needed if dealer's initial hand is a natural Blackjack
            let dealerHasBlackjack = dealerSum === 21 && dealerAceCount > 0 && dealerHasTwoCards();
            if (dealerHasBlackjack) {
                // Dealer has Blackjack
                endGame();
            } else {
                // Proceed to endGame
                endGame();
            }
        }, 1000);
    } else {
        // Check if split is possible
        checkSplitOption();
    }
}

// Function to deal a card to a specific hand
function hitCard(handIndex, isPlayerAction) {
    let card = deck.pop();
    let hand = playerHands[handIndex];
    hand.push(card);

    playerSums[handIndex] += getValue(card);
    playerAceCounts[handIndex] += checkAce(card);

    playerSums[handIndex] = reduceAce(playerSums[handIndex], playerAceCounts[handIndex]);

    if (isPlayerAction) {
        updateHandDisplay();
        document.getElementById(`your-sum-${handIndex}`).innerText = playerSums[handIndex];

        // Check for bust
        if (playerSums[handIndex] > 21) {
            handFinished[handIndex] = true;
            nextHand();
        } else if (playerSums[handIndex] === 21) {
            handFinished[handIndex] = true;
            nextHand();
        }
    }
}

// Player chooses to "Hit"
function hit() {
    if (!canHit) return;

    hitCard(currentHandIndex, true);

    // After hitting, disable Double and Split options
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;
}

// Player chooses to "Stay"
function stay() {
    handFinished[currentHandIndex] = true;
    nextHand();
}

// Proceed to the next hand or dealer's turn if all hands are finished
function nextHand() {
    // Check if there is another hand to play
    if (currentHandIndex < playerHands.length - 1) {
        currentHandIndex++;
        updateHandDisplay();

        // Reset buttons for the next hand
        canHit = true;
        document.getElementById("hit").disabled = false;
        document.getElementById("stay").disabled = false;
        document.getElementById("double").disabled = false;

        // Check if split is possible on the new hand
        checkSplitOption();
    } else {
        // All hands are played, proceed to dealer's turn
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("double").disabled = true;
        document.getElementById("split").disabled = true;

        revealHiddenCard();
        setTimeout(playDealerTurn, 1000);
    }
}

// Player chooses to "Double"
function doubleDown() {
    if (balance < handBets[currentHandIndex]) {
        alert("You do not have enough balance to double down.");
        return;
    }

    // Double the bet amount for the current hand
    balance -= handBets[currentHandIndex];
    handBets[currentHandIndex] *= 2;
    updateBalanceDisplay();
    updateBetDisplay();

    // Disable Double and Split buttons
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;

    // Set doubledDown flag
    doubledDown = true;

    // Player receives one more card
    hitCard(currentHandIndex, true);

    // After doubling down, player cannot hit again
    canHit = false;
    document.getElementById("hit").disabled = true;

    // Proceed to next hand or dealer's turn
    handFinished[currentHandIndex] = true;
    setTimeout(nextHand, 500);
}

// Player chooses to "Split"
function splitHand() {
    if (balance < handBets[currentHandIndex]) {
        alert("You do not have enough balance to split.");
        return;
    }

    let hand = playerHands[currentHandIndex];
    let firstCard = hand[0];
    let secondCard = hand[1];

    // Create two new hands
    playerHands[currentHandIndex] = [firstCard]; // Update current hand
    playerHands.splice(currentHandIndex + 1, 0, [secondCard]); // Insert new hand

    // Update bets for both hands
    handBets.splice(currentHandIndex + 1, 0, handBets[currentHandIndex]);
    balance -= handBets[currentHandIndex];
    updateBalanceDisplay();

    // Reset sums and ace counts for both hands
    playerSums[currentHandIndex] = getValue(firstCard);
    playerAceCounts[currentHandIndex] = checkAce(firstCard);

    playerSums.splice(currentHandIndex + 1, 0, getValue(secondCard));
    playerAceCounts.splice(currentHandIndex + 1, 0, checkAce(secondCard));

    handFinished.splice(currentHandIndex + 1, 0, false);
    isBlackjack.splice(currentHandIndex + 1, 0, false); // Initialize isBlackjack for new hand

    // Deal one more card to each hand
    hitCard(currentHandIndex, false);
    hitCard(currentHandIndex + 1, false);

    updateHandDisplay();

    // After splitting, disable Double and Split buttons for this hand
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;
}

// Update the display of player's hands
function updateHandDisplay() {
    let yourHandsDiv = document.getElementById("your-hands");
    yourHandsDiv.innerHTML = '';

    if (playerHands.length === 1) {
        // Display as single hand without "Hand 1"
        let handDiv = document.createElement("div");
        handDiv.className = "hand";
        handDiv.id = `hand-0`;

        let h2 = document.createElement("h2");
        h2.innerText = `You: `;
        let sumSpan = document.createElement("span");
        sumSpan.id = `your-sum-0`;
        sumSpan.innerText = playerSums[0];
        h2.appendChild(sumSpan);
        handDiv.appendChild(h2);

        let cardsDiv = document.createElement("div");
        cardsDiv.className = "cards";
        for (let card of playerHands[0]) {
            let cardImg = document.createElement("img");
            cardImg.src = "./cards/" + card + ".png";
            cardsDiv.appendChild(cardImg);
        }
        handDiv.appendChild(cardsDiv);

        yourHandsDiv.appendChild(handDiv);
    } else {
        // Multiple hands, display with "Hand 1", "Hand 2", etc.
        for (let i = 0; i < playerHands.length; i++) {
            let handDiv = document.createElement("div");
            handDiv.className = "hand";
            handDiv.id = `hand-${i}`;

            let handTitle = document.createElement("h3");
            handTitle.innerText = `Hand ${i + 1}: `;
            if (i === currentHandIndex) {
                handTitle.style.color = "#00ff99"; // Highlight current hand
            }
            handDiv.appendChild(handTitle);

            let sumSpan = document.createElement("span");
            sumSpan.id = `your-sum-${i}`;
            sumSpan.innerText = playerSums[i];
            handTitle.appendChild(sumSpan);

            let cardsDiv = document.createElement("div");
            cardsDiv.className = "cards";
            for (let card of playerHands[i]) {
                let cardImg = document.createElement("img");
                cardImg.src = "./cards/" + card + ".png";
                cardsDiv.appendChild(cardImg);
            }
            handDiv.appendChild(cardsDiv);

            yourHandsDiv.appendChild(handDiv);
        }
    }

    updateBetDisplay();
}

// Update the current bet display
function updateBetDisplay() {
    let totalBet = handBets.reduce((a, b) => a + b, 0);
    document.getElementById("current-bet").innerText = totalBet.toFixed(2);
}

// Check if the player can split their hand
function checkSplitOption() {
    let hand = playerHands[currentHandIndex];
    if (hand.length === 2 && getValue(hand[0]) === getValue(hand[1])) {
        document.getElementById("split").disabled = false;
    } else {
        document.getElementById("split").disabled = true;
    }
}

// Reveal the dealer's hidden card
function revealHiddenCard() {
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    // Update dealer's sum after revealing the hidden card
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    document.getElementById("dealer-sum").innerText = dealerSum;
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

// Helper function to check if dealer has two cards (natural Blackjack possibility)
function dealerHasTwoCards() {
    // At the start, dealer has one visible card plus the hidden card
    return document.getElementById("dealer-cards").children.length === 2;
}

// Determine the outcome and update balance
function endGame() {
    let message = "";

    // Check if dealer has natural Blackjack
    let dealerHasBlackjack = dealerSum === 21 && dealerAceCount > 0 && dealerHasTwoCards();

    for (let i = 0; i < playerHands.length; i++) {
        let result = "";

        if (isBlackjack[i]) { // Player has natural Blackjack
            if (dealerHasBlackjack) {
                result = `Hand ${i + 1}: Both have Blackjack! It's a Tie! Your bet is returned.`;
                balance += handBets[i]; // Return the bet
            } else {
                result = `Hand ${i + 1}: Blackjack! You win 2.5x your bet!`;
                balance += handBets[i] * 2.5; // Payout is 2.5 times the bet
            }
        } else if (dealerHasBlackjack) {
            result = `Hand ${i + 1}: Dealer has Blackjack. You Lose!`;
            // Player loses, do nothing
        } else if (playerSums[i] > 21) {
            result = `Hand ${i + 1}: You Bust!`;
        } else if (dealerSum > 21) {
            result = `Hand ${i + 1}: Dealer Busts! You win!`;
            balance += handBets[i] * 2;
        } else if (playerSums[i] === dealerSum) {
            result = `Hand ${i + 1}: It's a Tie! Your bet is returned.`;
            balance += handBets[i]; // Return the bet
        } else if (playerSums[i] > dealerSum) {
            result = `Hand ${i + 1}: You win!`;
            balance += handBets[i] * 2;
        } else {
            result = `Hand ${i + 1}: You lose your bet.`;
        }

        message += result + "\n";
    }

    // Update balance and display message
    updateBalanceDisplay();
    document.getElementById("results").innerText = message;

    // Show New Game button
    document.getElementById("new-game").style.display = "inline-block";

    // Disable game controls
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;

    // Reset doubledDown flag
    doubledDown = false;

    // Hide the current bet display
    document.getElementById("current-bet-container").style.display = "none";

    // Check if player has run out of funds
    if (balance <= 0) {
        alert("You have run out of funds. Please add more funds to continue playing.");
        showAddFunds();

        // Hide game controls
        document.getElementById("hit").style.display = "none";
        document.getElementById("stay").style.display = "none";
        document.getElementById("double").style.display = "none";
        document.getElementById("split").style.display = "none";
    }
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

    // Show game controls again
    document.getElementById("hit").style.display = "inline-block";
    document.getElementById("stay").style.display = "inline-block";
    document.getElementById("double").style.display = "inline-block";
    document.getElementById("split").style.display = "inline-block";
}

// Reset the game for a new round
function resetGame() {
    // Reset variables
    dealerSum = 0;
    dealerAceCount = 0;
    hidden = null;
    deck = [];
    canHit = true;
    betAmount = 0;
    doubledDown = false;
    currentHandIndex = 0;
    playerHands = [];
    playerSums = [];
    playerAceCounts = [];
    handBets = [];
    handFinished = [];
    isBlackjack = [];

    // Clear UI elements
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-hands").innerHTML = '';
    document.getElementById("dealer-sum").innerText = '';
    document.getElementById("results").innerText = '';
    document.getElementById("bet-input").value = '';

    // Hide the current bet display
    document.getElementById("current-bet-container").style.display = "none";

    // Reset the current bet display value
    document.getElementById("current-bet").innerText = '0.00';

    // Disable game controls
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;

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
