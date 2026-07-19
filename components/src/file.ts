import { html,
         LitElement }
  from 'lit';
import { customElement,
         property }
  from 'lit/decorators.js';
import { ComponentModelDefinition }
  from './abstractions/model.js';

export const FileViewModelDefinition: ComponentModelDefinition =
  {
  name: 'FileViewModelDefinition',
  title: 'File View',
  properties: [{
    name: 'provider',
    title: 'Provider',
    type: 'object',
    description: 'File provider used to load and optionally save files.'
  }, {
    name: 'handlers',
    title: 'Handlers',
    type: 'array',
    description: 'Ordered file handlers from most specific to most general.'
  }, {
    name: 'fileName',
    title: 'File name',
    type: 'string',
    description: 'Selected file name to preview.'
  }]
};

export interface FileViewData
{
  name: string;
  mimeType?: string | null;
  blob?: Blob | null;
  text?: string | null;
  dataUrl?: string | null;
}

export interface FileViewProvider
{
  loadFile: (fileName: string) => Promise<FileViewData | null>;
  saveText?: (
    fileName: string,
    text: string
  ) => Promise<void> | void;
}

export interface FileHandlerRenderResult
{
  element: HTMLElement;
  dispose?: () => void;
}

export interface FileHandlerRenderContext
{
  file: FileViewData;
  fileName: string;
  provider: FileViewProvider;
}

export interface FileHandler
{
  canDisplay: (file: FileViewData) => boolean | Promise<boolean>;
  render: (
    context: FileHandlerRenderContext
  ) => Promise<FileHandlerRenderResult> | FileHandlerRenderResult;
}

type ActiveRenderState =
  | { dispose?: (() => void) | undefined; }
  | null;

@customElement('asljs-file')
export class FileView extends LitElement
{
  #activeRenderState: ActiveRenderState = null;
  #renderRequestId = 0;

  @property(
    { attribute: false }
  )
  accessor provider: FileViewProvider | null = null;

  @property(
    { attribute: false }
  )
  accessor handlers: FileHandler[] = [];

  @property(
    { attribute: false }
  )
  accessor fileName: string | null = null;

  createRenderRoot(): this
  {
    return this;
  }

  disconnectedCallback(): void
  {
    this.#disposeActiveRender();
    super.disconnectedCallback();
  }

  render(): ReturnType<LitElement['render']>
  {
    return html`
      <div data-role="content"></div>
    `;
  }

  updated(
    changedProperties: Map<PropertyKey, unknown>
  ): void
  {
    if (
      changedProperties.has('provider')
      || changedProperties.has('handlers')
      || changedProperties.has('fileName')
    ) {
      void this.#refresh();
    }
  }

  async #refresh(): Promise<void>
  {
    const requestId =
      ++this.#renderRequestId;

    this.#disposeActiveRender();

    const contentHost =
      this.querySelector(
        '[data-role="content"]') as
      | HTMLElement
      | null;

    if (contentHost === null) {
      return;
    }

    if (this.fileName === null || this.fileName.trim() === '') {
      contentHost.replaceChildren(
        createMessageElement(
          'Select a file to preview.'
        )
      );

      return;
    }

    const provider =
      this.provider;

    if (provider === null) {
      contentHost.replaceChildren(
        createMessageElement(
          'File provider is not configured.'
        )
      );

      return;
    }

    contentHost.replaceChildren(
      createMessageElement(
        'Loading preview...'
      )
    );

    const file =
      await provider.loadFile(
        this.fileName);

    if (requestId !== this.#renderRequestId) {
      return;
    }

    if (file === null) {
      contentHost.replaceChildren(
        createMessageElement(
          'File content is not available.'
        )
      );

      return;
    }

    const handler =
      await findHandler(
        this.handlers,
        file);

    if (requestId !== this.#renderRequestId) {
      return;
    }

    if (handler === null) {
      const fallback =
        createFallbackElement(file);

      this.#activeRenderState = { dispose: fallback.dispose };

      contentHost.replaceChildren(
        fallback.element
      );

      return;
    }

    const result =
      await handler.render(
        { file, fileName: this.fileName, provider });

    if (requestId !== this.#renderRequestId) {
      result.dispose?.();
      return;
    }

    this.#activeRenderState = { dispose: result.dispose };

    contentHost.replaceChildren(
      result.element
    );
  }

  #disposeActiveRender(): void
  {
    this.#activeRenderState?.dispose?.();
    this.#activeRenderState = null;
  }
}

export function createPdfFileHandler(
  ): FileHandler
{
  return {
    canDisplay: file => isPdfFile(file),
    render: async ({ file }) =>
    {
      const source =
        await getObjectUrlSource(file);

      if (source === null) {
        return createUnavailableResult();
      }

      const frame =
        document.createElement('iframe');

      frame.src = `${source.url}#toolbar=1&navpanes=0`;
      frame.title = file.name;
      frame.referrerPolicy = 'no-referrer';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.minHeight = '32rem';
      frame.style.border = '0';

      return {
        element: frame,
        dispose: source.dispose
      };
    }
  };
}

export function createImageFileHandler(
  ): FileHandler
{
  return {
    canDisplay: file => isImageFile(file),
    render: async ({ file }) =>
    {
      const source =
        await getObjectUrlSource(file);

      if (source === null) {
        return createUnavailableResult();
      }

      const image =
        document.createElement('img');

      image.src = source.url;
      image.alt = file.name;
      image.style.display = 'block';
      image.style.maxWidth = '100%';
      image.style.maxHeight = '100%';
      image.style.objectFit = 'contain';

      return {
        element: image,
        dispose: source.dispose
      };
    }
  };
}

export function createTextFileHandler(
  ): FileHandler
{
  return {
    canDisplay: file => isTextFile(file),
    render: async ({ file }) =>
    {
      const text =
        await resolveText(file);

      if (text === null) {
        return createUnavailableResult();
      }

      const pre =
        document.createElement('pre');

      pre.textContent = text;
      pre.style.margin = '0';
      pre.style.whiteSpace = 'pre-wrap';

      return {
        element: pre
      };
    }
  };
}

export function createTextEditorFileHandler(
  ): FileHandler
{
  return {
    canDisplay: file => isTextFile(file),
    render: async ({ file, fileName, provider }) =>
    {
      const text =
        await resolveText(file);

      if (text === null) {
        return createUnavailableResult();
      }

      const textArea =
        document.createElement('textarea');

      textArea.value = text;
      textArea.disabled = provider.saveText === undefined;
      textArea.spellcheck = false;
      textArea.style.width = '100%';
      textArea.style.height = '100%';
      textArea.style.minHeight = '16rem';
      textArea.style.border = '0';
      textArea.style.resize = 'none';
      textArea.style.padding = '0.75rem';

      textArea.style.fontFamily =
        'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace';

      textArea.style.fontSize = '0.8rem';
      textArea.style.lineHeight = '1.6';
      textArea.style.boxSizing = 'border-box';

      if (provider.saveText !== undefined) {
        textArea.addEventListener(
          'blur',
          () =>
          {
            void provider.saveText?.(
              fileName,
              textArea.value
            );
          }
        );
      }

      return {
        element: textArea
      };
    }
  };
}

async function findHandler(
    handlers: FileHandler[],
    file: FileViewData
  ): Promise<FileHandler | null>
{
  for (const handler of handlers) {
    if (await handler.canDisplay(file)) {
      return handler;
    }
  }

  return null;
}

function createMessageElement(
    text: string
  ): HTMLElement
{
  const element =
    document.createElement('div');

  element.textContent = text;
  element.style.color = 'var(--bs-secondary-color, #6c757d)';

  return element;
}

function createUnavailableResult(
  ): FileHandlerRenderResult
{
  return {
    element: createMessageElement(
      'Preview unavailable for this file type.'
    )
  };
}

function createFallbackElement(
    file: FileViewData
  ): FileHandlerRenderResult
{
  const root =
    document.createElement('div');

  root.style.display = 'flex';
  root.style.alignItems = 'center';
  root.style.gap = '0.5rem';

  const message =
    createMessageElement(
      'Preview unavailable for this file type.');

  root.appendChild(message);

  if (file.blob || file.dataUrl) {
    const link =
      document.createElement('a');

    link.textContent = 'Open';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    if (file.dataUrl) {
      link.href = file.dataUrl;
      root.appendChild(link);
      return { element: root };
    }

    const url =
      URL.createObjectURL(
        file.blob!);

    link.href = url;
    root.appendChild(link);

    return {
      element: root,
      dispose: () =>
      {
        URL.revokeObjectURL(url);
      }
    };
  }

  return {
    element: root
  };
}

type ObjectUrlSource = { url: string; dispose?: () => void; };

async function getObjectUrlSource(
    file: FileViewData
  ): Promise<ObjectUrlSource | null>
{
  if (file.dataUrl) {
    return {
      url: file.dataUrl
    };
  }

  if (file.blob) {
    if (
      isPdfFile(file)
      && normalizeMimeType(
        file.mimeType ?? file.blob.type)
        !== 'application/pdf'
    ) {
      const pdfBlob =
        new Blob(
        [await file.blob.arrayBuffer()],
        { type: 'application/pdf' }
      );

      const pdfUrl =
        URL.createObjectURL(pdfBlob);

      return {
        url: pdfUrl,
        dispose: () =>
        {
          URL.revokeObjectURL(pdfUrl);
        }
      };
    }

    const url =
      URL.createObjectURL(
        file.blob);

    return {
      url,
      dispose: () =>
      {
        URL.revokeObjectURL(url);
      }
    };
  }

  return null;
}

async function resolveText(
    file: FileViewData
  ): Promise<string | null>
{
  if (typeof file.text === 'string') {
    return file.text;
  }

  if (file.blob && isTextFile(file)) {
    return await file.blob.text();
  }

  return null;
}

function isPdfFile(
    file: FileViewData
  ): boolean
{
  return normalizeMimeType(
    file.mimeType ?? file.blob?.type)
      === 'application/pdf'
    || getLowerFileName(file).endsWith('.pdf');
}

function isImageFile(
    file: FileViewData
  ): boolean
{
  const mimeType =
    normalizeMimeType(
      file.mimeType ?? file.blob?.type);

  return mimeType.startsWith('image/')
    || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(
      file.name
    );
}

function isTextFile(
    file: FileViewData
  ): boolean
{
  if (typeof file.text === 'string') {
    return true;
  }

  const mimeType =
    normalizeMimeType(
      file.mimeType ?? file.blob?.type);

  return mimeType.startsWith('text/')
    || ['application/json', 'application/xml', 'image/svg+xml'].includes(
      mimeType
    )
    || /\.(txt|csv|json|xml|html|htm|md|markdown|svg)$/i.test(
      file.name
    );
}

function normalizeMimeType(
    mimeType: string | null | undefined
  ): string
{
  return (mimeType ?? '').trim().toLowerCase();
}

function getLowerFileName(
    file: FileViewData
  ): string
{
  return file.name.toLowerCase();
}
