import { getData as getAsljsPackageData }
  from './rules/ASLJS Package.js';
import { validate as validateAsljsPackageRL1 }
  from './rules/ASLJS Package_RL1.js';
import { validate as validateArticleRL1 }
  from './rules/Article_RL1.js';
import { validate as validateArticleRL2 }
  from './rules/Article_RL2.js';
import { validate as validateArticleRL3 }
  from './rules/Article_RL3.js';
import { validate as validatePackageReadmeRL1 }
  from './rules/Package README_RL1.js';
import { validate as validatePackageReadmeRL2 }
  from './rules/Package README_RL2.js';
import { validate as validateRequirementRL10 }
  from './rules/Requirement_RL10.js';

/**
 * Provides the definitions documented in this folder and implements their
 * code-enforced rules. Run with `part check --definitions aftefacts`.
 *
 * Bump `version` when a rule implementation changes, so cached check results
 * of its rules are discarded.
 *
 * @type { import('asljs-part').PluginFactory }
 */
export default async function asljsArtefacts(
  context)
{
  const definitions =
    await context.readDefinitions();

  return { name: 'asljs-artefacts',
           version: '1',
           definitions:
             async () => definitions,
           data:
             { 'ASLJS Package': getAsljsPackageData },
           rules:
             { 'ASLJS Package':
                 { RL1: validateAsljsPackageRL1 },
               'Article':
                 { RL1: validateArticleRL1,
                   RL2: validateArticleRL2,
                   RL3: validateArticleRL3 },
               'Package README':
                 { RL1: validatePackageReadmeRL1,
                   RL2: validatePackageReadmeRL2 },
               'Requirement':
                 { RL10: validateRequirementRL10 } } };
}
