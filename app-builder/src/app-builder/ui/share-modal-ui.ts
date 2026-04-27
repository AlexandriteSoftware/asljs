import {
  configureButton,
  mustElement,
  type AppBuilderButtonElement,
} from './control-ui.js';

export function renderShareModal(): string {
  return `
    <div id="share-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>Share</h3>
          <asljs-button id="btn-close-share"></asljs-button>
        </div>
        <div class="modal-body">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <asljs-button id="btn-share-link"></asljs-button>
            <asljs-button id="btn-share-download"></asljs-button>
          </div>
          <label class="form-hint" style="display:block; margin-top:0.6rem;">
            <input id="share-minified-input" type="checkbox" />
            Share minified (esbuild JS/CSS + compact HTML/CSS)
          </label>
          <label class="form-hint" style="display:block; margin-top:0.35rem;">
            <input id="share-exclude-tests-input" type="checkbox" />
            Only application files
          </label>
          <p id="share-link-status" class="form-hint"></p>
          <textarea
            id="share-link-output"
            class="prompt-view"
            style="min-height: 8rem;"
            readonly
            placeholder="Share link will appear here..."
          ></textarea>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
            <asljs-button id="btn-share-copy-text"></asljs-button>
            <asljs-button id="btn-share-copy-html"></asljs-button>
          </div>
        </div>
        <div class="modal-footer">
          <asljs-button id="btn-close-share-2"></asljs-button>
        </div>
      </div>
    </div>
  `;
}

export type ShareModalOptions =
  {
    minified: boolean;
    excludeNonApplicationFiles: boolean;
  };

export type ShareModalPreparedLink =
  {
    url: string;
    status: string;
  };

export type ShareModalUi =
  {
    open: () => void;
    close: () => void;
  };

export function createShareModalUi(
    options: {
      canOpen: () => boolean;
      readAppName: () => string;
      prepareLink: (
        shareOptions: ShareModalOptions,
      ) => Promise<ShareModalPreparedLink>;
      downloadExport: (
        shareOptions: ShareModalOptions,
      ) => Promise<void>;
    }
  ): ShareModalUi
{
  const elModal = mustElement<HTMLElement>('share-modal');
  const elBtnClose = mustElement<AppBuilderButtonElement>('btn-close-share');
  const elBtnCloseFooter =
    mustElement<AppBuilderButtonElement>('btn-close-share-2');
  const elBtnShareLink = mustElement<AppBuilderButtonElement>('btn-share-link');
  const elBtnShareDownload =
    mustElement<AppBuilderButtonElement>('btn-share-download');
  const elBtnCopyText =
    mustElement<AppBuilderButtonElement>('btn-share-copy-text');
  const elBtnCopyHtml =
    mustElement<AppBuilderButtonElement>('btn-share-copy-html');
  const elMinifiedInput = mustElement<HTMLInputElement>('share-minified-input');
  const elExcludeTestsInput =
    mustElement<HTMLInputElement>('share-exclude-tests-input');
  const elStatus = mustElement<HTMLElement>('share-link-status');
  const elOutput = mustElement<HTMLTextAreaElement>('share-link-output');

  let preparationId = 0;

  configureButton(elBtnClose, {
    text: '✕',
    className: 'btn btn-ghost btn-sm',
  });
  configureButton(elBtnShareLink, {
    text: 'Share with link',
    className: 'btn btn-primary',
  });
  configureButton(elBtnShareDownload, {
    text: 'Download export',
    className: 'btn btn-ghost',
  });
  configureButton(elBtnCopyText, {
    text: 'Copy as text link',
    className: 'btn btn-ghost',
  });
  configureButton(elBtnCopyHtml, {
    text: 'Copy as HTML link',
    className: 'btn btn-ghost',
  });
  configureButton(elBtnCloseFooter, {
    text: 'Close',
    className: 'btn btn-ghost',
  });

  function readShareOptions(): ShareModalOptions {
    return {
      minified: elMinifiedInput.checked,
      excludeNonApplicationFiles: elExcludeTestsInput.checked,
    };
  }

  async function prepareShareLink(): Promise<void> {
    const requestId = ++preparationId;

    elOutput.value = '';
    elBtnShareLink.disabled = true;
    elBtnCopyText.disabled = true;
    elBtnCopyHtml.disabled = true;
    elStatus.textContent = 'Preparing share link...';

    try {
      const prepared = await options.prepareLink(readShareOptions());

      if (requestId !== preparationId) {
        return;
      }

      elOutput.value = prepared.url;
      elStatus.textContent = prepared.status;
      elBtnShareLink.disabled = false;
      elBtnCopyText.disabled = false;
      elBtnCopyHtml.disabled = false;
    } catch (error) {
      if (requestId !== preparationId) {
        return;
      }

      elStatus.textContent = error instanceof Error
        ? error.message
        : String(error);
    }
  }

  function close(): void {
    preparationId += 1;
    elModal.classList.add('hidden');
  }

  async function copyShareUrlAsText(): Promise<void> {
    if (elOutput.value.trim() === '') {
      return;
    }

    try {
      await navigator.clipboard.writeText(elOutput.value);
      elStatus.textContent = 'Share link copied to clipboard.';
    } catch {
      elOutput.focus();
      elOutput.select();
      elStatus.textContent =
        'Could not copy automatically. Link is selected, copy it manually.';
    }
  }

  async function copyShareUrlAsHtml(): Promise<void> {
    const url = elOutput.value.trim();

    if (url === '') {
      return;
    }

    const appName = options.readAppName().trim() || 'Shared app';
    const html = `<a href="${escapeHtml(url)}">${escapeHtml(appName)}</a>`;

    try {
      if (typeof ClipboardItem !== 'undefined'
          && navigator.clipboard.write !== undefined)
      {
        await navigator.clipboard.write(
          [
            new ClipboardItem(
              {
                'text/html': new Blob([ html ], { type: 'text/html' }),
                'text/plain': new Blob([ url ], { type: 'text/plain' }),
              },
            ),
          ],
        );

        elStatus.textContent = 'HTML link copied to clipboard.';
        return;
      }

      await navigator.clipboard.writeText(url);
      elStatus.textContent =
        'HTML clipboard is unavailable here. URL copied as text.';
    } catch {
      elOutput.focus();
      elOutput.select();
      elStatus.textContent =
        'Could not copy automatically. Link is selected, copy it manually.';
    }
  }

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function downloadExport(): Promise<void> {
    await options.downloadExport(readShareOptions());
  }

  elBtnClose.addEventListener('click', close);
  elBtnCloseFooter.addEventListener('click', close);
  elBtnShareLink.addEventListener('click', () => {
    void copyShareUrlAsText();
  });
  elBtnShareDownload.addEventListener('click', () => {
    void downloadExport();
  });
  elBtnCopyText.addEventListener('click', () => {
    void copyShareUrlAsText();
  });
  elBtnCopyHtml.addEventListener('click', () => {
    void copyShareUrlAsHtml();
  });
  elMinifiedInput.addEventListener('change', () => {
    void prepareShareLink();
  });
  elExcludeTestsInput.addEventListener('change', () => {
    void prepareShareLink();
  });
  elModal.addEventListener('click', (event: MouseEvent) => {
    if (event.target === elModal) {
      close();
    }
  });

  return {
    open(): void {
      if (!options.canOpen()) {
        return;
      }

      elModal.classList.remove('hidden');
      void prepareShareLink();
    },
    close,
  };
}
