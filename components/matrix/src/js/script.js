'use strict';

class Matrix
{
  #NAME;
  #matrix; // Actually, yMap
  #x = 0;
  #y = 0;
  #EMPTY = 0;
  #PRECISION = 6;
  #SPACING = 3;
  #maxNumber = 0;

  constructor (name, x, y)
  {
    if (typeof (name) !== 'string')
      throw new Error("Name attribute must be a string...");

    this.#NAME = name;
    this.#resetMatrix();
    this.element(x, y);
  }

  #resetMatrix ()
  {
    this.#matrix = new Map();
  }

  getNumberRows ()
  {
    return this.#y;
  }

  getNumberColumns ()
  {
    return this.#x;
  }

  async loadJSON (url)
  {
    this.#y = this.#x = 0;
    this.#resetMatrix();

    const fetchPromise =
      fetch(url)
        .then(response =>
        {
          if (!response.ok)
            throw new Error(`HTTP STATUS: ${ response.status }`);

          return response.json();
        })
        .then(cellsContent =>
        {
          // Set initial size
          this.element(1, 1);

          // Get max columns and rows
          let maxRows = 0, maxColumns = 0;

          for (let y in cellsContent)
          {
            const parsedY = parseInt(y);

            if (parsedY > maxRows)
            {
              this.addRows(maxRows - parsedY);
              maxRows = parsedY;
            }

            for (let x in cellsContent[parsedY])
            {
              const parsedX = parseInt(x);

              if (parsedX > maxColumns)
              {
                this.addColumns(maxColumns - parsedX);
                maxColumns = parsedX;
              }

              // Set cells
              const parsedValue = parseFloat(cellsContent[parsedY][parsedX]);
              this.setElement(parsedX, parsedY, parsedValue);
            }
          }
        });

    return await fetchPromise;
  }

  #checkInteger (number)
  {
    // Check number type and range
    let parsedN = NaN;

    if (number !== undefined)
      parsedN = parseInt(number);

    return (isNaN(parsedN) || parsedN < 0) ? 1 : parsedN;
  }

  #checkCoordinates (x, y)
  {
    if (isNaN(x) || x < 0 || x >= this.#x || isNaN(y) || y < 0 || y >= this.#y)
    {
      console.error("Coordinates are invalid...");
      return false;
    }
    return true;
  }

  addColumns (x)
  {
    const parsedX = this.#checkInteger(x);
    const total = this.getNumberColumns() + parsedX;

    for (let i = 0; i < this.getNumberRows(); i++)
    {
      const columnsMap = this.#matrix.get(i);

      for (let j = this.getNumberColumns(); j < total; j++)
        columnsMap.set(j, this.#EMPTY);
    }

    this.#x = total;
  }

  addRows (y)
  {
    const parsedY = this.#checkInteger(y);
    const total = this.getNumberRows() + parsedY;

    for (let i = this.getNumberRows(); i < total; i++)
    {
      const columnsMap = new Map();

      for (let j = 0; j < this.getNumberColumns(); j++)
        columnsMap.set(j, this.#EMPTY);

      this.#matrix.set(i, columnsMap);
    }

    this.#y = total;
  }

  element (x, y)
  {
    this.addRows(y);
    this.addColumns(x);
  }

  hasSameNumberRows (matrix)
  {
    return this.getNumberRows() === matrix.getNumberRows();
  }

  hasSameNumberColumns (matrix)
  {
    return this.getNumberColumns() === matrix.getNumberColumns();
  }

  hasSameDimensions (matrix)
  {
    return this.hasSameNumberRows(matrix) && this.hasSameNumberColumns(matrix);
  }

  printMatrix ()
  {
    let matrixMsg = `- '${ this.#NAME.toUpperCase() }' MATRIX -\n`;

    // Get the length of the biggest whole number
    let maxLength = this.#PRECISION + 1;
    for (let tempValue = Math.abs(Math.round(this.#maxNumber)); tempValue >= 1; maxLength++)
      tempValue /= 10;

    for (let [_, columnsMap] of this.#matrix.entries())
    {
      for (let [_, element] of columnsMap.entries())
      {
        const [wholeNumberStr, decimalNumberStr] = element.toFixed(this.#PRECISION).split(".");
        const wholeNumber=parseInt(wholeNumberStr)
        const decimalNumber=parseInt(decimalNumberStr)

        let elementStr = String(wholeNumber);
        let diff = this.#SPACING +1;

        if (!isNaN(decimalNumber)&&decimalNumber >0)
          elementStr += '.' + decimalNumberStr.substring(0, this.#PRECISION);

        if (wholeNumber >= 0) {
          matrixMsg += (wholeNumberStr[0]==='-'&&decimalNumber>0)?'-' :' ';
          diff--;
        }

        matrixMsg += elementStr + ' '.repeat(maxLength - elementStr.length + diff);
      }

      matrixMsg += '\n';
    }

    console.log(matrixMsg);
  }

  getElement (x, y)
  {
    if (this.#checkCoordinates(x, y))
      return this.#matrix.get(y).get(x);
  }

  getRow (y)
  {
    if (this.#checkCoordinates(0, y))
    {
      const rowMap = new Map();

      for (let [x, element] of this.#matrix.get(y).entries())
        rowMap.set(x, element);

      return rowMap;
    }
    return null;
  }

  getColumn (x)
  {
    if (this.#checkCoordinates(x, 0))
    {
      const columnMap = new Map();

      for (let [y, rowMap] of this.#matrix.entries())
        columnMap.set(y, rowMap.get(x));

      return columnMap;
    }
    return null;
  }

  setElement (x, y, value)
  {
    let parsedValue = parseFloat(value);

    if (isNaN(parsedValue))
    {
      console.error("Invalid value. It must be a float number...");
      return;
    }

    const parsedX = parseInt(x);
    const parsedY = parseInt(y);

    if (!this.#checkCoordinates(parsedX, parsedY))
      return;

    if (this.#maxNumber < parsedValue)
      this.#maxNumber = parsedValue;

    this.#matrix.get(parsedY).set(parsedX, parsedValue);
  }

  #sameDimensionsOp (resultMatrixName, matrix, func)
  {
    const resultMatrix = new Matrix(resultMatrixName, this.getNumberColumns(), this.getNumberRows());

    if (!this.hasSameDimensions(matrix))
      throw new Error("Matrices must have the same dimensions...");

    for (let y = 0; y < this.getNumberRows(); y++)
      for (let x = 0; x < this.getNumberColumns(); x++)
      {
        let matrix1Element = this.getElement(x, y);
        let matrix2Element = matrix.getElement(x, y);

        resultMatrix.setElement(x, y, func(matrix1Element, matrix2Element));
      }

    return resultMatrix;
  }

  sum (resultMatrixName, matrix)
  {
    return this.#sameDimensionsOp(resultMatrixName, matrix, (matrix1Element, matrix2Element) => matrix1Element + matrix2Element);
  }

  subtract (resultMatrixName, matrix)
  {
    return this.#sameDimensionsOp(resultMatrixName, matrix, (matrix1Element, matrix2Element) => matrix1Element - matrix2Element);
  }

  scalarProduct (resultMatrixName, scalar)
  {
    const parsedScalar = parseFloat(scalar);
    const resultMatrix = new Matrix(resultMatrixName, this.getNumberColumns(), this.getNumberRows());

    if (isNaN(parsedScalar))
      throw new Error("Scalar must be either an integer or a float number...");

    for (let y = 0; y < this.getNumberRows(); y++)
      for (let x = 0; x < this.getNumberColumns(); x++)
      {
        let matrixElement = this.getElement(x, y);
        resultMatrix.setElement(x, y, matrixElement * parsedScalar);
      }

    return resultMatrix;
  }

  transpose (resultMatrixName)
  {
    const resultMatrix = new Matrix(resultMatrixName, this.getNumberRows(), this.getNumberColumns());

    for (let y = 0; y < this.getNumberRows(); y++)
      for (let x = 0; x < this.getNumberColumns(); x++)
        resultMatrix.setElement(y, x, this.getElement(x, y));

    return resultMatrix;
  }

  product (resultMatrixName, matrix)
  {
    const resultMatrix = new Matrix(resultMatrixName, this.getNumberColumns(), this.getNumberRows());

    if (this.getNumberColumns() !== matrix.getNumberRows())
      throw new Error("Columns number on first matrix must be the same as the rows number on the second matrix...");

    for (let y = 0; y < this.getNumberRows(); y++)
    {
      const rowMap = this.getRow(y);

      for (let [x, _] of rowMap.entries())
      {
        const columnMap = matrix.getColumn(x);
        let result = 0;

        for (let [iter, element] of rowMap.entries())
          result += element * columnMap.get(iter);

        resultMatrix.setElement(x, y, result);
      }
    }

    return resultMatrix;
  }

  determinant ()
  {
    const numberColumns = this.getNumberColumns();
    const numberRows = this.getNumberRows();

    if (numberColumns !== numberRows)
      throw new Error("Matrix must have the same number of columns as rows...");

    if (numberColumns === 2)
    {
      let innerProduct1 = 1, innerProduct2 = -1;

      for (let i = 0; i < numberColumns; i++)
        innerProduct1 *= this.getElement(i, i);

      for (let i = numberColumns - 1, j = 0; i >= 0; i--, j++)
        innerProduct2 *= this.getElement(i, j);

      return innerProduct1 + innerProduct2;
    }

    let result = 0;

    for (let i = 0, j = 0; i < numberColumns; i++)
    {
      const scalar = (i % 2 === 0) ? 1 : -1;
      const minorMatrix = this.minor('MINOR', i, j);

      result += minorMatrix.determinant() * scalar * this.getElement(i, j);
    }
    return result;
  }

  minor (resultMatrixName, x, y)
  {
    const minorMatrix = new Matrix(resultMatrixName, this.getNumberColumns() - 1, this.getNumberRows() - 1);
    let yCounter = 0;

    for (let [yEntry, rowMap] of this.#matrix.entries())
    {
      let xCounter = 0;

      if (yEntry === y)
        continue;

      for (let [xEntry, element] of rowMap.entries())
      {
        if (xEntry === x)
          continue;

        minorMatrix.setElement(xCounter++, yCounter, element);
      }
      yCounter++;
    }
    return minorMatrix;
  }

  cofactorMatrix (resultMatrixName) 
  {
    const transposeMatrix = this.transpose('TRANSPOSE');
    const cofactorMatrix = new Matrix(resultMatrixName, this.getNumberColumns(), this.getNumberRows());

    for (let [y, rowMap] of this.#matrix.entries())
      for (let [x, _] of rowMap.entries())
      {
        const scalar = ((x + y) % 2) === 0 ? 1 : -1;
        const minorMatrix = transposeMatrix.minor('MINOR', x, y);
        const element = minorMatrix.determinant() * scalar;

        cofactorMatrix.setElement(x, y, element);
      }
    return cofactorMatrix;
  };

  inverse (resultMatrixName)
  {
    if (this.determinant() === 0)
      return null;

    const cofactorMatrix = this.cofactorMatrix('COFACTOR');
    return cofactorMatrix.scalarProduct(resultMatrixName, 1 / this.determinant());
  }

  division(resultMatrixName, matrix)
  {
    if (matrix.determinant() === 0)
      return null;

    const matrixInverse=matrix.inverse('INVERSE 1')

    const result1=matrixInverse.product(`${resultMatrixName} RESULT 1`, this)
    const result2=this.product(`${resultMatrixName} RESULT 2`, matrixInverse)

    return [result1, result2];
  }
}

// - Testing

const matrix1 = new Matrix("N1");
matrix1.loadJSON('./src/json/matrix1.json').then(() => matrix1.printMatrix());

const matrix2 = new Matrix("N2");
matrix2.loadJSON('./src/json/matrix2.json').then(() => matrix2.printMatrix()).then(
  () =>
  {
    // Sum
    const sumMatrix = matrix1.sum("SUM", matrix2);
    sumMatrix.printMatrix();

    // Subtract
    const subtractMatrix = matrix1.subtract("SUBTRACT", matrix2);
    subtractMatrix.printMatrix();

    // Scalar product
    const scalarProductMatrix = matrix1.scalarProduct("SCALAR PRODUCT", 2);
    scalarProductMatrix.printMatrix();

    // Transpose
    const transposeMatrix = matrix1.transpose("TRANSPOSE");
    transposeMatrix.printMatrix();

    const determinant = matrix1.determinant();
    console.log(`- DETERMINANT -\n${ determinant }`);

    // Product
    const productMatrix = matrix1.product("PRODUCT", matrix2);
    productMatrix.printMatrix();

    // Inverse
    const inverseMatrix = matrix2.inverse("INVERSE");
    if(inverseMatrix!==null)
      inverseMatrix.printMatrix();


    // Division
    const divisionMatrixResults = matrix1.division("DIVISION", matrix2);
    if(divisionMatrixResults!==null)
      divisionMatrixResults.forEach(divisionMatrix=>divisionMatrix.printMatrix());
  });