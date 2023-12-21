'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const createUsernames = accounts =>
  accounts.forEach(account =>
    account.username = account.owner.toLowerCase().split(' ').map(name => name[0]).join(''));
createUsernames(accounts);
console.log(accounts);

const updateUI = () =>
{
  displayMovements(currAccount.movements);
  calcDisplayBalance(currAccount.movements);
  calcDisplaySummary(currAccount.movements);
};

let currAccount;

btnLogin.addEventListener('click', event =>
{
  event.preventDefault();

  currAccount = accounts.find(acc => acc.username == inputLoginUsername.value);

  if (currAccount?.pin !== Number(inputLoginPin.value))
    return;

  labelWelcome.textContent = `Welcome back, ${ currAccount.owner.split(' ')[0] }`;

  containerApp.style.opacity = 1;

  inputLoginUsername.value = inputLoginPin.value = '';

  inputLoginUsername.blur();
  inputLoginPin.blur();

  updateUI();

  const eurToUSD = 1.1;

  const movementsUSD = currAccount.movements.map(mov => Math.trunc(mov * eurToUSD));

  console.log(currAccount.movements);
  console.log(movementsUSD);

  const movementsDescription = currAccount.movements.map((mov, i) =>
    `Movement ${ i + 1 }: You ${ mov > 0 ? 'deposited' : 'withdrew' } ${ Math.abs(mov) } `);
  console.log(movementsDescription);

  const deposits = currAccount.movements.filter(mov => mov > 0);
  console.log(deposits);

  const withdrawals = currAccount.movements.filter(mov => mov < 0);
  console.log(withdrawals);

  const balance = currAccount.movements.reduce((acc, cur) => acc += cur, 0);
  console.log(balance);

  const max = currAccount.movements.reduce((acc, mov) => (acc > mov) ? acc : mov, currAccount.movements[0]);
  console.log(max);

  const totalDepositsUSD = currAccount.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov * eurToUSD, 0);
  console.log(totalDepositsUSD);

  const totalWithdrawalsUSD = currAccount.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov * eurToUSD, 0);
  console.log(totalWithdrawalsUSD);
});

btnTransfer.addEventListener('click', event =>
{
  event.preventDefault();

  let amount = Number(inputTransferAmount.value);
  let toAccount = accounts.find(acc => acc.username == inputTransferTo.value);

  if (!toAccount)
    return;

  if (currAccount.balance >= amount && toAccount?.username !== currAccount.username)
  {
    currAccount.movements.push(-1 * amount);
    toAccount.movements.push(amount);
    updateUI();

    console.log('Transfer Valid');
  }
});

btnLoan.addEventListener('click', event =>
{
  event.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currAccount.movements.some(mov => mov >= amount * 0.1))
  {
    currAccount.movements.push(amount);

    inputLoanAmount.value = '';
    updateUI();

    console.log('Loan Valid');
  }
});

btnClose.addEventListener('click', event =>
{
  event.preventDefault();

  if (currAccount.username === inputCloseUsername.value && currAccount.pin === Number(inputClosePin.value))
  {
    const index = accounts.findIndex(acc => acc.username === currAccount.username);
    accounts.splice(index, 1);

    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.style.opacity = 0;

    labelBalance.textContent = 'Log in to get started';

    console.log('Account Deleted');
  }
});

let sorted = false;

btnSort.addEventListener('click', event =>
{
  event.preventDefault();
  sorted = !sorted;
  displayMovements(currAccount.movements, sorted);
});

const displayMovements = (movements, sort = false) =>
{
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) =>
  {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
  <div class="movements__row">
  <div class="movements__type movements__type--${ type }">${ i + 1 } ${ type }</div>
  <div class="movements__value">${ mov }€</div>
  </div>
  `;
    //    <div class="movements__date">3 days ago</div>

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = movements =>  
{
  const balance = movements.reduce((acc, mov) => acc + mov, 0);

  currAccount.balance = balance;
  labelBalance.textContent = `${ balance }€`;
};

const calcDisplaySummary = movements =>
{
  const income = movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  const outcome = movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  const interest = movements.filter(mov => mov > 0)
    .map(mov => mov * currAccount.interestRate / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${ income }€`;
  labelSumOut.textContent = `${ Math.abs(outcome) }€`;
  labelSumInterest.textContent = `${ interest }€`;
};

const overallBalance = accounts.flatMap(acc => acc.movements).reduce((acc, curr) => acc += curr, 0);
console.log(`Overall Balance: ${ overallBalance }`);

const allMovements = accounts.flatMap(acc => acc.movements);

const bankDeposits = allMovements.filter(mov => mov > 0).reduce((acc, curr) => acc += curr);
console.log(`Total Bank Deposits: ${ bankDeposits }`);

const bankWithdrawals = allMovements.filter(mov => mov < 0).reduce((acc, curr) => acc += curr);
console.log(`Total Bank Withdrawals: ${ bankWithdrawals }`);

const { deposits, withdrawals } = allMovements.reduce((total, curr) =>
{
  total[curr > 0 ? 'deposits' : 'withdrawals'] += curr;
  return total;
}, { deposits: 0, withdrawals: 0 });
console.log(`Bank Total Movements\nDeposits: ${ deposits }\nWithdrawals: ${ withdrawals }`);

/////////////////////////////////////////////////
