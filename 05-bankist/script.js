'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2020-07-12T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2023-12-18T18:49:59.371Z',
        '2023-12-21T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

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

const minToLogOut = 5;

let sorted = false;
let currencyOptions = {};
let currAccount, currMinute, logout, time, timer;

const currencies = new Map([
    ['USD', 'United States dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'Pound sterling'],
]);

const labelDateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric'
};

const movDateOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
};

const getLocaleDate = (date, locale, options) => new Intl.DateTimeFormat(locale, options).format(date);

const getCurrencyOptions = (acc) => {
    currencyOptions.style = 'currency';
    currencyOptions.currency = acc.currency;
};

const getLocaleNumber = (acc, number) => new Intl.NumberFormat(acc.locale, currencyOptions).format(number);
;

const getDaysDiff = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const formatMovDate = date => {
    console.log(date);

    const now = new Date();
    const daysDiff = getDaysDiff(now, date);
    console.log(daysDiff);

    if (daysDiff <= 1) return daysDiff === 0 ? 'Today' : 'Yesterday';
    else if (daysDiff <= 7) return `${daysDiff} days ago`;

    return getLocaleDate(date, currAccount.locale, movDateOptions);
};

const createUsernames = accounts =>
    accounts.forEach(account =>
        account.username = account.owner.toLowerCase().split(' ').map(name => name[0]).join(''));
createUsernames(accounts);

const updateLabelContent = () => {
    const now = new Date();
    labelDate.textContent = getLocaleDate(now, currAccount.locale, labelDateOptions);
};

const updateUI = () => {
    updateLabelContent();

    currMinute = setInterval(updateLabelContent(), 1000 * 60);

    displayMovements(currAccount);
    calcDisplayBalance(currAccount.movements);
    calcDisplaySummary(currAccount.movements);
};

const clearUI = () => {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
};

const displayMovements = (acc, sort = false) => {
    containerMovements.innerHTML = '';

    const dates = acc.movementsDates;
    const temp = dates.slice();
    const datesIndices = Array.from({length: dates.length}, (_, i) => i);
    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
    sort ? datesIndices.sort((a, b) => acc.movements[a] - acc.movements[b]) : datesIndices;

    console.log(dates);

    let i = 0;
    for (let index of datesIndices)
        dates[i++] = temp[index];

    movs.forEach((mov, i) => {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        console.log(dates[i]);
        const dateFormatted = formatMovDate(new Date(dates[i]));
        const movFormatted = getLocaleNumber(acc, mov);

        const html = `
      <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${dateFormatted}</div>
      <div class="movements__value">${movFormatted}</div>
      </div>
      `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = movements => {
    const balance = movements.reduce((acc, mov) => acc + mov, 0);

    currAccount.balance = balance;
    labelBalance.textContent = `${getLocaleNumber(currAccount, balance)}`;
};

const calcDisplaySummary = movements => {
    const income = movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    const outcome = movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
    const interest = movements.filter(mov => mov > 0)
        .map(mov => mov * currAccount.interestRate / 100)
        .filter(mov => mov >= 1)
        .reduce((acc, mov) => acc + mov, 0);

    labelSumIn.textContent = `${getLocaleNumber(currAccount, income)}`;
    labelSumOut.textContent = `${getLocaleNumber(currAccount, Math.abs(outcome))}`;
    labelSumInterest.textContent = `${getLocaleNumber(currAccount, interest)}`;
};

const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
        clearInterval(timer);
        clearUI();
    }
    time--;
};

const startTimer = () => {
    time = minToLogOut * 60;

    tick();
    timer = setInterval(tick, 1000);
};

btnLogin.addEventListener('click', event => {
    event.preventDefault();

    currAccount = accounts.find(acc => acc.username == inputLoginUsername.value);

    if (currAccount?.pin !== Number(inputLoginPin.value))
        return;

    if (currMinute) clearInterval(currMinute);
    if (timer) clearInterval(timer);
    startTimer();

    labelWelcome.textContent = `Welcome back, ${currAccount.owner.split(' ')[0]}`;
    getCurrencyOptions(currAccount);

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
        `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(mov)} `);
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

btnTransfer.addEventListener('click', event => {
    event.preventDefault();

    let amount = Number(inputTransferAmount.value);
    let toAccount = accounts.find(acc => acc.username == inputTransferTo.value);

    if (!toAccount)
        return;

    clearInterval(timer);
    startTimer();

    if (currAccount.balance >= amount && toAccount?.username !== currAccount.username) {
        const now = new Date().toISOString();

        currAccount.movements.push(-amount.toFixed(2));
        currAccount.movementsDates.push(now);

        toAccount.movements.push(+amount.toFixed(2));
        toAccount.movementsDates.push(now);
        updateUI();

        console.log('Transfer Valid');
    }
});

btnLoan.addEventListener('click', event => {
    event.preventDefault();

    clearInterval(timer);
    startTimer();

    const amount = Math.round(inputLoanAmount.value);

    if (amount > 0 && currAccount.movements.some(mov => mov >= amount * 0.1)) {
        currAccount.movements.push(amount);
        currAccount.movementsDates.push(new Date().toISOString());

        inputLoanAmount.value = '';
        updateUI();

        console.log('Loan Valid');
    }
});

btnClose.addEventListener('click', event => {
    event.preventDefault();

    clearInterval(timer);
    startTimer();

    if (currAccount.username === inputCloseUsername.value && currAccount.pin === Number(inputClosePin.value)) {
        const index = accounts.findIndex(acc => acc.username === currAccount.username);
        accounts.splice(index, 1);

        inputCloseUsername.value = inputClosePin.value = '';
        clearUI();

        console.log('Account Deleted');
    }
});


btnSort.addEventListener('click', event => {
    event.preventDefault();

    clearInterval(timer);
    startTimer();

    sorted = !sorted;
    displayMovements(currAccount, sorted);
});

const overallBalance = accounts.flatMap(acc => acc.movements).reduce((acc, curr) => acc += curr, 0);
console.log(`Overall Balance: ${overallBalance}`);

const allMovements = accounts.flatMap(acc => acc.movements);

const bankDeposits = allMovements.filter(mov => mov > 0).reduce((acc, curr) => acc += curr);
console.log(`Total Bank Deposits: ${bankDeposits}`);

const bankWithdrawals = allMovements.filter(mov => mov < 0).reduce((acc, curr) => acc += curr);
console.log(`Total Bank Withdrawals: ${bankWithdrawals}`);

const {deposits, withdrawals} = allMovements.reduce((total, curr) => {
    total[curr > 0 ? 'deposits' : 'withdrawals'] += curr;
    return total;
}, {deposits: 0, withdrawals: 0});
console.log(`Bank Total Movements\nDeposits: ${deposits}\nWithdrawals: ${withdrawals}`);

/////////////////////////////////////////////////
