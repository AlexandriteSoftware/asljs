import {
  isImageMimeType,
  readFileDataInfo,
} from '../file-data.js';

export type FileListItem =
  { name: string;
    content: string; };

export type RenderFileSelectUiOptions =
  { selectElement: HTMLSelectElement;
    files: FileListItem[];
    activeFileName: string | null; };

export type RenderFileContentUiOptions =
  { textAreaElement: HTMLTextAreaElement;
    imagePreviewElement: HTMLImageElement;
    previewFallbackElement: HTMLElement;
    files: FileListItem[];
    activeFileName: string | null; };

export function renderFileSelectUi(
    options: RenderFileSelectUiOptions
  ): void
{
  const selectElement = options.selectElement;
  const visibleFiles =
    options.files.filter(file => !isHiddenFileName(file.name));

  selectElement.replaceChildren();

  if (visibleFiles.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No files';
    selectElement.appendChild(option);
    selectElement.value = '';
    selectElement.disabled = true;
    return;
  }

  for (const file of visibleFiles) {
    const option = document.createElement('option');
    option.value = file.name;
    option.textContent = file.name;
    selectElement.appendChild(option);
  }

  const active =
    options.activeFileName !== null
    && visibleFiles.some(file => file.name === options.activeFileName)
      ? options.activeFileName
      : visibleFiles[0].name;
  selectElement.value = active;
  selectElement.disabled = false;
}

export function renderFileContentUi(
    options: RenderFileContentUiOptions
  ): void
{
  const file = options.files.find(
    item => item.name === options.activeFileName);

  const fileData =
    file === undefined
      ? null
      : readFileDataInfo(file.content);

  const showImagePreview =
    fileData !== null
    && isImageMimeType(fileData.mimeType);

  options.textAreaElement.value = file?.content ?? '';
  options.textAreaElement.disabled = file === undefined || showImagePreview;
  options.textAreaElement.classList.toggle('hidden', showImagePreview);

  options.imagePreviewElement.classList.toggle('hidden', !showImagePreview);
  options.previewFallbackElement.classList.toggle('hidden', !showImagePreview);
  options.previewFallbackElement.textContent =
    showImagePreview
      ? `${fileData?.mimeType ?? ''} preview`
      : '';

  if (showImagePreview) {
    options.imagePreviewElement.src = fileData.dataUrl;
    options.imagePreviewElement.alt = file?.name ?? 'Image preview';
  } else {
    options.imagePreviewElement.removeAttribute('src');
    options.imagePreviewElement.alt = '';
  }
}

function isHiddenFileName(name: string): boolean {
  return name.startsWith('.');
}
