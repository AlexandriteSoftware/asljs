export type Money = {
  /** Integer minor units (e.g., cents or pence). */
  value: number;
  /** ISO currency code or custom mnemonic; null allowed. */
  currency: string | null;
  /** Add amounts to this. */
  add: (...values: Money[]) => Money;
  /** Subtract amounts from this. */
  subtract: (...values: Money[]) => Money;
  /** Proportional distribution across recipients using unit granularity. */
  distribute: (recipients: number | number[], unit?: Money) => Money[];
  /** Integer major units (e.g., dollars). */
  major: () => number;
  /** Integer minor units remainder (0..99). */
  minor: () => number;
  /** Negate amount. */
  inverse: () => Money;
  /** Convert to another currency using exchange rate (positive finite). */
  convert: (rate: number, currency: string | null) => Money;
  /** String format: e.g. "-1,234.56" */
  toString: (format?: string) => string;
  /** Floating number in major units. */
  toNumber: () => number;
};

export interface MoneyFactory {
  /** Create a Money from minor units or clone an existing Money. */
  (value: number | Money, currency?: string | null): Money;

  /** Zero amount. */
  zero: Money;
  /** One minor unit. */
  minor: Money;
  /** One major unit. */
  major: Money;

  /** Parse formatted string; returns null on invalid input. */
  parse: (value: string) => Money | null;
  /** Parse formatted string; throws on invalid input. */
  fromString: (value: string) => Money;
  /** Create from minor units (integer). */
  fromMinor: (value: number, currency?: string | null) => Money;
  /** Create from major units (integer). */
  fromMajor: (value: number, currency?: string | null) => Money;
  /** Create from number (finite), truncating beyond 1/100. */
  fromNumber: (value: number, currency?: string | null) => Money;
  /** Type guard. */
  isMoney: (value: unknown) => value is Money;
}

export const money: MoneyFactory;
