export class LocationIncompleteError extends Error
{
  public readonly code: string;

  constructor()
  {
    super(
      "Property 'loc' is undefined or null."
    );

    this.code = 'LOCATION_INCOMPLETE';
  }
}

export type Location = {
  start: { line: number; column: number; };
  end: { line: number; column: number; };
};

export type WithLocation = {
  loc: Location;
};

export function tryGetLocation(
    value: unknown
  ): Location | undefined
{
  if (!value) {
    return undefined;
  }

  const location =
    (value as WithLocation).loc;

  if (
    location === undefined
    || location.start === undefined
    || location.end === undefined
  ) {
    return undefined;
  }

  return location;
}
