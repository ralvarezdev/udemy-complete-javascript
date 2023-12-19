// Challenge 9

function printForecast (temperatures)
{
  let message = "";
  let counter = 1;

  if (Array.isArray(temperatures))
  {
    for (let temperature of temperatures)
    {
      if (!isNaN(temperature))
      {
        message = message.concat(`... ${ temperature }ºC in ${ counter } days `);
        counter++;
      }
    }
    console.log(message);
  }
}

let testData1 = [17, 21, 23];
let testData2 = [12, 5, -5, 0, 4];

printForecast(testData1);
printForecast(testData2);