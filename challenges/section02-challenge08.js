const calcTip = function (bill) {
  return bill >= 50 && bill <= 300 ? bill * 0.15 : bill * 0.2;
}

const calcAverage = function(arr){
    let sum =0;
    let n = arr.length
    for(let i=0;i<n;i++){
        sum+=arr[i];
    }
    return sum/n;
}

let bills =[22,295,176,440,37,105,10,1100,86,52];
let tips=[];
let totals=[];

for(let i=0;i<bills.length;i++){
    tips[i]=calcTip(bills[i]);
    totals[i]=bills[i]+tips[i];
}

calcAverage(totals);