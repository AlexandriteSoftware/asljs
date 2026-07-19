import { AppBuilderButtonElement,
         configureButton,
         mustElement }
  from './control-ui.js';

export function renderShareModal(
  ): string
{
  return `
    <div id="share-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 44rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-share"></i><span>Share</span></h3>
          <asljs-button id="btn-close-share"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex gap-2 flex-wrap">
            <asljs-button id="btn-share-link"></asljs-button>
            <asljs-button id="btn-share-download"></asljs-button>
          </div>
          <label class="form-check d-flex align-items-start gap-2 mb-0">
            <input id="share-minified-input" class="form-check-input mt-1 ms-0" type="checkbox" />
            <span class="form-check-label text-body-secondary small">
            Share minified (esbuild JS/CSS + compact HTML/CSS)
            </span>
          </label>
          <label class="form-check d-flex align-items-start gap-2 mb-0">
            <input id="share-exclude-tests-input" class="form-check-input mt-1 ms-0" type="checkbox" />
            <span class="form-check-label text-body-secondary small">
            Only application files
            </span>
          </label>
          <p id="share-link-status" class="small text-body-secondary mb-0"></p>
          <textarea
            id="share-link-output"
            class="form-control"
            style="min-height: 8rem;"
            readonly
            placeholder="Share link will appear here..."
          ></textarea>
          <div class="d-flex gap-2 flex-wrap">
            <asljs-button id="btn-share-copy-text"></asljs-button>
            <asljs-button id="btn-share-copy-html"></asljs-button>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-close-share-2"></asljs-button>
        </div>
      </div>
    </div>
  `;
}

export type ShareModalOptions = {
  minified: boolean;
  excludeNonApplicationFiles: boolean;
};

export type ShareModalPreparedLink = {
  url: string;
  status: string;
};

export type ShareModalUi = {
  open: () => void;
  close: () => void;
};

export function createShareModalUi(
    options: {
    canOpen: () => boolean;
    readAppName: () => string;
    prepareLink: (
      shareOptions: ShareModalOptions
    ) => Promise<ShareModalPreparedLink>;
    downloadExport: (
      shareOptions: ShareModalOptions
    ) => Promise<void>;
  }
  ): ShareModalUi
{
  const elModal =
    mustElement<HTMLElement>('share-modal');

  const elBtnClose =
    mustElement(
      'btn-close-share');

  const elBtnCloseFooter =
    mustElement(
      'btn-close-share-2');

  const elBtnShareLink =
    mustElement(
      'btn-share-link');

  const elBtnShareDownload =
    mustElement(
      'btn-share-download');

  const elBtnCopyText =
    mustElement(
      'btn-share-copy-text');

  const elBtnCopyHtml =
    mustElement(
      'btn-share-copy-html');

  const elMinifiedInput =
    mustElement(
      'share-minified-input');

  const elExcludeTestsInput =
    mustElement(
      'share-exclude-tests-input');

  const elStatus =
    mustElement(
      'share-link-status');

  const elOutput =
    mustElement(
      'share-link-output');

  let preparationId = 0;

  configureButton(
    elBtnClose,
    {
      icon: '<i class="bi bi-x-lg"></i>',
      className: 'btn btn-outline-secondary btn-sm'
    }
  );

  configureButton(
    elBtnShareLink,
    {
      text: 'Share with link',
      className: 'btn btn-primary'
    }
  );

  configureButton(
    elBtnShareDownload,
    {
      text: 'Download export',
      className: 'btn btn-outline-secondary'
    }
  );

  configureButton(
    elBtnCopyText,
    {
      text: 'Copy as text link',
      className: 'btn btn-outline-secondary'
    }
  );

  configureButton(
    elBtnCopyHtml,
    {
      text: 'Copy as HTML link',
      className: 'btn btn-outline-secondary'
    }
  );

  configureButton(
    elBtnCloseFooter,
    {
      text: 'Close',
      className: 'btn btn-outline-secondary'
    }
  );

  function readShareOptions(
    ): ShareModalOptions
{
    return {
      minified: elMinifiedInput.checked,
      excludeNonApplicationFiles: elExcludeTestsInput.checked
    };
  }

  async function prepareShareLink(
    ): Promise<void>
{
    const requestId =
      ++preparationId;

    elOutput.value = '';
    elBtnShareLink.disabled = true;
    elBtnCopyText.disabled = true;
    elBtnCopyHtml.disabled = true;
    elStatus.textContent = 'Preparing share link...';

    try {
      const prepared =
        await options.prepareLink(
          readShareOptions());

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

  function close(
    ): void
{
    preparationId += 1;
    elModal.classList.add('hidden');
  }

  async function copyShareUrlAsText(
    ): Promise<void>
{
    if (elOutput.value.trim() === '') {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        elOutput.value
      );

      elStatus.textContent = 'Share link copied to clipboard.';
    } catch {
      elOutput.focus();
      elOutput.select();

      elStatus.textContent =
        'Could not copy automatically. Link is selected, copy it manually.';
    }
  }

  async function copyShareUrlAsHtml(
    ): Promise<void>
{
    const url =
      elOutput.value.trim();

    if (url === '') {
      return;
    }

    const appName =
      options.readAppName().trim() || 'Shared app';

    const html =
      `<a href="${escapeHtml(url)}">${escapeHtml(appName)}</a>`;

    try {
      if (
        typeof ClipboardItem !== 'undefined'
        && navigator.clipboard.write !== undefined
      ) {
        await navigator.clipboard.write(
          [
            new ClipboardItem(
              {
                'text/html': new Blob([html], { type: 'text/html' }),
                'text/plain': new Blob([url], { type: 'text/plain' })
              }
            )
          ]
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

  function escapeHtml(
      value: string
    ): string
{
    return value
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#39;'
      );
  }

  async function downloadExport(
    ): Promise<void>
{
    await options.downloadExport(
      readShareOptions()
    );
  }

  elBtnClose.addEventListener(
    'click',
    close
  );

  elBtnCloseFooter.addEventListener(
    'click',
    close
  );

  elBtnShareLink.addEventListener(
    'click',
    () =>
    {
      void copyShareUrlAsText();
    }
  );

  elBtnShareDownload.addEventListener(
    'click',
    () =>
    {
      void downloadExport();
    }
  );

  elBtnCopyText.addEventListener(
    'click',
    () =>
    {
      void copyShareUrlAsText();
    }
  );

  elBtnCopyHtml.addEventListener(
    'click',
    () =>
    {
      void copyShareUrlAsHtml();
    }
  );

  elMinifiedInput.addEventListener(
    'change',
    () =>
    {
      void prepareShareLink();
    }
  );

  elExcludeTestsInput.addEventListener(
    'change',
    () =>
    {
      void prepareShareLink();
    }
  );

  elModal.addEventListener(
    'click',
    (event: MouseEvent) =>
    {
      if (event.target === elModal) {
        close();
      }
    }
  );

  return {
    open(): void
    {
      if (!options.canOpen()) {
        return;
      }

      elModal.classList.remove('hidden');
      void prepareShareLink();
    },
    close
  };
}
