export type Currency = string | null;
export type Money = {
    value: number;
    currency: Currency;
    add: (...values: Money[]) => Money;
    subtract: (...values: Money[]) => Money;
    distribute: (recipients: number | number[], unit?: Money) => Money[];
    major: () => number;
    minor: () => number;
    inverse: () => Money;
    convert: (rate: number, currency: Currency) => Money;
    toString: (format?: string) => string;
    toNumber: () => number;
};
export interface MoneyFactory {
    (value: number | Money, currency?: Currency): Money;
    zero: Money;
    minor: Money;
    major: Money;
    parse: (value: string) => Money | null;
    fromString: (value: string) => Money;
    fromMinor: (value: number, currency?: Currency) => Money;
    fromMajor: (value: number, currency?: Currency) => Money;
    fromNumber: (value: number, currency?: Currency) => Money;
    isMoney: (value: unknown) => value is Money;
}
export declare const money: MoneyFactory;
