const calcAverage = (score1, score2, score3) => {
  let avr = (score1 + score2 + score3) / 3;
  console.log(avr);
  return avr;
};


function checkWinner(avrTeam1, avrTeam2, nameTeam1, nameTeam2) {
  if (avrTeam1 >= 2 * avrTeam2) {
    console.log(`${nameTeam1} win (${avrTeam1} vs. ${avrTeam2})`);
  } else if (avrTeam2 >= 2 * avrTeam1) {
    console.log(`${nameTeam2} win (${avrTeam2} vs. ${avrTeam1})`);
  } else {
    console.log("No team wins...");
  }
}

let scoreDolphins = [44, 23, 71];
let scoreKoalas = [23, 34, 27];

let avgDolphins = calcAverage(scoreDolphins[0], scoreDolphins[1], scoreDolphins[2]);
let avgKoalas = calcAverage(scoreKoalas[0], scoreKoalas[1], scoreKoalas[2]);

checkWinner(avgDolphins, avgKoalas, "Dolphins", "Koalas");
