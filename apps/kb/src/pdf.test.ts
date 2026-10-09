import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { pathToFileURL }
  from 'node:url';
import { findBrowser,
         pdfArguments,
         printToPdf,
         writePdf }
  from './pdf.js';
import { createTestEnvironment,
         withLibrary }
  from './testing/library.js';

test(
  'writePdf prints the rendered document next to it, with its folder as the base of links',
  async () =>
  {
    await withLibrary(
      { 'notes/plan.md':
          '# The plan\n\n![chart](chart.png)\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        const printed: string[] = [ ];

        environment.register(
          printToPdf,
          async (
              html,
              output
            ) =>
          {
            printed.push(html);

            await fs.writeFile(
              output,
              'PDF');
          });

        assert.deepEqual(
          await writePdf(
            environment,
            'notes/plan.md'),
          { path: 'notes/plan.md',
            output: 'notes/plan.pdf' });

        const html = printed[0];

        assert.ok(
          html.includes(
            `<head>\n<base href="${
              pathToFileURL(
                path.join(
                  library.path,
                  'notes')).href
            }/">`));

        assert.ok(
          html.includes(
            '<title>The plan</title>'));

        assert.ok(
          html.includes('<h1>The plan</h1>'));

        assert.ok(
          html.includes(
            '@page { margin: 2cm; }'));

        await assert.rejects(
          writePdf(
            environment,
            'notes/plan.md'),
          /Already exists: notes\/plan\.pdf/);

        assert.deepEqual(
          await writePdf(
            environment,
            'notes/plan.md',
            { output:
                'print/out/plan.pdf' }),
          { path: 'notes/plan.md',
            output:
              'print/out/plan.pdf' });

        await writePdf(
          environment,
          'notes/plan.md',
          { overwrite: true });

        await assert.rejects(
          writePdf(
            environment,
            'notes/plan.md',
            { output: '../outside.pdf' }),
          /outside of the library/);
      });
  });

test(
  'findBrowser takes KB_BROWSER, then the first Chrome or Edge installed for the platform',
  () =>
  {
    assert.equal(
      findBrowser(
        { KB_BROWSER: ' /opt/chrome ' },
        'linux',
        () => false),
      '/opt/chrome');

    const windows =
      { PROGRAMFILES: 'C:\\Program Files',
        'PROGRAMFILES(X86)':
          'C:\\Program Files (x86)',
        LOCALAPPDATA:
          'C:\\Users\\a\\AppData\\Local' };

    assert.equal(
      findBrowser(
        windows,
        'win32',
        file => file.endsWith('msedge.exe')),
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe');

    assert.equal(
      findBrowser(
        windows,
        'win32',
        file => file.startsWith('C:\\Users')),
      'C:\\Users\\a\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe');

    assert.equal(
      findBrowser(
        { PATH:
            [ '/usr/bin',
              '/snap/bin' ].join(path.delimiter) },
        'linux',
        file =>
          file === path.join(
            '/snap/bin',
            'chromium')),
      path.join(
        '/snap/bin',
        'chromium'));

    assert.equal(
      findBrowser(
        {},
        'darwin',
        () => false),
      null);
  });

test(
  'pdfArguments prints headless, without headers, with a profile of its own',
  () =>
  {
    const source =
      path.resolve(
        'work/document.html');

    assert.deepEqual(
      pdfArguments(
        source,
        'out.pdf',
        'profile'),
      [ '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-pdf-header-footer',
        '--user-data-dir=profile',
        '--print-to-pdf=out.pdf',
        pathToFileURL(source).href ]);
  });
