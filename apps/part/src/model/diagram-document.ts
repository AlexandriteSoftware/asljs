export type DiagramEdgeStyle = 'solid' | 'dotted' | 'thick' | 'invisible';

export type DiagramEdgeDirection = 'forward' | 'reverse';

export type DiagramDirection = 'TD' | 'LR' | 'BT' | 'RL';

export type DiagramGrouping = 'none' | 'folder';

/**
 * A property drawn as edges, from a level 3 section under `## Edges`.
 */
export interface DiagramEdgeProperty
{
  /**
   * The section heading, `Property` or `Definition.Property`.
   */
  name: string;

  /**
   * The definition named in the heading, or `null` for every node
   * definition that has the property.
   */
  definition: string | null;

  property: string;

  style: DiagramEdgeStyle;

  label: string | null;

  direction: DiagramEdgeDirection;
}

/**
 * A diagram document: which artefacts a diagram shows and how it draws them,
 * documented in `docs/part diagram.md`.
 */
export interface DiagramDocument
{
  path: string;

  name: string;

  nodes: { definitions: string[]; label: string | null; exclude: string[]; };

  /**
   * The start of the traversal, or `null` when every candidate is a node.
   */
  root:
    | {
      artefacts: string[];
      /**
       * Names of `edges` walked from the roots.
       */
      follow: string[];
      depth: number | null;
    }
    | null;

  edges: DiagramEdgeProperty[];

  layout: { direction: DiagramDirection; group: DiagramGrouping; };
}
