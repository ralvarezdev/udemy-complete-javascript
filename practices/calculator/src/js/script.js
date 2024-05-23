'use strict';

// Messages
const waitingMsg = "Waiting for input...";
const operationMsg = "Waiting for an operation...";
const errorMsg = "ERROR";

// Classes
const inputNumberClass = "input-number--class";
const inputNumberErrorClass = "input-number--error";
const inputNumberRemoveErrorClass = "input-number--remove-error";
const resultErrorClass = "result--error";
const resultRemoveErrorClass = "result--remove-error";
const btnNumberErrorClass = "btn--error";
const btnClass = ".btn";
const iconClass = ".feather--icon";

// Timings
const sleepDelay = 100;

// Input Numbers
const inputNumbers = document.querySelectorAll(".input-number");

// Buttons
const btns = document.querySelectorAll(btnClass);
const additionBtn = document.querySelector(".btn-addition");
const subtractionBtn = document.querySelector(".btn-subtraction");
const multiplicationBtn = document.querySelector(".btn-multiplication");
const divisionBtn = document.querySelector(".btn-division");
const modulusBtn = document.querySelector(".btn-modulus");
const powerBtn = document.querySelector(".btn-power");

// Icons
const icons = document.querySelectorAll(iconClass);

// Result
const result = document.querySelector(".result");

// Number of Invalid InputNumbers
let NaNCounter = 0;

// - Promises

// -- Sleep Promise
const sleep = delay => new Promise(func => setTimeout(func, delay));

// - Functions

// -- Function to Substitute Classes from Element
const substituteClass = (element, fromClass, toClass) =>
{
  element.classList.remove(fromClass);
  element.classList.add(toClass);
};

// -- Event Listener Functions

// --- Input Number Checker Function
const inputNumberChecker = async (element) =>
{
  while (element === document.activeElement)
  {
    let wasNaNInput = element.classList.contains(inputNumberErrorClass);
    let isNaNInput = isNaN(element.value);
    let someMissing = false;

    console.log("Input State: " + (isNaNInput ? "Invalid" : "Valid"));

    for (let inputNumber of inputNumbers)
    {
      someMissing = (inputNumber.value === "");

      if (someMissing)
        break;
    }

    if (isNaNInput)
    {
      if (!wasNaNInput)
      {
        substituteClass(element, inputNumberRemoveErrorClass, inputNumberErrorClass);
        substituteClass(result, resultRemoveErrorClass, resultErrorClass);
        NaNCounter++;
      }
    }
    else if (wasNaNInput)
    {
      substituteClass(element, inputNumberErrorClass, inputNumberRemoveErrorClass);
      NaNCounter--;

      if (NaNCounter == 0)
        substituteClass(result, resultErrorClass, resultRemoveErrorClass);
    }

    result.innerHTML = (isNaNInput) ? errorMsg : (someMissing ? waitingMsg : operationMsg);

    await sleep(sleepDelay);
  }
};

// -- Funtion Get Array of Input Numbers
// Returns an Array of Numbers if All the Input Numbers are Valid. Otherwise, 'null'
const getInputNumbers = () =>
{
  const inputNumbersValues = [...inputNumbers].map(input => input.value);

  for (let inputNumberValue of inputNumbersValues)
    if (isNaN(inputNumberValue) || inputNumberValue === '')
      return null;

  return inputNumbersValues.map(number => parseFloat(number));
};

// - Add Event Listeners to Inputs
inputNumbers.forEach(input => input.addEventListener("focus", e => inputNumberChecker(e.target)));

// - Add Event Listeners to Buttons

// -- Addition Button Event Listeners
const getAdditionResult = (e) =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => result + x);
};
additionBtn.onclick = getAdditionResult;

// -- Subtraction Button Event Listeners
const getSubtractionResult = (e) =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => result - x);
};
subtractionBtn.onclick = getSubtractionResult;

// -- Multiplication Button Event Listeners
const getMultiplicationResult = e =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => result * x);
};
multiplicationBtn.onclick = getMultiplicationResult;

// -- Division Button Event Listeners
const getDivisionResult = e =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => result / x);
};
divisionBtn.onclick = getDivisionResult;

// -- Modulus Button Event Listeners
const getModulusResult = e =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => result % x);
};
modulusBtn.onclick = getModulusResult;

// -- Power Button Event Listeners
const getPowerResult = e =>
{
  e.preventDefault();
  let numbers = getInputNumbers();

  if (numbers)
    result.innerHTML = numbers.reduce((result, x) => Math.pow(result, x));
};
powerBtn.onclick = getPowerResult;

// - Add Event Listeners to Button Icons
icons.forEach(icon => icon.addEventListener("click", e => e.preventDefault()));