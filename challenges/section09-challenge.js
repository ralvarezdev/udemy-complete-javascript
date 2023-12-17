// Coding Challenge 1

/*
We're building a football betting app (soccer for my American friends 😅)!;;
Suppose we get data from a web service about a certain game('game' variable on
next page).In this challenge we're gonna work with that data.
Your tasks:
1. Create one player array for each team(variables 'players1' and
'players2')
2. The first player in any player array is the goalkeeper and the others are field;
players.For Bayern Munich(team 1) create one variable('gk') with the
goalkeeper's name, and one array ('fieldPlayers') with all the remaining 10
field players;
3. Create an array 'allPlayers' containing all players of both teams(22
players);
4. During the game, Bayern Munich(team 1) used 3 substitute players.So create a;
new array('players1Final') containing all the original team1 players plus;
'Thiago', 'Coutinho' and 'Perisic';
5. Based on the game.odds object, create one variable for each odd(called
'team1', 'draw' and 'team2')
6. Write a function ('printGoals') that receives an arbitrary number of player;
names(not an array) and prints each of them to the console, along with the
number of goals that were scored in total(number of player names passed in);
7. The team with the lower odd is more likely to win.Print to the console which
team is more likely to win, without using an if/else statement or the ternary
operator.
Test data for 6.: First, use players 'Davies', 'Muller', 'Lewandowski' and 'Kimmich'.
  Then, call the function again with players from game.scored
GOOD LUCK 😀
The Complete JavaScript Course 16;
*/

const game = {
  team1: 'Bayern Munich',
  team2: 'Borrussia Dortmund',
  players: [
    [
      'Neuer',
      'Pavard',
      'Martinez',
      'Alaba',
      'Davies',
      'Kimmich',
      'Goretzka',
      'Coman',
      'Muller',
      'Gnarby',
      'Lewandowski',
    ],
    [
      'Burki',
      'Schulz',
      'Hummels',
      'Akanji',
      'Hakimi',
      'Weigl',
      'Witsel',
      'Hazard',
      'Brandt',
      'Sancho',
      'Gotze',
    ],
  ],
  score: '4:0',
  scored: ['Lewandowski', 'Gnarby', 'Lewandowski',
    'Hummels'],
  date: 'Nov 9th, 2037',
  odds: {
    team1: 1.33,
    x: 3.25,
    team2: 6.5,
  },
};

const [players1, players2] = game.players;
console.log(`Team 1 Players: ${ players1 }`);
console.log(`Team 2 Players: ${ players2 }`);

const [gk, ...fieldPlayers] = [...players1];
console.log(`Goalkeeper: ${ gk }`);
console.log(`Field Players: ${ fieldPlayers }`);

const players = [...players1, ...players2];
console.log(`All Players: ${ players }`);

const players1Final = [...players1, 'Thiago', 'Coutinho', 'Perisic'];
console.log(`Team 1 Players Final: ${ players1Final }`);

const { team1, x: draw, team2 } = game.odds;
console.log(`Odds\nTeam 1: ${ team1 }\nDraw: ${ draw }\nTeam 2: ${ team2 }`);

function printGoals (...players)
{
  let goals = 'Goals';

  for (let player of players) goals = goals.concat('\n', player);

  console.log(`${ goals }\n\nTotal: ${ players.length }`);
}

printGoals('Davies', 'Muller', 'Lewandowski', 'Kimmich');
printGoals(...game.scored);

const drawLikely = (draw >= team1 && draw >= team2);

drawLikely && console.log('Draw is likely');
(!drawLikely && team1 > team2) && console.log('Team 1 is likely to win');
(!drawLikely && team2 > team1) && console.log('Team 2 is likely to win');

// Coding Challenge 2

/*
1. Loop over the game.scored array and print each player name to the console,
  along with the goal number(Example: "Goal 1: Lewandowski");
2. Use a loop to calculate the average odd and log it to the console(We already
studied how to calculate averages, you can go check if you don't remember);
3. Print the 3 odds to the console, but in a nice formatted way, exactly like this:
Odd of victory Bayern Munich: 1.33
Odd of draw: 3.25
Odd of victory Borrussia Dortmund: 6.5
Get the team names directly from the game object, don't hardcode them
  (except for "draw").Hint: Note how the odds and the game objects have the
same property names 😉
4. Bonus: Create an object called 'scorers' which contains the names of the
players who scored as properties, and the number of goals as the value.In this;
game, it will look like this:

{
  Gnarby: 1,
  Hummels: 1,
  Lewandowski: 2;
}
*/

const scorers = {};
for (let [index, player] of game.scored.entries())
{
  console.log(`\nGoal ${ index + 1 }: ${ player }`);

  if (scorers?.[player])
    scorers[player]++;
  else
    scorers[player] = 1;
}

let odds = Object.values(game.odds);
let avr = 0;

for (let odd of odds)
  avr += odd;
avr /= odds.length;

console.log(`Odds Average: ${ avr }`);

odds = Object.entries(game.odds);

for (let [key, value] of odds)
  if (game?.[key])
    console.log(`Odd of victory ${ game[key] }: ${ value }`);
  else
    console.log(`Odd of draw: ${ value }`);

let scorersMsg = 'Scorers';
for (let [key, value] of Object.entries(scorers))
  scorersMsg = scorersMsg.concat(`\n${ key }: ${ value }`);
console.log(scorersMsg);
