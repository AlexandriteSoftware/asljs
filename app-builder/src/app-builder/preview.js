/**
 * Preview module for ASLJS App Builder.
 *
 * Renders generated app files into a sandboxed iframe using a blob URL.
 * Generated code runs in an isolated context (sandbox="allow-scripts")
 * and cannot access the parent page or network.
 */

/** @type {string | null} */
let _currentBlobUrl = null;

/**
 * Render the given files into the preview iframe.
 *
 * @param {HTMLIFrameElement} frame - Target iframe element
 * @param {Array<{name: string, content: string}>} files - App files
 * @returns {void}
 */
export function renderPreview(
    frame,
    files
  ) {
  // Revoke previous blob URL to free memory
  if (_currentBlobUrl) {
    URL.revokeObjectURL(_currentBlobUrl);
    _currentBlobUrl = null;
  }

  if (!files.length) {
    frame.src = 'about:blank';
    return;
  }

  // Find the entry file (index.html or first .html file)
  const htmlFile =
    files.find(f => f.name === 'index.html')
    ?? files.find(f => f.name.endsWith('.html'))
    ?? null;

  if (!htmlFile) {
    frame.src = 'about:blank';
    return;
  }

  // Inline CSS and JS into the HTML so blob: navigation works
  // without cross-origin blob: URL issues for sub-resources
  let html = htmlFile.content;

  // Replace <link rel="stylesheet" href="style.css"> with inline <style>
  const cssFile =
    files.find(f => f.name === 'style.css')
    ?? files.find(f => f.name.endsWith('.css'))
    ?? null;

  if (cssFile) {
    html = html.replace(
      /<link[^>]+href=["']style\.css["'][^>]*>/gi,
      `<style>${cssFile.content}</style>`);

    // Also try any .css reference
    html = html.replace(
      /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,
      (_, _name) =>
        `<style>${cssFile.content}</style>`);
  }

  // Replace <script src="app.js"> with inline <script>
  for (const file of files) {
    if (!file.name.endsWith('.js')) {
      continue;
    }

    const escaped =
      file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    html = html.replace(
      new RegExp(
        `<script[^>]+src=["']${escaped}["'][^>]*><\\/script>`,
        'gi'),
      `<script>${file.content}</script>`);
  }

  const blob =
    new Blob(
      [ html ],
      { type: 'text/html' });

  _currentBlobUrl = URL.createObjectURL(blob);
  frame.src = _currentBlobUrl;
}
