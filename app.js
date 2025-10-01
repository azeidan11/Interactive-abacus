let currentBase = 10;
let numDigits = 6;
let digitValues = [];
let lastResult = null;

// Helper for bead state class (single selection)
function beadClassFor(digitValue, beadValue) {
  if (beadValue === digitValue) {
    return digitValue === 0 ? 'selected-zero' : 'selected';
  }
  return 'unselected';
}

function init() {
  resetValues();
  createRods();
  updateDisplay();
}

function resetValues() {
  // Initialize all visible digits to 0 so each rod highlights zero (green)
  digitValues = new Array(numDigits).fill(0);
}

function showTool(evt, toolName) {
  document.querySelectorAll('.tool-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(toolName).classList.add('active');
  if (evt && evt.target) evt.target.classList.add('active');

  if (toolName === 'abacus' && !document.getElementById('rodsContainer').children.length) {
    createRods();
  }
}

function createRods() {
  const container = document.getElementById('rodsContainer');
  container.innerHTML = '';

  for (let i = numDigits - 1; i >= 0; i--) {
    const rod = document.createElement('div');
    rod.className = 'rod';
    rod.id = `rod${i}`;

    const placeLabel = document.createElement('div');
    placeLabel.className = 'place-value';
    placeLabel.textContent = `${currentBase}^${i}`;
    rod.appendChild(placeLabel);

    const beadArea = document.createElement('div');
    beadArea.className = 'bead-area';

    for (let j = currentBase - 1; j >= 0; j--) {
      const beadRow = document.createElement('div');
      beadRow.className = 'bead-row';

      const valueLabel = document.createElement('span');
      valueLabel.className = 'value-label';
      valueLabel.textContent = (currentBase <= 10) ? j.toString() : (j < 10 ? j.toString() : String.fromCharCode(65 + j - 10));
      beadRow.appendChild(valueLabel);

      const bead = document.createElement('div');
      const cls = beadClassFor(digitValues[i], j);
      bead.className = `bead ${cls}`;
      bead.onclick = () => setBeadValue(i, j);
      beadRow.appendChild(bead);

      beadArea.appendChild(beadRow);
    }

    rod.appendChild(beadArea);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const decBtn = document.createElement('button');
    decBtn.className = 'decrement-btn';
    decBtn.textContent = '-';
    decBtn.onclick = () => decrementDigit(i);

    const incBtn = document.createElement('button');
    incBtn.className = 'increment-btn';
    incBtn.textContent = '+';
    incBtn.onclick = () => incrementDigit(i);

    buttons.appendChild(decBtn);
    buttons.appendChild(incBtn);
    rod.appendChild(buttons);

    container.appendChild(rod);
  }
}

function setBeadValue(digitIndex, value) {
  digitValues[digitIndex] = value;
  updateRodDisplay(digitIndex);
  updateDisplay();
}

// (kept for compatibility)
function toggleBead(digitIndex, beadIndex) {
  setBeadValue(digitIndex, beadIndex);
}

function incrementDigit(digitIndex) {
  digitValues[digitIndex]++;
  if (digitValues[digitIndex] >= currentBase) {
    digitValues[digitIndex] = 0;
    if (digitIndex < numDigits - 1) {
      incrementDigit(digitIndex + 1);
      animateCarry(digitIndex + 1);
    }
  }
  updateRodDisplay(digitIndex);
  updateDisplay();
}

function decrementDigit(digitIndex) {
  digitValues[digitIndex]--;
  if (digitValues[digitIndex] < 0) {
    digitValues[digitIndex] = currentBase - 1;
    if (digitIndex < numDigits - 1) {
      decrementDigit(digitIndex + 1);
    }
  }
  updateRodDisplay(digitIndex);
  updateDisplay();
}

function updateRodDisplay(digitIndex) {
  const rod = document.getElementById(`rod${digitIndex}`);
  if (!rod) return;
  const beadRows = rod.querySelectorAll('.bead-row');
  beadRows.forEach((row, index) => {
    const bead = row.querySelector('.bead');
    const beadValue = currentBase - 1 - index; // rows are top→bottom high→low
    const cls = beadClassFor(digitValues[digitIndex], beadValue);
    bead.className = `bead ${cls}`;
  });
}

function animateCarry(digitIndex) {
  const rod = document.getElementById(`rod${digitIndex}`);
  rod.classList.add('carry-animation');
  setTimeout(() => rod.classList.remove('carry-animation'), 500);
}

function updateDisplay() {
  let displayStr = '';
  let decimalValue = 0;

  for (let i = numDigits - 1; i >= 0; i--) {
    const digit = digitValues[i];
    displayStr += (currentBase <= 10) ? digit.toString() : (digit < 10 ? digit.toString() : String.fromCharCode(65 + digit - 10));
    decimalValue += digit * Math.pow(currentBase, i);
  }

  document.getElementById('displayValue').textContent = displayStr || '0';
  document.getElementById('decimalValue').textContent = `Decimal: ${decimalValue}`;

  document.getElementById('binaryValue').textContent = decimalValue.toString(2);
  document.getElementById('octalValue').textContent = decimalValue.toString(8);
  document.getElementById('decimalValueComp').textContent = decimalValue.toString(10);
  document.getElementById('hexValue').textContent = decimalValue.toString(16).toUpperCase();
}

function changeBase() {
  currentBase = parseInt(document.getElementById('baseSelect').value, 10);

  for (let i = 0; i < numDigits; i++) {
    if (digitValues[i] >= currentBase) digitValues[i] = 0;
  }

  const baseNames = {2:'Binary',4:'Quaternary',8:'Octal',10:'Decimal',16:'Hexadecimal'};
  document.getElementById('baseInfo').textContent = `Base ${currentBase} (${baseNames[currentBase]})`;

  createRods();
  updateDisplay();
}

function changeDigits() {
  const newDigits = parseInt(document.getElementById('digitsSelect').value, 10);

  if (newDigits < numDigits) {
    digitValues = digitValues.slice(0, newDigits);
  } else {
    while (digitValues.length < newDigits) digitValues.push(0);
  }

  numDigits = newDigits;
  // Normalize array to exact size and zeros
  digitValues = digitValues.slice(0, numDigits);
  while (digitValues.length < numDigits) digitValues.push(0);
  createRods();
  updateDisplay();
}

function resetAbacus() {
  resetValues();
  createRods();
  updateDisplay();
}

function showCalculator() {
  const calc = document.getElementById('calculatorMode');
  const step = document.getElementById('stepByStepMode');
  if (calc.style.display === 'none' || calc.style.display === '') {
    calc.style.display = 'block'; step.style.display = 'none';
  } else {
    calc.style.display = 'none';
  }
}

function showStepByStep() {
  const calc = document.getElementById('calculatorMode');
  const step = document.getElementById('stepByStepMode');
  if (step.style.display === 'none' || step.style.display === '') {
    step.style.display = 'block'; calc.style.display = 'none';
  } else {
    step.style.display = 'none';
  }
}

function parseNumber(numStr, base) {
  if (!numStr) return 0;
  return parseInt(numStr, base);
}

function numberToBase(num, base) {
  if (num === 0) return '0';
  let result = '';
  while (num > 0) {
    const digit = num % base;
    result = (digit < 10 ? digit : String.fromCharCode(65 + digit - 10)) + result;
    num = Math.floor(num / base);
  }
  return result;
}

function performOperation() {
  const operand1 = document.getElementById('operand1').value;
  const operand2 = document.getElementById('operand2').value;
  const operation = document.getElementById('operation').value;

  if (!operand1 || !operand2) {
    document.getElementById('calcResult').textContent = 'Please enter both numbers';
    return;
  }

  const num1 = parseNumber(operand1, currentBase);
  const num2 = parseNumber(operand2, currentBase);
  let result;
  let resultText = '';

  try {
    switch (operation) {
      case 'add':
        result = num1 + num2;
        resultText = `${operand1} + ${operand2} = ${numberToBase(result, currentBase)} (base ${currentBase})`;
        break;
      case 'subtract':
        result = num1 - num2;
        resultText = `${operand1} - ${operand2} = ${numberToBase(Math.abs(result), currentBase)} (base ${currentBase})`;
        if (result < 0) resultText += ' [NEGATIVE]';
        break;
      case 'multiply':
        result = num1 * num2;
        resultText = `${operand1} × ${operand2} = ${numberToBase(result, currentBase)} (base ${currentBase})`;
        break;
      case 'divide':
        if (num2 === 0) {
          resultText = 'Error: Division by zero';
          break;
        }
        result = Math.floor(num1 / num2);
        const remainder = num1 % num2;
        resultText = `${operand1} ÷ ${operand2} = ${numberToBase(result, currentBase)}`;
        if (remainder > 0) resultText += ` remainder ${numberToBase(remainder, currentBase)}`;
        resultText += ` (base ${currentBase})`;
        break;
      case 'mod':
        if (num2 === 0) {
          resultText = 'Error: Modulo by zero';
          break;
        }
        result = num1 % num2;
        resultText = `${operand1} mod ${operand2} = ${numberToBase(result, currentBase)} (base ${currentBase})`;
        break;
      case 'power':
        result = Math.pow(num1, num2);
        if (result > 1000000) {
          resultText = 'Result too large to display';
          break;
        }
        resultText = `${operand1}^${operand2} = ${numberToBase(result, currentBase)} (base ${currentBase})`;
        break;
    }

    lastResult = Math.abs(result);
    document.getElementById('calcResult').innerHTML = `${resultText}<br><small>Decimal: ${lastResult}</small>`;

    if (lastResult !== undefined && !isNaN(lastResult) && lastResult !== null) {
      document.getElementById('useResultBtn').style.display = 'inline-block';
    }
  } catch {
    document.getElementById('calcResult').textContent = 'Error in calculation';
  }
}

function useResult() {
  if (lastResult === null || lastResult === undefined) return;
  setAbacusValue(lastResult);
}

function setAbacusValue(decimalValue) {
  resetValues();
  let value = Math.abs(Math.floor(decimalValue));
  for (let i = 0; i < numDigits && value > 0; i++) {
    digitValues[i] = value % currentBase;
    value = Math.floor(value / currentBase);
  }
  createRods();
  updateDisplay();
}

function startAddition() {
  const display = document.getElementById('stepDisplay');
  display.innerHTML = `
    <h4>Addition in Base ${currentBase}</h4>
    <p>Adding numbers works the same in any base - you carry when the sum equals or exceeds the base.</p>
    <div class="step-example">
      <strong>Example: Adding ${currentBase === 10 ? '127 + 56' : '23 + 12'} in base ${currentBase}</strong><br><br>
      ${getAdditionSteps()}
    </div>
    <p><strong>Try it:</strong></p>
    <ol>
      <li>Set the first number on the abacus</li>
      <li>Use the + buttons to add the second number, column by column</li>
      <li>Watch how carries work automatically!</li>
    </ol>`;
}

function startSubtraction() {
  const display = document.getElementById('stepDisplay');
  display.innerHTML = `
    <h4>Subtraction in Base ${currentBase}</h4>
    <p>Subtraction requires borrowing when a digit is smaller than what you're subtracting.</p>
    <div class="step-example">
      <strong>Example: Subtracting ${currentBase === 10 ? '152 - 67' : '32 - 15'} in base ${currentBase}</strong><br><br>
      ${getSubtractionSteps()}
    </div>
    <p><strong>Try it:</strong></p>
    <ol>
      <li>Set the larger number on the abacus</li>
      <li>Use the - buttons to subtract, column by column</li>
      <li>Watch how borrowing works across columns!</li>
    </ol>`;
}

function startMultiplication() {
  const display = document.getElementById('stepDisplay');
  display.innerHTML = `
    <h4>Multiplication in Base ${currentBase}</h4>
    <p>Multiplication is repeated addition with place value shifts.</p>
    <div class="step-example">
      <strong>Example: ${currentBase === 10 ? '23 × 12' : '12 × 3'} in base ${currentBase}</strong><br><br>
      ${getMultiplicationSteps()}
    </div>
    <p><strong>Try it:</strong></p>
    <ol>
      <li>Start with the first number on the abacus</li>
      <li>Add that number to itself multiple times</li>
      <li>Or use the calculator mode for quick results!</li>
    </ol>`;
}

function startDivision() {
  const display = document.getElementById('stepDisplay');
  display.innerHTML = `
    <h4>Division in Base ${currentBase}</h4>
    <p>Division is repeated subtraction - see how many times the divisor fits into the dividend.</p>
    <div class="step-example">
      <strong>Example: ${currentBase === 10 ? '84 ÷ 12' : '20 ÷ 4'} in base ${currentBase}</strong><br><br>
      ${getDivisionSteps()}
    </div>
    <p><strong>Try it:</strong></p>
    <ol>
      <li>Set the dividend (number to be divided) on the abacus</li>
      <li>Subtract the divisor repeatedly</li>
      <li>Count how many times you can subtract - that's your quotient!</li>
    </ol>`;
}

function getAdditionSteps() {
  if (currentBase === 10) {
    return `127<br>+ 56<br>----<br>Right: 7 + 6 = 13 → write 3 carry 1<br>Middle: 2 + 5 + 1 = 8<br>Left: 1 + 0 = 1<br><span class="highlight">Result: 183</span>`;
  } else if (currentBase === 2) {
    return `101<br>+ 011<br>----<br>1+1=10 → write 0 carry 1<br>0+1+1=10 → write 0 carry 1<br>1+0+1=10<br><span class="highlight">Result: 1000 (base 2)</span>`;
  } else if (currentBase === 8) {
    return `25<br>+ 17<br>----<br>5+7=14₈ (carry 1)<br>2+1+1=4<br><span class="highlight">Result: 44 (base 8)</span>`;
  } else if (currentBase === 16) {
    return `2A<br>+ 1F<br>----<br>A+F=19₁₆ (carry 1) → 9 carry 1<br>2+1+1=4<br><span class="highlight">Result: 49 (base 16)</span>`;
  } else {
    return `12<br>+ 13<br>----<br>2+3=5<br>1+1=2<br><span class="highlight">Result: 25 (base ${currentBase})</span>`;
  }
}

function getSubtractionSteps() {
  if (currentBase === 10) {
    return `152<br>- 67<br>----<br>Borrow: 12-7=5<br>Borrow: 14-6=8<br>Left: 0<br><span class="highlight">Result: 85</span>`;
  } else if (currentBase === 2) {
    return `101<br>- 011<br>----<br>Right:1-1=0<br>Borrow:0-1 → 10-1=1<br>Left:0<br><span class="highlight">Result: 010 (base 2)</span>`;
  } else if (currentBase === 8) {
    return `32<br>- 15<br>----<br>Borrow: (2+8)-5=5<br>Left:2-1=1<br><span class="highlight">Result: 15 (base 8)</span>`;
  } else if (currentBase === 16) {
    return `23<br>- 14<br>----<br>Borrow: (3+16)-4=15=F<br>Left:1-1=0<br><span class="highlight">Result: F (base 16)</span>`;
  } else {
    return `23<br>- 14<br>----<br>Borrow: (3+${currentBase})-4=${numberToBase(3+currentBase-4,currentBase)}<br>Left:1-1=0<br><span class="highlight">Result: ${numberToBase(3+currentBase-4,currentBase)} (base ${currentBase})</span>`;
  }
}

function getMultiplicationSteps() {
  if (currentBase === 10) {
    return `23 × 12 → 23×2=46; 23×10=230; 46+230=<span class="highlight">276</span>`;
  } else if (currentBase === 2) {
    return `101 × 11 → 101 + 1010 = <span class="highlight">1111 (base 2)</span>`;
  } else if (currentBase === 16) {
    return `A × 3 = 10×3=30₁₀= <span class="highlight">1E</span>`;
  } else {
    const num1 = parseInt('12', currentBase);
    const num2 = 3;
    const result = num1 * num2;
    return `12 × 3 → ${num1}×3=${result}₁₀ → <span class="highlight">${numberToBase(result,currentBase)} (base ${currentBase})</span>`;
  }
}

function getDivisionSteps() {
  if (currentBase === 10) {
    return `84 ÷ 12 → 12×7=84 → <span class="highlight">7</span>`;
  } else if (currentBase === 2) {
    return `1100 ÷ 11: 12₁₀ ÷ 3₁₀ = 4₁₀ = <span class="highlight">100 (base 2)</span>`;
  } else if (currentBase === 16) {
    return `20₁₆ ÷ 4₁₆ → 32₁₀ ÷ 4₁₀ = 8₁₀ = <span class="highlight">8 (base 16)</span>`;
  } else {
    const dividend = parseInt('20', currentBase);
    const divisor  = parseInt('4', currentBase);
    const quotient = Math.floor(dividend / divisor);
    return `20 ÷ 4 → ${dividend} ÷ ${divisor} = ${quotient}₁₀ → <span class="highlight">${numberToBase(quotient,currentBase)} (base ${currentBase})</span>`;
  }
}

window.onload = init;