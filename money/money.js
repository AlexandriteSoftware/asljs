
/**
 * Converts the money amount to a string.
 * 
 * Available formats:
 * 
 * - 'f' - full, e.g. '1,234.56 USD', '-1,123', '0.00' (default)
 * - 'c' - compact, e.g. '123.45', '-1123', '0'
 * 
 * @param {string} format The format of the string representation.
 * @returns {string} The string representation of the money amount.
 */
function toString(format = 'f') {
  if (format === 'c')
    return String(this.value / 100);

  const value = this.value;
  const sign = value < 0 ? '-' : '';
  const digits = Math.abs(value).toString().padStart(3, '0');
  let text = `.${digits.substring(digits.length - 2, digits.length)}`;
  let index = digits.length - 2;
  while (true) {
    if (index - 3 > 0) {
      text = `,${digits.substring(index - 3, index)}` + text;
      index -= 3;
    } else {
      text = `${digits.substring(0, index)}` + text;
      break;
    }
  }

  const amountText =
    `${sign}${text}`;

  return this.currency
    ? `${amountText} ${this.currency}`
    : amountText;
}

/**
 * Converts the amount to a JavaScript number.
 * 
 * @returns {number} The number representation of the money amount.
 */
function toNumber() {
  return this.value / 100;
}

/**
 * Adds the specified amounts to the current amount.
 * 
 * @returns {Money} The sum of the current amount and the specified amounts.
 */
function add() {
  const values = [...arguments];
  for (const v of values) {
    currencyGuard(this.currency, v.currency);
  }
  const sum = values.reduce((acc, v) => acc + v.value, this.value);
  return money(sum, this.currency);
}

/**
 * Substracts the specified amounts from the current amount.
 * 
 * @returns {Money} The difference between the current amount and the specified amounts.
 */
function subtract() {
  const values = [...arguments];
  for (const v of values) {
    currencyGuard(this.currency, v.currency);
  }
  const diff = values.reduce((acc, v) => acc - v.value, this.value);
  return money(diff, this.currency);
}

function substract() {
  return subtract.apply(this, arguments);
}

/**
 * Inverses the current amount.
 * 
 * @returns {Money} The inverse of the current amount.
 */
function inverse() {
  return money(-this.value, this.currency);
}

/**
 * Distributes the current amount between the specified number of recipients
 * proportionally to the specified shares.
 * 
 * If recepients is a number, it is treated as the number of recipients with
 * equal shares.
 * 
 * Calculation fails with an error when:
 * 
 * - the recipients is not an integer or array
 * - the number of recipients is less than 1 (when specified as a number)
 * - the array of recepients is empty (when specified as an array)
 * - unit is major and the amount has non-zero minor part
 * 
 * Money is distributed in the following way:
 * 
 * 1. The amount is divided by the sum of shares to get the price of one share.
 * 2. The amount is distributed between the recepients proportionally to their shares,
 *    rouding down to the nearest multiple of the unit.
 * 3. The remainder is distributed between the recepients with the largest fractional
 *    parts of their shares.
 * 
 * Example:
 * 
 * Alice, Bob, and Charlie distribute £1000 between themselves in the ratio 5:3:1.
 * 
 * Step 1: the price of one share is `1000 / (5 + 3 + 1) = 111.(1)`
 * Step 2: $999 is distributed between Alice, Bob, and Charlie as £555, £333, and £111.
 * Step 3: Remaining £1 goes to Alice, because .(5) is greater then .(3) and .(1).
 * 
 * Therefore the result is £556, £333, and £111.
 * 
 * @returns {Money[]} The amounts distributed between the recipients.
 */
function distribute(recipients, unit = undefined) {
  unit = unit || money.minor;

  if (!Array.isArray(recipients)) {
    if (!Number.isSafeInteger(recipients) || recipients < 1)
      throw new Error('recipients should be either a non-empty array of numbers or a positive integer number');
    recipients = new Array(recipients).fill(1);
  } else {
    if (recipients.length < 1 || recipients.some(x => !Number.isFinite(x) || x < 0))
      throw new Error('recipient\'s share should be a positive finite number');
  }

  if (recipients.length < 1)
    throw new Error('no recipients');

  if (unit.value === money.major.value && this.value % 100 !== 0)
    throw new Error('cannot distribute major units with non-zero minor part');

  if (recipients.length === 1)
    return [ this ];

  const shares = recipients.reduce((acc, value) => acc + value, 0);

  const amounts = [ ];

  const price = this.value / shares;

  let distributed = 0;
  for (let i = 0; i < recipients.length; i++) {
    const exact = recipients[i] * price;
    const value = Math.floor(exact / unit.value)|0 * unit.value;
    distributed += value;
    const diff = exact - value;
    amounts[i] = { i, value, diff };
  }

  let remainder = this.value - distributed;
  amounts.sort((a, b) => b.diff - a.diff);
  for (let i = 0; i < amounts.length; i++) {
    if (remainder === 0)
      break;
    remainder -= unit.value;
    amounts[i].value += unit.value;
  }
  amounts.sort((a, b) => a.i - b.i);

  return amounts.map(x => money(x.value, this.currency));
}

/**
 * Returns the major part of the current amount as an integer.
 *
 * @returns {Number} The major part of the current amount.
 */
function major() {
  return (this.value - this.value % 100) / 100 | 0;
}

/**
 * Returns the minor part of the current amount as an integer
 *
 * @returns {Number} The minor part of the current amount.
 */
function minor() {
  return this.value % 100;
}

const Money =
  { add,
    substract,
    subtract,
    distribute,
    major,
    minor,
    inverse,
    convert,
    toString,
    toNumber };

/**
 * Checks whether the specified value is a money amount.
 * 
 * @returns {boolean}
 */
function isMoney(value) {
  return value && value.__proto__ === Money;
}

/**
 * Creates a new Money instance from the specified value or another Money instance.
 * 
 * @param {Number|Money} value 
 * @returns 
 */
function money(value, currency = null) {
  if (isMoney(value))
    return money(value.value, value.currency);

  if ('number' !== typeof value)
    throw new Error('value is not a number');

  if (!Number.isSafeInteger(value)) {
    throw new Error(
      value < 0
      ? `number of minor units is less than ${Number.MIN_SAFE_INTEGER}`
      : `number of minor units is greater than ${Number.MAX_SAFE_INTEGER}`);
  }

  currencyTypeGuard(currency);

  return {
    value,
    currency,
    __proto__ : Money
  };
}

function parse(value) {
  if ('string' !== typeof value || !value.length)
    return null;

  const sign = value[0] === '-' ? -1 : 1;
  const start = sign === -1 ? 1 : 0;

  let main = 0;
  let fraction = 0;

  let index = start;

  while (true) {
    if (index == value.length)
      return index == start
        ? null
        : money(main * 100 + fraction);

    const ch = value[index];
    index++;
    if (ch >= '0' && ch <= '9') {
      main = main * 10 + sign * (ch - '0');
      continue;
    }

    if (ch === ',') {
      continue;
    }

    if (ch === '.') {
      if (index == value.length)
        return null;

      const ch1 = value[index];
      index++;
      if (ch1 < '0' || ch1 > '9')
        return null;
      fraction = sign * (ch1 - '0') * 10;
      if (index == value.length)
        return money(main * 100 + fraction);
      const ch2 = value[index];
      index++;
      if (ch2 < '0' || ch2 > '9' || index != value.length)
        return null;
      fraction += sign * (ch2 - '0');
      return money(main * 100 + fraction);
    }

    return null;
  }
}

money.zero = money(0);
money.minor = money(1);
money.major = money(100);

money.parse = parse;

money.fromString = value => {
  const amount = parse(value);
  if (amount === null)
    throw new Error('invalid format');
  return amount;
};

/**
 * Creates a money amount from the specified number of minor units (e.g. cents or pence).
 *
 * @returns {Money}
 */
money.fromMinor = (value, currency = null) => {
  if (!Number.isSafeInteger(value))
    throw new Error('value is not an integer');
  return money(value, currency);
};

/**
 * Creates a money amount from the specified number, truncating the part after 1/100.
 * 
 * @returns {Money}
 */
money.fromNumber = (value, currency = null) => {
  if (!Number.isFinite(value))
    throw new Error('value is not a finite number');
  const minor = Math.trunc(value * 100);
  return money(minor === 0 ? 0 : minor, currency);
};

/**
 * Creates a money amount from the specified number of major units (e.g. dollars).
 * The input must be an integer number of major units.
 * 
 * @returns {Money}
 */
money.fromMajor = (value, currency = null) => {
  if (!Number.isSafeInteger(value))
    throw new Error('value is not an integer');
  return money(value * 100, currency);
};

/**
 * Checks whether the specified value is a money amount.
 * 
 * @returns {boolean}
 */
money.isMoney = value => value && value.__proto__ === Money;

export { money };

function currencyTypeGuard(value) {
  if (value !== null
      && typeof value !== 'string')
  {
    throw new TypeError('currency must be a string or null');
  }
}

function currencyGuard(a, b) {
  if (a !== b) {
    throw new TypeError('currency mismatch');
  }
}

/**
 * Converts this amount to another currency using the exchange rate.
 * Rate is applied to major units: minor' = trunc((value/100 * rate) * 100).
 * @param {number} rate Positive finite exchange rate.
 * @param {string|null} currency Target currency (string or null).
 * @returns {Money}
 */
function convert(rate, currency) {
  currencyTypeGuard(currency);
  if (!Number.isFinite(rate) || rate <= 0)
    throw new TypeError('rate must be a positive finite number');
  const minor = Math.trunc((this.value / 100) * rate * 100);
  return money(minor === 0 ? 0 : minor, currency ?? null);
}
