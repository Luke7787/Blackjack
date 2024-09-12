let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = true; // Player can draw cards while their total is <= 21

window.onload = function() {
    buildDeck();
    shuffleDeck();
    startGame();
};

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // A-C -> K-C, A-D -> K-D
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // Shuffle deck
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

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

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);

    document.getElementById("your-sum").innerText = yourSum;
}

function hit() {
    if (!canHit) return;

    let card = deck.pop();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    
    let cardImg = document.createElement("img");
    cardImg.src = "./cards/" + card + ".png";
    document.getElementById("your-cards").append(cardImg);

    document.getElementById("your-sum").innerText = yourSum;

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        endGame(); // You lose if you exceed 21
    }
}

function stay() {
    canHit = false;

    // Reveal hidden dealer card
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    // Update dealer's sum after revealing the hidden card
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    document.getElementById("dealer-sum").innerText = dealerSum; // Show dealer's sum right away

    // Start dealer's play after revealing the hidden card with a slight delay
    setTimeout(() => {
        playDealerTurn();
    }, 1000); // 1-second delay before starting dealer's turn
}

function playDealerTurn() {
    let dealerTurnInterval = setInterval(() => {
        if (dealerSum < 17) {
            let card = deck.pop();
            dealerSum += getValue(card);
            dealerAceCount += checkAce(card);
            let cardImg = document.createElement("img");
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("dealer-cards").append(cardImg);

            // Update dealer's sum after each card drawn
            dealerSum = reduceAce(dealerSum, dealerAceCount);
            document.getElementById("dealer-sum").innerText = dealerSum;
        } else {
            clearInterval(dealerTurnInterval); // Stop drawing when dealerSum >= 17
            endGame(); // End the game after dealer finishes drawing
        }
    }, 1000); // Delay between dealer card draws (1 second)
}

function endGame() {
    let message = "";

    if (yourSum > 21) {
        message = "You Lose!";
    } else if (dealerSum > 21) {
        message = "Dealer Busts! You Win!";
    } else if (yourSum == dealerSum) {
        message = "Tie!";
    } else if (yourSum > dealerSum) {
        message = "You Win!";
    } else {
        message = "You Lose!";
    }

    document.getElementById("results").innerText = message;
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { // A, J, Q, K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    return card[0] == "A" ? 1 : 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}
