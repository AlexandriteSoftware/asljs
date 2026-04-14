import {
    type GeneratedFile,
  } from './types.js';

let currentBlobUrl: string | null = null;

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

  const blob =
    new Blob(
      [ html ],
      { type: 'text/html' });

  currentBlobUrl = URL.createObjectURL(blob);
  frame.src = currentBlobUrl;
}
