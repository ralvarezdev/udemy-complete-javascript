function calcTip(bill) {
  if (bill >= 50 && bill <= 300) {
    return bill * 0.15
  } else {
    return bill * 0.2;
  }
}

calcTip(100);

let bills = [125, 555, 44]
let tips = [];
let totals = [];

for (let i = 0; i < bills.length; i++) {
  tips.push(calcTip(bills[i]));
  totals.push(tips[i] + bills[i]);
}