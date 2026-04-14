import {
    type GeneratedFile,
  } from './types.js';

const EVAL_REQUEST_TYPE =
  'asljs-app-builder:eval-request';
const EVAL_RESPONSE_TYPE =
  'asljs-app-builder:eval-response';
const DIAGNOSTICS_REQUEST_TYPE =
  'asljs-app-builder:diagnostics-request';
const DIAGNOSTICS_RESPONSE_TYPE =
  'asljs-app-builder:diagnostics-response';

export type RuntimeDiagnostics = {
  logs: Array<
    {
      timestamp: number;
      level: string;
      message: string;
    }
  >;
  errors: Array<
    {
      timestamp: number;
      message: string;
    }
  >;
};

const EVAL_BRIDGE_SCRIPT =
  `<script>
(() => {
  const REQUEST = '${EVAL_REQUEST_TYPE}';
  const RESPONSE = '${EVAL_RESPONSE_TYPE}';
  const DIAG_REQUEST = '${DIAGNOSTICS_REQUEST_TYPE}';
  const DIAG_RESPONSE = '${DIAGNOSTICS_RESPONSE_TYPE}';
  const DIAG_KEY = '__asljs_app_builder_diagnostics';
  const MAX_ENTRIES = 250;

  const diagnostics =
    window[DIAG_KEY]
    ?? { logs: [], errors: [] };

  window[DIAG_KEY] = diagnostics;

  const toText = (value) => {
    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const append = (list, entry) => {
    list.push(entry);

    if (list.length > MAX_ENTRIES) {
      list.splice(0, list.length - MAX_ENTRIES);
    }
  };

  const addLog = (level, args) => {
    append(
      diagnostics.logs,
      {
        timestamp: Date.now(),
        level,
        message: args.map(toText).join(' '),
      },
    );
  };

  const addError = (message) => {
    append(
      diagnostics.errors,
      {
        timestamp: Date.now(),
        message,
      },
    );
  };

  if (!window.__asljs_app_builder_console_hooked__) {
    window.__asljs_app_builder_console_hooked__ = true;

    const methods = ['log', 'info', 'warn', 'error', 'debug'];

    for (const method of methods) {
      const original = console[method].bind(console);

      console[method] = (...args) => {
        addLog(method, args);

        if (method === 'error') {
          addError(args.map(toText).join(' '));
        }

        original(...args);
      };
    }

    window.addEventListener('error', event => {
      addError(event.message || 'Unknown runtime error');
    });

    window.addEventListener('unhandledrejection', event => {
      addError(event.reason instanceof Error
        ? event.reason.message
        : toText(event.reason));
    });
  }

  window.addEventListener('message', async event => {
    const data = event.data;

    if (!data || typeof data.type !== 'string') {
      return;
    }

    if (data.type === DIAG_REQUEST) {
      if (typeof data.id !== 'string') {
        return;
      }

      event.source?.postMessage(
        {
          type: DIAG_RESPONSE,
          id: data.id,
          ok: true,
          diagnostics,
        },
        '*',
      );
      return;
    }

    if (data.type !== REQUEST) {
      return;
    }

    if (typeof data.id !== 'string' || typeof data.code !== 'string') {
      return;
    }

    try {
      const result = (0, eval)(data.code);
      const value = await Promise.resolve(result);

      event.source?.postMessage(
        {
          type: RESPONSE,
          id: data.id,
          ok: true,
          value,
        },
        '*',
      );
    } catch (error) {
      event.source?.postMessage(
        {
          type: RESPONSE,
          id: data.id,
          ok: false,
          error: error instanceof Error
            ? error.message
            : String(error),
        },
        '*',
      );
    }
  });
})();
</script>`;

export function renderPreview(
    frame: HTMLIFrameElement,
    files: GeneratedFile[]
  ): void
{
  if (files.length === 0) {
    frame.removeAttribute('srcdoc');
    frame.src = 'about:blank';
    return;
  }

  const htmlFile =
    files.find(file => file.name === 'index.html')
    ?? files.find(file => file.name.endsWith('.html'))
    ?? null;

  if (htmlFile === null) {
    frame.removeAttribute('srcdoc');
    frame.src = 'about:blank';
    return;
  }

  let html =
    htmlFile.content;

  const cssFile =
    files.find(file => file.name === 'style.css')
    ?? files.find(file => file.name.endsWith('.css'))
    ?? null;

  if (cssFile !== null) {
    html =
      html.replace(
        /<link[^>]+href=["']style\.css["'][^>]*>/gi,
        `<style>${cssFile.content}</style>`);

    html =
      html.replace(
        /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,
        `<style>${cssFile.content}</style>`);
  }

  for (const file of files) {
    if (!file.name.endsWith('.js')) {
      continue;
    }

    const escapedName =
      file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    html =
      html.replace(
        new RegExp(
          `(<script[^>]*?)\\s+src=["']${escapedName}["']([^>]*)><\\/script>`,
          'gi'),
        (
            _match,
            beforeAttrs,
            afterAttrs
          ) => {
          const attrs =
            `${String(beforeAttrs)} ${String(afterAttrs)}`;

          const isModule =
            /type=["']module["']/i.test(attrs);

          return isModule
            ? `<script type="module">${file.content}</script>`
            : `<script>${file.content}</script>`;
        });
  }

        html = injectAsljsImportMap(html, files);

  html = injectEvalBridge(html);
        frame.srcdoc = html;
}

export async function evaluateInPreview(
  frame: HTMLIFrameElement,
  code: string,
): Promise<unknown> {
  const payload = await requestPreviewPayload(
    frame,
    EVAL_REQUEST_TYPE,
    {
      code,
    },
    EVAL_RESPONSE_TYPE,
  );

  if (payload.ok === true) {
    return payload.value;
  }

  throw new Error(
    typeof payload.error === 'string'
      ? payload.error
      : 'Unknown preview evaluation error.',
  );
}

export async function getPreviewDiagnostics(
  frame: HTMLIFrameElement,
): Promise<RuntimeDiagnostics> {
  const payload = await requestPreviewPayload(
    frame,
    DIAGNOSTICS_REQUEST_TYPE,
    {},
    DIAGNOSTICS_RESPONSE_TYPE,
  );

  if (payload.ok !== true) {
    throw new Error(
      typeof payload.error === 'string'
        ? payload.error
        : 'Failed to read preview diagnostics.',
    );
  }

  const diagnostics = payload.diagnostics as RuntimeDiagnostics | undefined;

  return diagnostics
    ?? { logs: [], errors: [] };
}

async function requestPreviewPayload(
  frame: HTMLIFrameElement,
  requestType: string,
  requestBody: Record<string, unknown>,
  responseType: string,
): Promise<Record<string, unknown>> {
  const frameWindow = frame.contentWindow;

  if (frameWindow === null) {
    throw new Error('Preview frame is not available.');
  }

  const requestId = crypto.randomUUID();

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for app evaluation result.'));
    }, 5000);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameWindow) {
        return;
      }

      const payload = event.data as Record<string, unknown>;

      if (
        payload.type !== responseType
        || payload.id !== requestId
      ) {
        return;
      }

      cleanup();
      resolve(payload);
    };

    function cleanup(): void {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
    }

    window.addEventListener('message', onMessage);

    frameWindow.postMessage(
      {
        type: requestType,
        id: requestId,
        ...requestBody,
      },
      '*',
    );
  });
}

function injectEvalBridge(html: string): string {
  if (html.includes(EVAL_REQUEST_TYPE)) {
    return html;
  }

  if (html.includes('</body>')) {
    return html.replace('</body>', `${EVAL_BRIDGE_SCRIPT}</body>`);
  }

  return `${html}\n${EVAL_BRIDGE_SCRIPT}`;
}

function injectAsljsImportMap(html: string, files: GeneratedFile[]): string {
  if (/type=["']importmap["']/i.test(html)) {
    return html;
  }

  const packageFile =
    files.find(file => file.name === 'package.json')
    ?? null;

  const versions =
    readAsljsPackageVersions(packageFile?.content);

  const imports = Object.fromEntries(
    versions.map(([name, version]) => [
      name,
      `https://esm.sh/${name}@${version}?bundle`,
    ]),
  );

  if (Object.keys(imports).length === 0) {
    return html;
  }

  const importMap = `<script type="importmap">${JSON.stringify({ imports })}</script>`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, match => `${match}\n${importMap}`);
  }

  return `${importMap}\n${html}`;
}

function readAsljsPackageVersions(
  packageJsonContent: string | undefined,
): Array<[string, string]> {
  if (packageJsonContent === undefined) {
    return defaultAsljsVersions();
  }

  try {
    const parsed = JSON.parse(packageJsonContent) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const source = {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {}),
    };

    const names = [
      'asljs-eventful',
      'asljs-observable',
      'asljs-data-binding',
      'asljs-components',
      'asljs-dali',
    ];

    const versions = names.map((name): [string, string] => [
      name,
      normalizeNpmVersion(source[name]),
    ]);

    return versions;
  } catch {
    return defaultAsljsVersions();
  }
}

function normalizeNpmVersion(value: string | undefined): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'latest';
  }

  const cleaned = value.trim().replace(/^[~^<>=\s]+/, '');
  return cleaned === ''
    ? 'latest'
    : cleaned;
}

function defaultAsljsVersions(): Array<[string, string]> {
  return [
    ['asljs-eventful', 'latest'],
    ['asljs-observable', 'latest'],
    ['asljs-data-binding', 'latest'],
    ['asljs-components', 'latest'],
    ['asljs-dali', 'latest'],
  ];
}
