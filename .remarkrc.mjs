import remarkGfm from 'remark-gfm';
import remarkLint from 'remark-lint';
import remarkLintMaximumLineLength from 'remark-lint-maximum-line-length';
import remarkValidateLinks from 'remark-validate-links';
import {
  visit
} from 'unist-util-visit';

/**
 * Repository markdown rules.
 *
 * `Article.md` states the first two as artefact rules and `part check` reports
 * them per file; these are the same limits at authoring time, reported per
 * line, so `npm run lint:md` catches them before a check does.
 */

const LINE_LENGTH = 80;

/**
 * Only reference-style links and images.
 *
 * `remark-parse` gives an inline link a `link` node and a reference one a
 * `linkReference` node, so the rule is the node type. A definition keeps the
 * URL on its own line, where it is exempt from the line length, and names the
 * target once however often it is used.
 *
 * There is no published rule for this; `remark-lint-no-inline-links` does not
 * exist.
 */
function remarkLintOnlyReferenceLinks()
{
  return (tree, file) =>
  {
    visit(
      tree,
      node =>
      {
        if (
          node.type !== 'link'
          && node.type !== 'image'
        ) {
          return;
        }

        // An autolink carries no separate text, so there is nothing a
        // definition would shorten, and GFM turns a bare URL into the same
        // node. `no-literal-urls` is the rule for those.
        if (
          node.type === 'link'
          && node.children?.length === 1
          && node.children[0].type === 'text'
          && node.children[0].value === node.url
        ) {
          return;
        }

        file.message(
          `Use a reference-style ${node.type}, not an inline one`,
          node
        );
      }
    );
  };
}

/** No line break inside a table cell, so a row stays one line. */
function remarkLintNoBreakInTable()
{
  return (tree, file) =>
  {
    visit(
      tree,
      'tableCell',
      cell =>
      {
        visit(
          cell,
          node =>
          {
            if (
              node.type !== 'break'
              && !(
                node.type === 'html'
                && /^<br\s*\/?>$/i.test(node.value)
              )
            ) {
              return;
            }

            file.message(
              'A table cell must not contain a line break',
              node
            );
          }
        );
      }
    );
  };
}

const config = {
  plugins: [
    remarkGfm,
    remarkLint,
    remarkValidateLinks,
    [remarkLintMaximumLineLength, LINE_LENGTH],
    remarkLintOnlyReferenceLinks,
    remarkLintNoBreakInTable
  ]
};

export default config;
