import { createRequire }
  from 'node:module';
import { Plugin,
         PluginContext }
  from '../plugin.js';
import { validate as validateArticleRL1 }
  from './article-rl1.js';
import { validate as validateArticleRL2 }
  from './article-rl2.js';
import { validate as validateArticleRL3 }
  from './article-rl3.js';
import { readBuiltInDefinitions }
  from './built-in-definition.js';
import gitPlugin
  from './git.js';
import npmPlugin
  from './npm.js';

/**
 * Package version, so cached results of the built-in rules are discarded when
 * `asljs-part` is upgraded. Compiled plugins are two levels below the package
 * root.
 */
const PACKAGE_VERSION: string =
  createRequire(import.meta.url)(
    '../../package.json').version;

/**
 * Plugin of the `asljs-part` package itself, the default export of the
 * package root: every definition documented in the package's `artefacts`
 * folder, with the locators, data functions and rules of the built-in npm and
 * git plugins and the `Article` rules. Loaded with `--definitions asljs-part`, or `--definitions .`
 * inside the package.
 */
export default async function partPlugin(
    context: PluginContext
  ): Promise<Plugin>
{
  const definitions =
    await readBuiltInDefinitions(
      context);

  const plugins =
    [ npmPlugin(context),
      gitPlugin(context) ];

  return { name: 'asljs-part',
           version: PACKAGE_VERSION,
           definitions:
             async () => definitions,
           locate:
             Object.assign(
               {},
               ...plugins.map(
                 plugin => plugin.locate)),
           data:
             Object.assign(
               {},
               ...plugins.map(
                 plugin => plugin.data)),
           rules:
             Object.assign(
               { Article:
                   { RL1: validateArticleRL1,
                     RL2: validateArticleRL2,
                     RL3: validateArticleRL3 } },
               ...plugins.map(
                 plugin => plugin.rules)) };
}
