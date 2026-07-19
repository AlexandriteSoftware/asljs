import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { AST }
  from 'eslint';

export class LocationIncompleteError extends Error
{
  public readonly code: string;

  constructor()
  {
    super(
      'Node does not have location information.'
    );

    this.code = 'LOCATION_INCOMPLETE';
  }
}

export type WithLocation = {
  loc: {
    start: { line: number; column: number; };
    end: { line: number; column: number; };
  };
};

export type NodeOrTokenWithLocation =
  & (
    | TSESTree.Node
    | AST.Token
  )
  & WithLocation;

export function ensureNodeAndLocation(
    node:
    | TSESTree.Node
    | AST.Token
    | null
  ): asserts node is NodeOrTokenWithLocation
{
  if (
    !node
    || !node.loc
    || !node.loc.start
    || !node.loc.end
  ) {
    throw new LocationIncompleteError();
  }
}
