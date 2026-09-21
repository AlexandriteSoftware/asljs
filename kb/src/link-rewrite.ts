import path
  from 'node:path';
import { documentName,
         isNameLink }
  from './backlinks.js';
import { ExtractedLink,
         extractLinks }
  from './extract.js';
import { toPosixPath }
  from './formatting.js';
import { documentOffset,
         MarkdownDocument }
  from './markdown.js';

export interface LinkEdit
{
  line: number;

  column: number;

  /**
   * Link target as written before the edit.
   */
  from: string;

  /**
   * Link target as written after the edit.
   */
  to: string;
}

export interface SkippedLink
  extends LinkEdit
{
  reason: string;
}

export interface RewriteResult
{
  text: string;

  edits: LinkEdit[];

  /**
   * Links that need an edit but could not be located in the source. The text
   * is left untouched for these, so nothing is written blind.
   */
  skipped: SkippedLink[];
}

/**
 * A move, as a mapping from old library path to new library path. A folder
 * move contributes one entry per document it carries.
 */
export type PathMapping = ReadonlyMap<string, string>;

/**
 * Rewrite the link targets of one document so that they still resolve after a
 * move.
 *
 * Two things change a target: the document itself moving, which changes what
 * its relative targets are relative to, and the destination moving. Both are
 * expressed by `mapping`, and both are handled here.
 *
 * `documentPath` is the path of the document after the move, and
 * `resolveTarget` reports the library path a link addressed before the move.
 */
export function rewriteLinks(
    document: MarkdownDocument,
    documentPath: string,
    mapping: PathMapping,
    resolveTarget: (link: ExtractedLink) => string | null
  ): RewriteResult
{
  const edits: LinkEdit[] = [ ];

  const skipped: SkippedLink[] = [ ];

  const replacements: { start: number; end: number; value: string; }[] = [ ];

  for (const link of extractLinks(document)) {
    if (link.kind === 'reference') {
      continue;
    }

    const before =
      resolveTarget(link);

    if (before === null) {
      continue;
    }

    const after =
      mapping.get(before) ?? before;

    const target =
      retarget(
        link,
        documentPath,
        after);

    if (
      target === null
      || target === link.target
    ) {
      continue;
    }

    const span =
      locate(
        document,
        link);

    const edit =
      { line: link.line,
        column: link.column,
        from: link.target,
        to: target };

    if (!span) {
      skipped.push(
        { ...edit,
          reason:
            'the target could not be located in the source' });

      continue;
    }

    edits.push(edit);

    replacements.push(
      { start: span.start,
        end: span.end,
        value: target });
  }

  return { text:
             applyReplacements(
               document.text,
               replacements),
           edits,
           skipped };
}

/**
 * Compute the target a link should carry to address `to` from `documentPath`,
 * keeping the style it was written in.
 *
 * Returns `null` when the link needs no path, which is the case for a wiki
 * link whose name has not changed.
 */
export function retarget(
    link: ExtractedLink,
    documentPath: string,
    to: string
  ): string | null
{
  const location =
    locationOf(link.target);

  if (isNameLink(link)) {
    const name =
      documentName(to);

    if (
      name
      === documentName(link.target)
    ) {
      return null;
    }

    return withAlias(
      link.target,
      name);
  }

  if (link.kind === 'wiki') {
    return keepExtensionStyle(
      link.target,
      to);
  }

  if (link.target.startsWith('/')) {
    return `${
      keepExtensionStyle(
        link.target,
        `/${to}`)}${location}`;
  }

  const relative =
    toPosixPath(
      path.relative(
        path.posix.dirname(documentPath),
        to));

  return `${
    keepExtensionStyle(
      link.target,
      relative === ''
        ? to
        : relative)}${location}`;
}

/**
 * Locate the target of a link in the source text.
 *
 * The span is verified against the source before it is used, so a document
 * whose text does not line up with its tree is reported rather than corrupted.
 */
function locate(
    document: MarkdownDocument,
    link: ExtractedLink
  ): { start: number; end: number; } | null
{
  const start =
    link.kind === 'wiki'
      ? findInLine(
        document,
        link)
      : findInNode(
        document,
        link);

  if (start === null) {
    return null;
  }

  return { start,
           end: start + link.target.length };
}

/**
 * For a link that has its own node, the target is the last thing inside it:
 * `[text](target)`, `![alt](target)` and `[id]: target` all end with it.
 */
function findInNode(
    document: MarkdownDocument,
    link: ExtractedLink
  ): number | null
{
  const position =
    nodePositionOf(
      document,
      link);

  if (!position) {
    return null;
  }

  const slice =
    document.text.slice(
      position.start,
      position.end);

  const offset =
    slice.lastIndexOf(link.target);

  if (offset < 0) {
    return null;
  }

  return position.start + offset;
}

/**
 * A wiki link has no node of its own, so it is located by its line and
 * column, which `extractLinks` reports from the match itself.
 */
function findInLine(
    document: MarkdownDocument,
    link: ExtractedLink
  ): number | null
{
  const lines =
    document.text.split('\n');

  let offset = 0;

  for (
    let index = 0;
    index < link.line - 1;
    index += 1
  ) {
    offset += (lines[index] ?? '').length + 1;
  }

  const start =
    offset + link.column - 1;

  const opening =
    document.text.slice(
      start,
      start + 2);

  if (opening !== '[[') {
    return null;
  }

  const inner =
    document.text.indexOf(
      link.target,
      start + 2);

  if (
    inner < 0
    || inner
       > start + 2
         + link.target.length
  ) {
    return null;
  }

  return inner;
}

function nodePositionOf(
    document: MarkdownDocument,
    link: ExtractedLink
  ): { start: number; end: number; } | null
{
  for (const node of linkNodes(document)) {
    if (
      node.line === link.line
      && node.column === link.column
    ) {
      return { start: node.start,
               end: node.end };
    }
  }

  return null;
}

interface LinkNode
{
  line: number;
  column: number;
  start: number;
  end: number;
}

/**
 * Source spans of every node that carries a link target, keyed by the
 * position `extractLinks` reports for it.
 */
function linkNodes(
    document: MarkdownDocument
  ): LinkNode[]
{
  const nodes: LinkNode[] = [ ];

  collect(document.root);

  return nodes;

  function collect(
      node: unknown
    ): void
  {
    const candidate =
      node as
        { type?: string;
          position?:
            { start: { line: number; column: number; offset?: number; };
              end: { offset?: number; }; };
          children?: unknown[]; };

    if (
      (candidate.type === 'link'
       || candidate.type === 'image'
       || candidate.type === 'definition')
       && candidate.position
      && candidate.position.start.offset
         !== undefined
      && candidate.position.end.offset
         !== undefined
    ) {
      nodes.push(
        { line:
            candidate.position.start.line
            + document.frontMatter.lines,
          column:
            candidate.position.start.column,
          start:
            documentOffset(
              document,
              candidate.position.start.offset),
          end:
            documentOffset(
              document,
              candidate.position.end.offset) });
    }

    for (const child of candidate.children ?? [ ]) {
      collect(child);
    }
  }
}

function applyReplacements(
    text: string,
    replacements: { start: number; end: number; value: string; }[]
  ): string
{
  let result = text;

  for (
    const replacement of
      [ ...replacements ].sort(
        (left, right) => right.start - left.start)
  ) {
    result =
      result.slice(
        0,
        replacement.start)
      + replacement.value
      + result.slice(replacement.end);
  }

  return result;
}

/**
 * The fragment and query string of a target, which survive a rewrite.
 */
function locationOf(
    value: string
  ): string
{
  const match =
    /[#?].*$/.exec(value);

  return match?.[0] ?? '';
}

/**
 * Keep a target written without an extension written that way, so that a
 * library that links by name keeps its style.
 */
function keepExtensionStyle(
    previous: string,
    next: string
  ): string
{
  const withoutLocation =
    previous.replace(
      /[#?].*$/,
      '');

  if (path.posix.extname(withoutLocation) !== '') {
    return next;
  }

  const extension =
    path.posix.extname(next);

  if (extension === '') {
    return next;
  }

  return next.slice(
    0,
    next.length - extension.length);
}

/**
 * Replace the name of a wiki link, keeping its alias.
 */
function withAlias(
    previous: string,
    name: string
  ): string
{
  const alias =
    previous.indexOf('|');

  if (alias < 0) {
    return name;
  }

  return `${name}${previous.slice(alias)}`;
}
