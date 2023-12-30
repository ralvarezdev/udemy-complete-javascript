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

const spendingLimits = {
  jonas: 1500,
  matilda: 100,
};

const getLimit = function (user)
{
  //return return = spendingLimits[user] ? spendingLimits[user] : 0;
  return spendingLimits?.[user] ?? 0;
};

const addExpense = function (value, description, user = 'jonas')
{
  user = user.toLowerCase();

  if (value > getLimit(user)) return;

  budget.push({ value: -value, description, user });
};
addExpense(10, 'Pizza 🍕');
addExpense(100, 'Going to movies 🍿', 'Matilda');
addExpense(200, 'Stuff', 'Jay');
console.log(budget);

const check = function ()
{
  budget.forEach(entry =>
  {
    if (entry.value >= -getLimit(entry.user)) return;

    entry.flag = 'limit';
  });
};
check();

console.log(budget);

const logBigExpenses = function (bigLimit)
{
  const output = '';
  budget.forEach(entry =>
  {
    output += (entry.value <= -bigLimit) ? `${ entry.description.slice(-2) } / ` : ''; // Emojis are 2 chars
  });
  output = output.slice(0, -2); // Remove last '/ '
  console.log(output);
};
