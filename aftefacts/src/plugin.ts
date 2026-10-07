import { type Plugin,
         type PluginContext }
  from 'asljs-part';
import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';
import { validate as validateArticleRL1 }
  from './article-rl1.js';
import { validate as validateArticleRL2 }
  from './article-rl2.js';
import { validate as validateArticleRL3 }
  from './article-rl3.js';
import { validate as validateAsljsPackageRL1 }
  from './asljs-package-rl1.js';
import { getData as getAsljsPackageData }
  from './asljs-package.js';
import { validate as validatePackageReadmeRL1 }
  from './package-readme-rl1.js';
import { validate as validatePackageReadmeRL2 }
  from './package-readme-rl2.js';
import { validate as validateRequirementRL10 }
  from './requirement-rl10.js';

/**
 * The package folder, which holds the definition documents. The compiled
 * plugin is one level below it, in `dist` or `build`.
 */
const PACKAGE_FOLDER =
  path.resolve(
    path.dirname(
      fileURLToPath(import.meta.url)),
    '..');

/**
 * Provides the definitions documented in the package folder and implements
 * their code-enforced rules. Build with `npm -w asljs-artefacts run
 * build:dist`, then run `part check --definitions aftefacts`.
 *
 * Bump `version` when a rule implementation changes, so cached check results
 * of its rules are discarded.
 */
export default async function asljsArtefacts(
    context: PluginContext
  ): Promise<Plugin>
{
  const definitions =
    await context.readDefinitions(
      PACKAGE_FOLDER);

  return { name: 'asljs-artefacts',
           version: '2',
           definitions:
             async () => definitions,
           data:
             { 'ASLJS Package': getAsljsPackageData },
           rules:
             { 'ASLJS Package':
                 { RL1:
                     validateAsljsPackageRL1 },
               Article:
                 { RL1: validateArticleRL1,
                   RL2: validateArticleRL2,
                   RL3: validateArticleRL3 },
               'Package README':
                 { RL1:
                     validatePackageReadmeRL1,
                   RL2:
                     validatePackageReadmeRL2 },
               Requirement:
                 { RL10:
                     validateRequirementRL10 } } };
}
