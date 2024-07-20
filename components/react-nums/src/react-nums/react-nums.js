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

    valueOf(){
        return this.number
    }

    toString(){
        return String(this.number)
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
    static #OPERATORS

    #REACT_NUMBRS_HANDLER
    #EQUATION
    #QUEUE
    #UNIQUE_REACT_NUMBERS
    #RESULT

    static {
        ReactEquation.#OPERATORS=new Map(
            [[')',0],['+',1],['-',1],['*',2],['/',2],['^',3],['(',4]]
        )
    }

    constructor(reactNumbersHandler){
        if(!reactNumbersHandler instanceof ReactNumbersHandler)
            throw new Error("Invalid React Numbers Handler")

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
        return /^[-+*/^()]$/.test(c)
    }

    // Check if it's a decimal number
    isDecimalNumber(s){
        return /^[0-9]*[,.]?[0-9]*$/.test(s)
    }

    // Check if it has higher priority
    #hasHigherPriority(op1,op2){
        return ReactEquation.#OPERATORS.get(op1)>ReactEquation.#OPERATORS.get(op2)
    }

    // Push operator
    #pushOperator(op, operators){
            // Lambdas
            const pushResultStack=op=>this.#QUEUE.push(op)
            const pushTempStack=op=>operators.push(op)

            const getTopOp=()=>operators[operators.length-1]

            if(op===')'){
                while(operators.length>0&&getTopOp()!=='(')
                    pushResultStack(operators.pop())

                operators.pop()
                return
            }

            if(operators.length===0||this.#hasHigherPriority(op,getTopOp()))
                operators.push(op)

            else{
                while(operators.length>0&&!this.#hasHigherPriority(op,getTopOp())&&getTopOp()!=='(')
                    pushResultStack(operators.pop())

                pushTempStack(op)
            }
        }

        // Push React Number
        #pushReactNumber(id){
            // Get React Number
            const reactNumber=this.reactNumbersHandler.getReactNumber(id)

            // Check if React Number has already being read by the current equation
            if(!this.#UNIQUE_REACT_NUMBERS.has(reactNumber)) {
                const observer =new ReactNumberObserver(this)
                reactNumber.subscribeObserver(observer)
                this.#UNIQUE_REACT_NUMBERS.set(reactNumber, observer)
            }

            this.#QUEUE.push(reactNumber)
        }

        // Push number
    #pushNumber(number){
        const parsed=parseFloat(number)

        if(isNaN(parsed))
            throw new Error("Invalid number")

        this.#QUEUE.push(parsed)
    }

        // Reset values
    #reset(){
        this.#QUEUE=[]
        this.#RESULT=null

        if(this.#UNIQUE_REACT_NUMBERS!==undefined){
            let reactNumber, observer
            for(let key of this.#UNIQUE_REACT_NUMBERS.keys()) {
                reactNumber=key
                observer = this.#UNIQUE_REACT_NUMBERS.get(key)
                reactNumber.unsubscribeObserver(observer)
            }
        }

        this.#UNIQUE_REACT_NUMBERS=new Map()
    }

        // Get equation
    get eq(){
        return this.#EQUATION
    }

    // Set equation
    set eq(eq){
        eq=String(eq)
        this.#EQUATION=eq
        this.#reset()

        const operators=[]
        const pushSubstring=(s, isDecimalNumber)=>{
            if(!isDecimalNumber)
                this.#pushReactNumber(s)

                // Validate the complete string
            else if(!this.isDecimalNumber(s))
                throw new Error("Invalid number")

            else
                this.#pushNumber(s)
        }

        for(let i=0,j=0, isDecimalNumber,s;i<eq.length;i=j+1) {
            isDecimalNumber=this.isDecimalNumber(eq[i])

            for (j = i; j < eq.length; j++)
                if (this.isOperator(eq[j]))
                    break;

            if(j===i&&i!==eq.length) {
                this.#pushOperator(eq[i], operators)
                continue
            }

            s=eq.substring(i,j)

            if(j===eq.length)
                pushSubstring(s, isDecimalNumber)

            else {
                pushSubstring(s, isDecimalNumber)
                this.#pushOperator(eq[j], operators)
            }
        }

        while(operators.length>0)
            this.#QUEUE.push(operators.pop())

        /*
        console.log(this.#REACT_NUMBERS)
        console.log(this.#OPERATORS)
        */
    }

    // Calculate result of equation
    calculate(){
        this.#RESULT=null
        let n1,n2, op, t, result;

        const queue=[...this.#QUEUE]

        if(queue.length===0)
            return this.#RESULT=null

        if(queue.length===1)
            return this.#RESULT=queue.pop()

        const reactNumbersStack=[]

        while(queue.length>0){
            //console.table([queue,reactNumbersStack])
            t= queue.shift()

            if(!this.isOperator(t))
                reactNumbersStack.push(t)

            else
            {
                op=t
                n2=reactNumbersStack.pop()
                n1=reactNumbersStack.pop()
                //console.log(n1,n2,op)

                result = this.#calculateOperation(n1, n2, op)
                reactNumbersStack.push(result)
            }
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

    valueOf()
    {
        return this.result
    }

    toString()
    {
        return String(this.result)
    }
}