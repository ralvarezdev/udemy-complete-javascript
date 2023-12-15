'use strict';

const domBody = document.querySelector('body');
const domScore = document.querySelector('.score');
const domHighscore = document.querySelector('.highscore');
const domMessage = document.querySelector('.message');
const domNumber = document.querySelector('.number');

let secretNumber = Math.trunc(Math.random() * 20) + 1;
let playerWon = false;
let score = 20;
let highscore = 0;

// Function to Change Text Content from Some Element
function setTextContent (element, text)
{
  element.textContent = text;
}

document.querySelector('.again').addEventListener('click', (event) =>
{
  playerWon = false;

  domBody.style.backgroundColor = '#222';
  domNumber.style.width = '15rem';
  setTextContent(domNumber, '?');

  setTextContent(domMessage, 'Start guessing...');
  secretNumber = Math.trunc(Math.random() * 20) + 1;

  score = 20;
  setTextContent(domScore, score);
});

document.querySelector('.check').addEventListener('click', (event) =>
{
  if (playerWon)
    return;

  const guess = Number(document.querySelector('.guess').value);
  console.log(guess, typeof guess);

  if (score == 1 && guess != secretNumber) // Player loses the game
  {
    setTextContent(domMessage, '💣 You lost the game!');
    score--;
  }
  else if (!guess) // No input
  {
    setTextContent(domMessage, '⛔ No number!');
  }
  else if (guess == secretNumber) // Player wins the game
  {
    setTextContent(domMessage, '🎉🎉 Correct number!');
    setTextContent(domNumber, secretNumber);

    if (score > highscore)
    {
      highscore = score;
      setTextContent(domHighscore, highscore);
    }
    playerWon = true;

    domBody.style.backgroundColor = '#60b347';
    domNumber.style.width = '30rem';
  }
  else  // Guess too High or too Low
  {
    setTextContent(domMessage, (guess > secretNumber) ? '📈 Too high!' : '📉 Too low!');
    score--;
  }

  setTextContent(domScore, score);
});