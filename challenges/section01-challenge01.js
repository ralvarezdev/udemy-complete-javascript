function calculateBMI(mass, height) {
  return mass / (height * height);
}

let markMass = 78;
let markHeight = 1.69;
let BMIMark = calculateBMI(markMass, markHeight);
let johnMass = 92;
let johnHeight = 1.95;
let BMIJohn = calculateBMI(johnMass, johnHeight);

let markHigherBMI = BMIMark > BMIJohn;

console.log(BMIMark)
console.log(BMIJohn)
console.log(markHigherBMI);