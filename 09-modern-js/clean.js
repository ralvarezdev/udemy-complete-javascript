'use strict';

const budget = [
  { value: 250, description: 'Sold old TV 📺', user: 'jonas' },
  { value: -45, description: 'Groceries 🥑', user: 'jonas' },
  { value: 3500, description: 'Monthly salary 👩‍💻', user: 'jonas' },
  { value: 300, description: 'Freelancing 👩‍💻', user: 'jonas' },
  { value: -1100, description: 'New iPhone 📱', user: 'jonas' },
  { value: -20, description: 'Candy 🍭', user: 'matilda' },
  { value: -125, description: 'Toys 🚂', user: 'matilda' },
  { value: -1800, description: 'New Laptop 💻', user: 'jonas' },
];

const spendingLimits = Object.freeze({
  jonas: 1500,
  matilda: 100,
});

const getLimit = function (limits, user)
{
  //return return = spendingLimits[user] ? spendingLimits[user] : 0;
  return limits?.[user] ?? 0;
};

const addExpense = function (state, limits, value, description, user = 'jonas')
{
  const cleanUser = user.toLowerCase();

  if (value > getLimit(spendingLimits, cleanUser)) return state;

  return [...state, { value: -value, description, user: cleanUser }];
};
const newBudget1 = addExpense(budget, spendingLimits, 10, 'Pizza 🍕');
const newBudget2 = addExpense(newBudget1, spendingLimits, 100, 'Going to movies 🍿', 'Matilda');
const newBudget3 = addExpense(newBudget2, spendingLimits, 200, 'Stuff', 'Jay');
console.log(newBudget3);

const checkExpenses = function (state)
{
  return state.map(entry =>
    entry.value < -getLimit(spendingLimits, entry.user) ? { ...entry, flag: 'limit' } : entry
  );
};
const finalBudget = checkExpenses(newBudget3, spendingLimits);
console.log(finalBudget);

const logBigExpenses = function (state, bigLimit)
{
  let bigExpenses = state
    .filter(entry => entry.value <= -bigLimit)
    .map(entry => entry.description.slice(-2)) // Emojis are 2 chars)
    .join(' / ');

  console.log(bigExpenses);
};
logBigExpenses(finalBudget, 500);