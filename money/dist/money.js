function currencyTypeGuard(value) {
    if (value !== null
        && typeof value !== 'string') {
        throw new TypeError('currency must be a string or null');
    }
}
function currencyGuard(a, b) {
    if (a !== b)
        throw new TypeError('currency mismatch');
}
function toString(format = 'f') {
    if (format === 'c')
        return String(this.value / 100);
    const value = this.value;
    const sign = value < 0
        ? '-'
        : '';
    const digits = Math.abs(value)
        .toString()
        .padStart(3, '0');
    let text = `.${digits.substring(digits.length - 2, digits.length)}`;
    let index = digits.length - 2;
    while (true) {
        if (index - 3 > 0) {
            text = `,${digits.substring(index - 3, index)}` + text;
            index -= 3;
        }
        else {
            text = `${digits.substring(0, index)}` + text;
            break;
        }
    }
    const amountText = `${sign}${text}`;
    return this.currency
        ? `${amountText} ${this.currency}`
        : amountText;
}
function toNumber() {
    return this.value / 100;
}
function add(...values) {
    for (const v of values)
        currencyGuard(this.currency, v.currency);
    const sum = values.reduce((acc, v) => acc + v.value, this.value);
    return money(sum, this.currency);
}
function subtract(...values) {
    for (const v of values)
        currencyGuard(this.currency, v.currency);
    const diff = values.reduce((acc, v) => acc - v.value, this.value);
    return money(diff, this.currency);
}
function substract(...values) {
    return subtract.apply(this, values);
}
function inverse() {
    return money(-this.value, this.currency);
}
function distribute(recipients, unit = undefined) {
    unit = unit || money.minor;
    if (!Array.isArray(recipients)) {
        if (!Number.isSafeInteger(recipients)
            || recipients < 1) {
            throw new Error('recipients should be either a non-empty array of numbers or a positive integer number');
        }
        recipients =
            new Array(recipients)
                .fill(1);
    }
    else {
        if (recipients.length < 1
            || recipients.some(x => !Number.isFinite(x) || x < 0)) {
            throw new Error('recipient\'s share should be a positive finite number');
        }
    }
    if (recipients.length < 1)
        throw new Error('no recipients');
    if (unit.value === money.major.value
        && this.value % 100 !== 0) {
        throw new Error('cannot distribute major units with non-zero minor part');
    }
    if (recipients.length === 1)
        return [this];
    const shares = recipients.reduce((acc, value) => acc + value, 0);
    const amounts = [];
    const price = this.value / shares;
    let distributed = 0;
    for (let i = 0; i < recipients.length; i++) {
        const exact = recipients[i] * price;
        const value = (Math.floor(exact / unit.value) | 0) * unit.value;
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
function major() {
    return ((this.value - (this.value % 100)) / 100) | 0;
}
function minor() {
    return this.value % 100;
}
function convert(rate, currency) {
    currencyTypeGuard(currency);
    if (!Number.isFinite(rate)
        || rate <= 0) {
        throw new TypeError('rate must be a positive finite number');
    }
    const minorValue = Math.trunc((this.value / 100) * rate * 100);
    return money(minorValue === 0
        ? 0
        : minorValue, currency ?? null);
}
const MoneyProto = { add,
    substract,
    subtract,
    distribute,
    major,
    minor,
    inverse,
    convert,
    toString,
    toNumber };
function isMoney(value) {
    return !!value
        && value.__proto__ === MoneyProto;
}
function parse(value) {
    if (typeof value !== 'string'
        || !value.length) {
        return null;
    }
    const sign = value[0] === '-'
        ? -1
        : 1;
    const start = sign === -1
        ? 1
        : 0;
    let main = 0;
    let fraction = 0;
    let index = start;
    while (true) {
        if (index === value.length) {
            return index === start
                ? null
                : money(main * 100 + fraction);
        }
        const ch = value[index];
        index++;
        if (ch >= '0'
            && ch <= '9') {
            main = main * 10 + sign * (ch.charCodeAt(0) - '0'.charCodeAt(0));
            continue;
        }
        if (ch === ',')
            continue;
        if (ch === '.') {
            if (index === value.length)
                return null;
            const ch1 = value[index];
            index++;
            if (ch1 < '0'
                || ch1 > '9') {
                return null;
            }
            fraction = sign * (ch1.charCodeAt(0) - '0'.charCodeAt(0)) * 10;
            if (index === value.length)
                return money(main * 100 + fraction);
            const ch2 = value[index];
            index++;
            if (ch2 < '0'
                || ch2 > '9'
                || index !== value.length) {
                return null;
            }
            fraction += sign * (ch2.charCodeAt(0) - '0'.charCodeAt(0));
            return money(main * 100 + fraction);
        }
        return null;
    }
}
const moneyImpl = (value, currency = null) => {
    if (isMoney(value))
        return moneyImpl(value.value, value.currency);
    if (typeof value !== 'number')
        throw new Error('value is not a number');
    if (!Number.isSafeInteger(value)) {
        throw new Error(value < 0
            ? `number of minor units is less than ${Number.MIN_SAFE_INTEGER}`
            : `number of minor units is greater than ${Number.MAX_SAFE_INTEGER}`);
    }
    currencyTypeGuard(currency);
    const obj = Object.create(MoneyProto);
    obj.value = value;
    obj.currency = currency;
    return obj;
};
export const money = moneyImpl;
money.zero = money(0);
money.minor = money(1);
money.major = money(100);
money.parse = parse;
money.fromString = (value) => {
    const amount = parse(value);
    if (amount === null)
        throw new Error('invalid format');
    return amount;
};
money.fromMinor = (value, currency = null) => {
    if (!Number.isSafeInteger(value))
        throw new Error('value is not an integer');
    return money(value, currency);
};
money.fromNumber = (value, currency = null) => {
    if (!Number.isFinite(value))
        throw new Error('value is not a finite number');
    const minorValue = Math.trunc(value * 100);
    return money(minorValue === 0
        ? 0
        : minorValue, currency);
};
money.fromMajor = (value, currency = null) => {
    if (!Number.isSafeInteger(value))
        throw new Error('value is not an integer');
    return money(value * 100, currency);
};
money.isMoney = (value) => isMoney(value);
