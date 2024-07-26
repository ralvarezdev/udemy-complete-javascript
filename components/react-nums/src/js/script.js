import {REACT_NUMBER} from "../react-nums/react-nums-props.js";
import {ReactNumbersHandler, ReactNumber, ReactEquation} from "../react-nums/react-nums.js";

const groupA = new ReactNumbersHandler( REACT_NUMBER.DATA_TYPES.NUMBER)

const a = new ReactNumber(1,"a", groupA)
const b = new ReactNumber(2, "b", groupA)

const z = new ReactEquation(groupA)
z.eq = "a+b"

console.log(a+b)
console.log(z.result)

a.number = 10
b.number = 20

console.log(a + b)
console.log(z.result)

const c = new ReactNumber(3, "c", groupA)

z.eq = "(a+b*c+(a*b)/c-c)*c*2.5"

console.log((a+b*c+(a*b)/c-c)*c*2.5)
console.log(z.result)

c.number = 5

console.log((a+b*c+(a*b)/c-c)*c*2.5)
console.log(z.result)

z.eq = "a"

console.log(a.valueOf())
console.log(z.result)