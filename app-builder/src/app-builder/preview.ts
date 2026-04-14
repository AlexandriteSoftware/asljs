import {
    type GeneratedFile,
  } from './types.js';

let currentBlobUrl: string | null = null;

const EVAL_REQUEST_TYPE =
  'asljs-app-builder:eval-request';
const EVAL_RESPONSE_TYPE =
  'asljs-app-builder:eval-response';

const EVAL_BRIDGE_SCRIPT =
  `<script>
(() => {
  const REQUEST = '${EVAL_REQUEST_TYPE}';
  const RESPONSE = '${EVAL_RESPONSE_TYPE}';

  window.addEventListener('message', async event => {
    const data = event.data;

    if (!data || data.type !== REQUEST) {
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
  if (currentBlobUrl !== null) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  if (files.length === 0) {
    frame.src = 'about:blank';
    return;
  }

  const htmlFile =
    files.find(file => file.name === 'index.html')
    ?? files.find(file => file.name.endsWith('.html'))
    ?? null;

  if (htmlFile === null) {
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

  html = injectEvalBridge(html);

  const blob =
    new Blob(
      [ html ],
      { type: 'text/html' });

  currentBlobUrl = URL.createObjectURL(blob);
  frame.src = currentBlobUrl;
}

export async function evaluateInPreview(
  frame: HTMLIFrameElement,
  code: string,
): Promise<unknown> {
  const frameWindow = frame.contentWindow;

  if (frameWindow === null) {
    throw new Error('Preview frame is not available.');
  }

  const requestId = crypto.randomUUID();

  return new Promise<unknown>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for app evaluation result.'));
    }, 5000);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameWindow) {
        return;
      }

      const payload = event.data as {
        type?: string;
        id?: string;
        ok?: boolean;
        value?: unknown;
        error?: string;
      };

      if (
        payload.type !== EVAL_RESPONSE_TYPE
        || payload.id !== requestId
      ) {
        return;
      }

      cleanup();

      if (payload.ok === true) {
        resolve(payload.value);
        return;
      }

      reject(new Error(payload.error ?? 'Unknown preview evaluation error.'));
    };

    function cleanup(): void {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
    }

    window.addEventListener('message', onMessage);

    frameWindow.postMessage(
      {
        type: EVAL_REQUEST_TYPE,
        id: requestId,
        code,
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
