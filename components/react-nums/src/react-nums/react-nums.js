import {REACT_NUMBER_DATA_TYPES, REACT_NUMBER_DATA_TYPES_LIST} from "./react-nums-props.js";

export class ReactNumbersHandler{
    #NUMBERS

    constructor(){
        this.#NUMBERS = new Map();
    }

    // - Add, remove and get React Numbers

    // Add React Number
    addReactNumber(reactNumber){
        const id=String(reactNumber.id)

        if(!reactNumber instanceof ReactNumber)
            throw new Error("Invalid React Number")

        if(this.#NUMBERS.has(id))
            throw new Error("React Number already exists")

        this.#NUMBERS.set(id, reactNumber);
    }

    // Change React Number ID
    changeReactNumberId(id){
        id=String(id)

        const reactNumber=this.getReactNumber(id)
        this.#NUMBERS.delete(id)
        this.#NUMBERS.set(reactNumber.id, reactNumber)
    }

    // Get React Number
    getReactNumber(id){
        id=String(id)

        const number = this.#NUMBERS.get(id)
        if(!number)
            throw new Error("React Number not found")

        return number
    }

    // - Validators
    static checkDataType(number_type){
        for(let data_type of REACT_NUMBER_DATA_TYPES_LIST)
            if(data_type===number_type)
                return true

        return false
    }

    static getParsedNumber(data_type, number){
        try {
            if (data_type === REACT_NUMBER_DATA_TYPES.NUMBER){
                number= Number.parseFloat(number)
                if(Number.isNaN(number))
                    return null
            }
            else if (data_type === REACT_NUMBER_DATA_TYPES.BIG_INT)
                number= BigInt(number)
        }
        catch(e){
            return null
        }

        return number
    }

    static isDataType(data_type, number){
        return typeof(number) ===data_type
    }
}

// - Subject class
class Subject{
    #OBSERVERS

    constructor() {
        this.#OBSERVERS = [];
    }

    // - Subscribe and unsubscribe observers

    // Subscribe observer
    subscribeObserver(observer){
        const idx=this.#OBSERVERS.indexOf(observer)
        if(idx===-1)
            this.#OBSERVERS.push(observer)
    }

    // Unsubscribe observer
    unsubscribeObserver(observer){
        const idx=this.#OBSERVERS.indexOf(observer)
        if(idx!==-1)
            this.#OBSERVERS.splice(idx, 1)
    }

    // - Notify all observers
    notifyAll() {
        this.#OBSERVERS.forEach(observer => observer.update());
    }
}

// - Observer class
class Observer{
    update(){
        console.log("Observer updated")
    }
}

// - React Number class
export class ReactNumber extends Subject{
    #REACT_NUMBERS_HANDLER
    #NUMBER
    #DATA_TYPE
    #ID

    constructor(number, number_type, id, reactNumbersHandler){
        super()

        // Check data type
        if(!ReactNumbersHandler.checkDataType(number_type))
            throw new Error("Invalid data type")

        // Get parsed number
        number = ReactNumbersHandler.getParsedNumber(number_type, number)

        // Check if number is valid
        if(!ReactNumbersHandler.isDataType(number_type, number))
            throw new Error("Invalid number type")

        // Check React Numbers Handler
        if(!reactNumbersHandler instanceof ReactNumbersHandler)
            throw new Error("Invalid React Numbers Handler")

        this.number=number;
        this.data_type=number_type;
        this.id=id;
        this.#REACT_NUMBERS_HANDLER=reactNumbersHandler;
        this.reactNumbersHandler.addReactNumber(this)
    }

    // - Getters and setters
    get number(){
        return ReactNumbersHandler.getParsedNumber(this.data_type, this.#NUMBER);
    }

    set number(number){
        this.#NUMBER = number;
        this.notifyAll()
    }

    get data_type(){
        return this.#DATA_TYPE;
    }

    set data_type(number_type){
        this.#DATA_TYPE = number_type;
    }

    get id(){
        return this.#ID;
    }

    set id(id){
        const oldId=this.id
        this.#ID=id;

        if(oldId!==undefined)
            this.reactNumbersHandler.changeReactNumberId(oldId)
    }

    get reactNumbersHandler(){
        return this.#REACT_NUMBERS_HANDLER;
    }
}

// React Number Observer class
class ReactNumberObserver extends Observer{
    #REACT_EQUATION

    constructor(reactEquation){
        super()
        this.#REACT_EQUATION=reactEquation
    }

    update(){
        this.#REACT_EQUATION.calculate()
    }
}

// React Equation class
export class ReactEquation{
    #REACT_NUMBRS_HANDLER
    #EQUATION
    #OPERATORS
    #REACT_NUMBERS
    #UNIQUE_REACT_NUMBERS
    #RESULT

    constructor(reactNumbersHandler){
        if(!reactNumbersHandler instanceof ReactNumbersHandler)
            throw new Error("Invalid React Numbers Handler")

        this.#OPERATORS = [];
        this.#REACT_NUMBERS=[]
        this.#UNIQUE_REACT_NUMBERS=new Map()
        this.#REACT_NUMBRS_HANDLER=reactNumbersHandler
    }

    // - Getters and setters

    // Get Equation result
    get result(){
        if(this.eq===undefined)
            return null

        if(this.#RESULT===null)
            this.calculate()

        return this.#RESULT
    }

    // Get React Numbers Handler
    get reactNumbersHandler(){
        return this.#REACT_NUMBRS_HANDLER
    }

    // Check if it's an operator
    isOperator(c){
        return /^[-+*/^]$/.test(c)
    }

    // Push operator
    #pushOperator(op, operators){
            if(operators.length===0||op==='(')
            {
                operators.push(op)
                return
            }

            if(op===')') {
                while (operators.length > 0 && operators[operators.length - 1] !== '(')
                    this.#OPERATORS.push(operators.pop())
                operators.pop()
                return
            }

            // Lambdas
            const isSum =op=>op==='+'||op==='-'
            const isMultiplication =op=>op==='*'||op==='/'
            const isPower =op=>op==='^'
            const pushResultStack=()=>this.#OPERATORS.push(op)
            const pushTempStack=()=>operators.push(op)
            const substitute=()=>{
                pushResultStack(operators.pop())
                pushTempStack()
            }

            const topOp=operators[operators.length-1]

            if(isSum(op)){
                if(isSum(topOp))
                    substitute()

                else
                    pushResultStack()
            }

            else if(isMultiplication(op)) {
                if(isSum(topOp))
                    pushTempStack()

                else if (isMultiplication(topOp))
                    substitute()

                else
                    pushResultStack()
            }

            else if(isPower(op)){
                if(isSum(topOp)||isMultiplication(topOp))
                    pushTempStack()

                else
                    pushResultStack()
            }
        }

        // Push React Number
        #pushReactNumber(id){
            // Get React Number
            const reactNumber=this.reactNumbersHandler.getReactNumber(id)

            // Check if React Number has already being read by the current equation
            if(!this.#UNIQUE_REACT_NUMBERS.has(reactNumber)) {
                reactNumber.subscribeObserver(new ReactNumberObserver(this))
                this.#UNIQUE_REACT_NUMBERS.set(reactNumber, true)
            }

            this.#REACT_NUMBERS.push(reactNumber)
        }

        // Get equation
    get eq(){
        return this.#EQUATION
    }

    // Set equation
    set eq(eq){
        eq=String(eq)
        this.#EQUATION=eq

        const operators=[]

        for(let i=0,j=0;i<eq.length;i=j+1) {
            for (j = i; j < eq.length; j++)
                if (this.isOperator(eq[j]))
                    break;

            if(j===eq.length)
                this.#pushReactNumber(eq.substring(i,j))

            else if(j===i)
                this.#pushOperator(eq[i], operators)

            else {
                this.#pushReactNumber(eq.substring(i, j))
                this.#pushOperator(eq[j], operators)
            }
        }

        while(operators.length>0)
            this.#OPERATORS.push(operators.pop())

        /*
        console.log(this.#REACT_NUMBERS)
        console.log(this.#OPERATORS)
        */
    }

    // Calculate result of equation
    calculate(){
        this.#RESULT=null
        let n1,n2, op, result;

        const numbers= new Array(this.#REACT_NUMBERS.length)
        const operators=new Array(this.#OPERATORS.length)

        // Load numbers and operations
        this.#REACT_NUMBERS.forEach((reactNumber, idx) => numbers[idx]=reactNumber.number)
        this.#OPERATORS.forEach((operator, idx) => operators[idx]=operator)

        while(numbers.length>1&&operators.length>0){
            n1=numbers.pop()
            n2=numbers.pop()
            op=operators.pop()

            result = this.#calculateOperation(n1, n2, op)
            // console.log(n1,n2, op)

            numbers.push(result)
        }

        return this.#RESULT= result
    }

    // Calculate numeric operation between two numbers
    #calculateOperation(n1, n2, op){
        switch(op){
            case '+':
                return n1+n2;
            case '-':
                return n1-n2;
            case '*':
                return n1*n2;
            case '/':
                return n1/n2;
            case '^':
                return n1**n2;
        }
    }

    //
}

