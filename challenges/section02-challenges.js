// Challenge 5

const calcAverage = (score1, score2, score3) => {
    let avr = (score1 + score2 + score3) / 3;
    console.log(avr);
    return avr;
};


function checkWinner(avrTeam1, avrTeam2, nameTeam1, nameTeam2) {
    if (avrTeam1 >= 2 * avrTeam2)
        console.log(`${nameTeam1} win (${avrTeam1} vs. ${avrTeam2})`);
    else if (avrTeam2 >= 2 * avrTeam1)
        console.log(`${nameTeam2} win (${avrTeam2} vs. ${avrTeam1})`);
    else
        console.log("No team wins...");
}

let scoreDolphins = [44, 23, 71];
let scoreKoalas = [23, 34, 27];

let avgDolphins = calcAverage(scoreDolphins[0], scoreDolphins[1], scoreDolphins[2]);
let avgKoalas = calcAverage(scoreKoalas[0], scoreKoalas[1], scoreKoalas[2]);

checkWinner(avgDolphins, avgKoalas, "Dolphins", "Koalas");

// Challenge 6

function calcTipC6(bill) {
    if (bill >= 50 && bill <= 300)
        return bill * 0.15;
    else
        return bill * 0.2;
}

calcTipC6(100);

let billsC6 = [125, 555, 44];
let tipsC6 = [];
let totalsC6 = [];

for (let i = 0; i < billsC6.length; i++) {
    tipsC6.push(calcTipC6(billsC6[i]));
    totalsC6.push(tipsC6[i] + billsC6[i]);
}

// Challenge 7

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

if (mark.bmi > john.bmi)
    console.log(`${mark.fullName}'s BMI (${mark.bmi}) is higher than ${john.fullName}'s (${john.bmi})!`);
else if (john.bmi > mark.bmi)
    console.log(`${john.fullName}'s BMI (${john.bmi}) is higher than ${mark.fullName}'s (${mark.bmi})!`);

// Challenge  8

const calcTipC8 = function (bill) {
    return bill >= 50 && bill <= 300 ? bill * 0.15 : bill * 0.2;
};

const calcAverageC8 = function (arr) {
    let sum = 0;
    let n = arr.length;
    for (let i = 0; i < n; i++)
        sum += arr[i];

    return sum / n;
};

let billsC8 = [22, 295, 176, 440, 37, 105, 10, 1100, 86, 52];
let tipsC8 = [];
let totalsC8 = [];

for (let i = 0; i < billsC8.length; i++) {
    tipsC8[i] = calcTipC8(billsC8[i]);
    totalsC8[i] = billsC8[i] + tipsC8[i];
}

calcAverageC8(totalsC8);