import { getSection,
         parseMarkdown,
         plainText }
  from 'asljs-mdcli';
import { type ListItem }
  from 'mdast';

export interface Question
{
  question: string;

  /**
   * The user's answer, a nested `- Answer: ...` item; `null` while the
   * question is open.
   */
  answer: string | null;
}

const ANSWER =
  /^Answer:\s*([\s\S]*)$/i;

/**
 * The questions of the `## Open questions` section: one list item each, with
 * the user's answer as a nested `- Answer:` item.
 */
export function readQuestions(
    text: string
  ): Question[]
{
  const section =
    getSection(
      parseMarkdown(text),
      'Open questions') ?? [ ];

  const questions: Question[] = [ ];

  for (const node of section) {
    if (node.type !== 'list') {
      continue;
    }

    for (const item of node.children) {
      questions.push(
        readQuestion(item));
    }
  }

  return questions;
}

/**
 * The questions nobody has answered yet.
 */
export function countOpen(
    text: string
  ): number
{
  return readQuestions(text)
    .filter(
      question => question.answer === null)
    .length;
}

/**
 * The text with `questions` added to its `## Open questions` section, which
 * is added at the end when there is none.
 */
export function addQuestions(
    text: string,
    questions: readonly string[]
  ): string
{
  if (questions.length === 0) {
    return text;
  }

  const items =
    questions
    .map(
      question =>
        `- ${
          question.replace(
            /\s+/g,
            ' ').trim()
        }`)
    .join('\n');

  const root =
    parseMarkdown(text);

  const section =
    getSection(
      root,
      'Open questions');

  if (section === null) {
    return `${text.trimEnd()}\n\n## Open questions\n\n${items}\n`;
  }

  const lists =
    section.filter(
      node => node.type === 'list');

  const after =
    lists.at(-1)
    ?? root.children[
      root.children.findIndex(
        node =>
          node.type === 'heading'
          && node.depth === 2
          && plainText(node).trim() === 'Open questions')
    ];

  const offset =
    after.position!.end.offset!;

  return text.slice(
    0,
    offset)
    + (lists.length > 0
      ? '\n'
      : '\n\n')
    + items
    + text.slice(offset);
}

function readQuestion(
    item: ListItem
  ): Question
{
  const [first, ...rest] = item.children;

  let answer: string | null = null;

  for (const node of rest) {
    if (node.type !== 'list') {
      continue;
    }

    for (const child of node.children) {
      const match =
        ANSWER.exec(
          plainText(child).trim());

      if (
        match
        && match[1].trim() !== ''
      ) {
        answer =
          match[1].replace(
            /\s+/g,
            ' ').trim();
      }
    }
  }

  return { question:
             first === undefined
      ? ''
      : plainText(first).replace(
        /\s+/g,
        ' ').trim(),
           answer };
}
