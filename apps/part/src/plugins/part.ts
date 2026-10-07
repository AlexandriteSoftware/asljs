import { Plugin,
         PluginContext }
  from '../plugin.js';
import { readBuiltInDefinitions }
  from './built-in-definition.js';
import gitPlugin
  from './git.js';
import npmPlugin
  from './npm.js';

/**
 * Plugin of the `asljs-part` package itself, the default export of the
 * package root: every definition documented in the package's `artefacts`
 * folder, with the locators, data functions and rules of the built-in npm and
 * git plugins. Loaded with `--definitions asljs-part`, or `--definitions .`
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
               {},
               ...plugins.map(
                 plugin => plugin.rules)) };
}
