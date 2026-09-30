export interface LocationFilter
{
  name: string;
}

export interface Location
{
  /**
   * Include pattern for the location. This is a glob pattern that is matched
   * either against the project root or relative to where location is defined.
   */
  pattern: string;

  /**
   * Optional list of patterns to exclude from the location.
   */
  exclude?: string[];

  /**
   * Special filters that are applied to the location. E.g., GitIgnore.
   */
  filters?: LocationFilter[];
}
