const mark = {
  fullName: "Mark Miller",
  mass: 78,
  height: 1.69,
  bmi: 0,
  calcBMI: function () {
    let bmi = this.mass / (this.height * this.height);
    this.bmi = bmi;
    return bmi;
  }
};

const john = {
  fullName: "John Smith",
  mass: 92,
  height: 1.95,
  bmi: 0,
  calcBMI: function () {
    let bmi = this.mass / (this.height * this.height);
    this.bmi = bmi;
    return bmi;
  }
};

mark.calcBMI();
john.calcBMI();

if (mark.bmi > john.bmi) {
  console.log(`${mark.fullName}'s BMI (${mark.bmi}) is higher than ${john.fullName}'s (${john.bmi})!`)
} else if (john.bmi > mark.bmi) {
  console.log(`${john.fullName}'s BMI (${john.bmi}) is higher than ${mark.fullName}'s (${mark.bmi})!`)
}