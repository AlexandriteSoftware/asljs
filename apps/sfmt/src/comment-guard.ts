import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { Logger }
  from 'asljs-logging';

type Range = Readonly<[number, number]>;

/**
 * A fixer that records the edits a fix would make instead of making them.
 *
 * ESLint only hands a fixer to a fix it is about to apply, so a fix has to be
 * run against this one to learn what it would replace before deciding whether
 * to report at all.
 */
function recordingFixer(
  ): TSESLint.RuleFixer
{
  const rangeOf =
    (
    nodeOrToken: TSESTree.Node | TSESTree.Token
  ): Range => nodeOrToken.range;

  return { insertTextAfter:
             (
      nodeOrToken,
      text
    ) => ({ range:
              [ rangeOf(nodeOrToken)[1],
                rangeOf(nodeOrToken)[1] ],
            text }),
           insertTextAfterRange:
             (
      range,
      text
    ) => ({ range:
              [ range[1],
                range[1] ],
            text }),
           insertTextBefore:
             (
      nodeOrToken,
      text
    ) => ({ range:
              [ rangeOf(nodeOrToken)[0],
                rangeOf(nodeOrToken)[0] ],
            text }),
           insertTextBeforeRange:
             (
      range,
      text
    ) => ({ range:
              [ range[0],
                range[0] ],
            text }),
           remove:
             nodeOrToken => ({ range:
                                 rangeOf(nodeOrToken),
                               text: '' }),
           removeRange:
             range => ({ range,
                         text: '' }),
           replaceText:
             (
      nodeOrToken,
      text
    ) => ({ range:
              rangeOf(nodeOrToken),
            text }),
           replaceTextRange:
             (
      range,
      text
    ) => ({ range,
            text }) };
}

/** The edits a fix function produces, as a list. */
function editsOf(
    fix: TSESLint.ReportFixFunction
  ): TSESLint.RuleFix[]
{
  const result =
    fix(
      recordingFixer());

  if (result === null) {
    return [ ];
  }

  if ('range' in result) {
    return [ result as TSESLint.RuleFix ];
  }

  return [ ...(result as Iterable<TSESLint.RuleFix>) ];
}

/**
 * Whether applying the edits would delete a comment.
 *
 * A comment survives an edit when the edit's replacement text still contains
 * it. The formatters rebuild code from its tokens, which carry no comments, so
 * a comment inside a rebuilt node is otherwise lost.
 */
export function editsDropComment(
    sourceCode: Readonly<TSESLint.SourceCode>,
    edits: readonly TSESLint.RuleFix[]
  ): boolean
{
  const comments =
    sourceCode.getAllComments();

  for (const edit of edits) {
    const [start, end] = edit.range;

    for (const comment of comments) {
      if (
        comment.range[0] >= start
        && comment.range[1] <= end
        && !edit.text.includes(
          sourceCode.getText(comment))
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * The rule context, with reports whose fix would delete a comment dropped.
 *
 * Losing a comment is never acceptable, and a layout left as it is, is: the
 * node keeps its current layout, and the drop is logged at debug level.
 */
export function guardComments(
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    logger: Logger
  ): TSESLint.RuleContext<string, readonly unknown[]>
{
  const report =
    (
        descriptor: TSESLint.ReportDescriptor<string>
      ): void =>
    {
    const fix = descriptor.fix;

    if (
      fix
      && editsDropComment(
        context.sourceCode,
        editsOf(fix))
    ) {
      logger.debug(
        'Left %s as it is: its fix would delete a comment.',
        context.filename);

      return;
    }

    context.report(descriptor);
  };

  return Object.create(
    context,
    { report:
        { value: report } });
}
