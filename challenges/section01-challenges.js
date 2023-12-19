// Challenge 2

function calculateBMI (mass, height)
{
  return mass / (height * height);
}

let markMass = 78;
let markHeight = 1.69;
let BMIMark = calculateBMI(markMass, markHeight);
let johnMass = 92;
let johnHeight = 1.95;
let BMIJohn = calculateBMI(johnMass, johnHeight);

let markHigherBMI = BMIMark > BMIJohn;

console.log(BMIMark);
console.log(BMIJohn);
console.log(markHigherBMI);

if (markHigherBMI)
{
  console.log("Mark's BMI is higher than John's!");
  console.log(`Mark's BMI (${ BMIMark }) is higher than John's (${ BMIJohn })!`);
} else
{
  console.log("John's BMI is higher than Mark's!");
  console.log(`John's BMI (${ BMIJohn }) is higher than Mark's (${ BMIMark })!`);
}

// Challenge 3

let scoreDolphins = 96 + 108 + 89;
let scoreKoalas = 88 + 91 + 110;

if (scoreDolphins > scoreKoalas)
  console.log("Dolphins win the trophy");
else if (scoreDolphins < scoreKoalas)
  console.log("Koalas win the trophy");
else
  "Both win the trophy";

// Challenge 4

const bill = 275;
var tip = (bill >= 50 && bill < 300) ? bill * 0.15 : bill * 0.2;
console.log(`The bill was ${ bill }, the tip was ${ tip }, and the total value ${ tip + bill }`);
