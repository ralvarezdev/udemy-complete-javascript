'use strict';

const scores = [0, 0];
let current, activePlayer;
let winner = false;
let rounds = 0;

const btnNewGame = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const dice = document.querySelector('.dice');

const domPlayer0 = document.querySelector('.player--0');
const domPlayer1 = document.querySelector('.player--1');
const domScore0 = document.getElementById('score--0');
const domScore1 = document.getElementById('score--1');
const domCurrent0 = document.getElementById('current--0');
const domCurrent1 = document.getElementById('current--1');


function setTextContent(content, ...elements) {
    for (let element of elements)
        element.textContent = content;
}

function getPlayerElement(elementName) {
    return document.getElementById(`${elementName}--${activePlayer}`);
}

function switchPlayer() {
    activePlayer = (activePlayer == 0) ? 1 : 0;

    domPlayer0.classList.toggle('player--active');
    domPlayer1.classList.toggle('player--active');
}

btnNewGame.addEventListener('click', () => {
    scores[0] = scores[1] = current = 0;

    if (rounds !== 0) {
        document.querySelector(`.player--${activePlayer}`).classList.remove('player--winner');
    }

    activePlayer = 0;

    document.querySelector(`.player--${activePlayer}`).classList.add('player--active');

    setTextContent(0, domScore0, domScore1, domCurrent0, domCurrent1);
    dice.classList.add('hidden');

    winner = false;
});

btnRoll.addEventListener('click', () => {
    if (winner)
        return;

    const random = Math.trunc(Math.random() * 6) + 1;

    dice.classList.remove('hidden');
    dice.src = `dice-${random}.png`;

    if (random !== 1) {
        current += random;

        setTextContent(current, getPlayerElement('current'));
    } else {
        current = 0;
        setTextContent(0, getPlayerElement('current'));
        switchPlayer();
    }
});

btnHold.addEventListener('click', () => {
    if (winner)
        return;

    scores[activePlayer] += current;

    setTextContent(scores[activePlayer], getPlayerElement('score'));

    if (scores[activePlayer] < 100) {
        switchPlayer();
        current = 0;
    } else {
        document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
        document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');

        dice.classList.add('hidden');

        winner = true;
        rounds++;
    }
});

btnNewGame.dispatchEvent(new Event('click'));