// Coding Challenge 1

/*
Julia and Kate are doing a study on dogs.So each of them asked 5 dog owners
about their dog's age, and stored the data into an array (one array for each). For;
now, they are just interested in knowing whether a dog is an adult or a puppy.
A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years;
old.
Your tasks:
Create a function 'checkDogs', which accepts 2 arrays of dog's ages
  ('dogsJulia' and 'dogsKate'), and does the following things:
1. Julia found out that the owners of the first and the last two dogs actually have;
cats, not dogs! So create a shallow copy of Julia's array, and remove the cat
ages from that copied array(because it's a bad practice to mutate function
parameters);
2. Create an array with both Julia's (corrected) and Kate's data;
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1
is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy
🐶 ");
4. Run the function for both test datasets
Test data:
§ Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data[4, 1, 15, 8, 3]
§ Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data[10, 5, 6, 1, 4];
Hints: Use tools from all lectures in this section so far 😉
GOOD LUCK 😀
*/

const dogsJulia1 = [3, 5, 2, 12, 7];
const dogsKate1 = [4, 1, 15, 8, 3];
const dogsJulia2 = [9, 16, 6, 8, 3];
const dogsKate2 = [10, 5, 6, 1, 4];

const checkDogs = (dogsJulia, dogsKate) =>
{
  const dogsJuliaCorr = dogsJulia.slice(1, -2);
  //console.log(`Dogs Julia: ${ dogsJulia }`);
  //console.log(`Dogs Julia (Cats Removed): ${ dogsJuliaReal }`);

  const allDogs = dogsJuliaCorr.concat(dogsKate);

  let msg = '';
  allDogs.forEach((dog, i, arr) =>
  {
    const type = (dog < 3) ? `still a puppy 🐶` : `an adult, and is ${ dog } years old`;

    msg = msg.concat(`Dog number ${ i + 1 } is ${ type }\n`);
  });
  console.log(msg);
};

console.log('----- TEST 1 -----');
checkDogs(dogsJulia1, dogsKate1);

console.log('----- TEST 2 -----');
checkDogs(dogsJulia2, dogsKate2);

// Coding Challenge 2

/*
Create a function 'calcAverageHumanAge', which accepts an arrays of dog's
ages ('ages'), and does the following things in order:
1. Calculate the dog age in human years using the following formula: if the dog is
<= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old,
humanAge = 16 + dogAge * 4
2. Exclude all dogs that are less than 18 human years old (which is the same as
keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know
from other challenges how we calculate averages 😉)
4. Run the function for both test datasets
Test data:
§ Data 1: [5, 2, 4, 1, 15, 8, 3]
§ Data 2: [16, 6, 10, 5, 6, 1, 4]
*/

const dogsAge1 = [5, 2, 4, 1, 15, 8, 3];
const dogsAge2 = [16, 6, 10, 5, 6, 1, 4];

const calcAverageHumanAge = ages =>
{
  const humanYears = ages.map(age => (age <= 2) ? age * 2 : 16 + age * 4);
  const humanYearsFiltered = humanYears.filter(age => age >= 18);
  console.log(humanYearsFiltered);

  let avr = humanYearsFiltered.reduce((acc, age) => acc += age, 0);
  avr /= humanYearsFiltered.length;
  console.log(`Human Years Average: ${ avr }`);
};

console.log('----- TEST 1 -----');
calcAverageHumanAge(dogsAge1);

console.log('----- TEST 2 -----');
calcAverageHumanAge(dogsAge2);

// Coding Challenge 3

/*
Rewrite the 'calcAverageHumanAge' function from Challenge #2, but this time
as an arrow function, and using chaining!
Test data:
§ Data 1: [5, 2, 4, 1, 15, 8, 3]
§ Data 2: [16, 6, 10, 5, 6, 1, 4]
GOOD LUCK 😀
*/

const calcAverageHumanAgeRev = ages =>
{
  let avr = ages.map(age => (age <= 2) ? age * 2 : 16 + age * 4)
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
  console.log(`Human Years Average: ${ avr }`);
};

console.log('----- TEST 1 REV -----');
calcAverageHumanAgeRev(dogsAge1);

console.log('----- TEST 2 REV -----');
calcAverageHumanAgeRev(dogsAge2);

// Coding Challenge 4

/*
Julia and Kate are still studying dogs, and this time they are studying if dogs are
eating too much or too little.
Eating too much means the dog's current food portion is larger than the
recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10%
above and 10% below the recommended portion (see hint).
Your tasks:
1. Loop over the 'dogs' array containing dog objects, and for each dog, calculate
the recommended food portion and add it to the object as a new property. Do
not create a new array, simply loop over the array. Forumla:
recommendedFood = weight ** 0.75 * 28. (The result is in grams of
food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too
little. Hint: Some dogs have multiple owners, so you first need to find Sarah in
the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much
('ownersEatTooMuch') and an array with all owners of dogs who eat too little
('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and
Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
too little!"
5. Log to the console whether there is any dog eating exactly the amount of food
that is recommended (just true or false)
6. Log to the console whether there is any dog eating an okay amount of food
(just true or false)
7. Create an array containing the dogs that are eating an okay amount of food (try
to reuse the condition used in 6.)
8. Create a shallow copy of the 'dogs' array and sort it by recommended food
portion in an ascending order (keep in mind that the portions are inside the
array's objects 😉)
The Complete JavaScript Course 26
Hints:
§ Use many different tools to solve these challenges, you can use the summary
lecture to choose between them 😉
§ Being within a range 10% above and below the recommended portion means:
current > (recommended * 0.90) && current < (recommended *
1.10). Basically, the current portion should be between 90% and 110% of the
recommended portion.
GOOD LUCK 😀
*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

dogs.forEach(dog => dog.recFood = dog.weight ** 0.75 * 28);
console.log(dogs);

const tooLittle = -1;
const normal = 0;
const tooMuch = 1;

const checkEating = dog =>
{
  if (dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1)
    return normal;
  else
    return (dog.curFood <= dog.recFood * 0.9) ? tooLittle : tooMuch;
};

dogOwners = dogs.map(dog => dog.owners);
const sarahDog = dogOwners.find(owner => owner.includes('Sarah'));

const check = checkEating(sarahDog);
let msg = '';

if (check === 0)
  msg = 'normal';
else
  msg = (check === tooLittle) ? 'too Little' : 'too Much';

console.log(`Sarah's Dog is Eating ${ msg }`);;

const dogOwnersEatTooMuch = [];
const dogOwnersEatTooLittle = [];
const dogOwnersEatOkay = [];

dogs.forEach(dog =>
{
  const check = checkEating(dog);

  if (check === tooLittle)
    dogOwnersEatTooLittle.push(dog.owners);
  else if (check === tooMuch)
    dogOwnersEatTooMuch.push(dog.owners);
  else
    dogOwnersEatOkay.push(dog.owners);
});
console.log(`Dogs that Eat too Much: ${ dogOwnersEatTooMuch }\n\
Dogs that Eat too Little: ${ dogOwnersEatTooLittle }\n\
Dogs that Eat an Okay Amount: ${ dogOwnersEatOkay }`);

console.log(`${ dogOwnersEatTooMuch.flat().join(' and ') }'s dogs eat too much!`);
console.log(`${ dogOwnersEatTooLittle.flat().join(' and ') }'s dogs eat too little!`);

console.log(`Is there any Dog Eating Exactly the Recommended Amount? ${ dogs.find(dog => dog.curFood == dog.recFood) ? 'Yes' : 'No' }`);
console.log(`Is there any Dog Eating an Okay Amount? ${ dogOwnersEatOkay.length > 0 ? 'Yes' : 'No' }`);

const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(`Dogs Sorted by Recommended Food Amount (below)`);
console.log(dogsSorted);