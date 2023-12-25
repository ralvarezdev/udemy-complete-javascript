'use strict';

// Coding Challenge 1

/*
Your tasks:
1. Use a constructor function to implement a 'Car'.A car has a 'make' and a;
'speed' property.The 'speed' property is the current speed of the car in
  km / h;
2. Implement an 'accelerate' method that will increase the car's speed by 10,
and log the new speed to the console;
3. Implement a 'brake' method that will decrease the car's speed by 5, and log
the new speed to the console;
4. Create 2 'Car' objects and experiment with calling 'accelerate' and;
'brake' multiple times on each of them
Test data:
§ Data car 1: 'BMW' going at 120 km / h
§ Data car 2: 'Mercedes' going at 95 km / h;
*/

const Car = function (make, speed)
{
  this.make = make;
  this.speed = speed;
};

Car.prototype.logSpeed = function ()
{
  console.log(`${ this.make } going at ${ this.speed } km/h`);
};

Car.prototype.accelerate = function ()
{
  this.speed += 10;
  this.logSpeed();
};

Car.prototype.brake = function ()
{
  this.speed -= 5;
  this.logSpeed();
};

const car1 = new Car('BMW', 120);
const car2 = new Car('Mercedes', 95);

for (let i = 0; i < 5; i++)
  car1.accelerate();

for (let j = 0; j < 3; j++)
  car2.accelerate();

for (let k = 0; k < 4; k++)
  car1.brake();

// Coding Challenge 2

/*
1. Re-create Challenge #1, but this time using an ES6 class (call it 'CarCl')
2. Add a getter called 'speedUS' which returns the current speed in mi/h (divide
by 1.6)
3. Add a setter called 'speedUS' which sets the current speed in mi/h (but
converts it to km/h before storing the value, by multiplying the input by 1.6)
4. Create a new car and experiment with the 'accelerate' and 'brake'
methods, and with the getter and setter.
Test data:
§ Data car 1: 'Ford' going at 120 km/h
*/

class CarCl
{
  constructor (make, speed)
  {
    this.make = make;
    this.speed = speed;
  }

  get speedUs ()
  {
    return this.speed / 1.6;
  }

  set speedUs (miPerHour)
  {
    this.speed = miPerHour * 1.6;
  }

  logSpeed ()
  {
    console.log(`${ this.make } going at ${ this.speed } km/h`);
  }

  logSpeedUS ()
  {
    console.log(`${ this.make } going at ${ this.speedUs } mi/h`);
  }

  accelerate ()
  {
    this.speed += 10;
    this.logSpeed();
  }

  brake ()
  {
    this.speed -= 5;
    this.logSpeed();
  }
}

const car3 = new CarCl('Ford', 120);

car3.logSpeed();
car3.logSpeedUS();

for (let j = 0; j < 3; j++)
  car3.accelerate();

car3.logSpeedUS();

for (let k = 0; k < 4; k++)
  car3.brake();

car3.logSpeedUS();

car3.speedUs = 200;
car3.logSpeedUS();
car3.logSpeed();