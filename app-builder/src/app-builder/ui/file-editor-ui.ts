import {
  createImageFileHandler,
  createPdfFileHandler,
  createTextEditorFileHandler,
  type SelectItem,
  type FileViewData,
  type FileViewProvider,
} from 'asljs-components';
import {
  readFileDataInfo,
} from '../file-data.js';

export type FileListItem =
  { name: string;
    content: string; };

export type FileViewElement =
  HTMLElement
  & {
    provider: FileViewProvider | null;
    handlers: unknown[];
    fileName: string | null;
  };

type FileSelectElement = {
  items: SelectItem[];
  value: string | null;
  disabled: boolean;
};

export type RenderFileSelectUiOptions =
  { selectElement: FileSelectElement;
    files: FileListItem[];
    activeFileName: string | null; };

export type RenderFileContentUiOptions =
  { fileElement: FileViewElement;
    files: FileListItem[];
    activeFileName: string | null;
    onSaveText?: (
        fileName: string,
        text: string
      ) => Promise<void> | void; };

export function renderFileSelectUi(
    options: RenderFileSelectUiOptions
  ): void
{
  const selectElement = options.selectElement;
  const visibleFiles = options.files;

  if (visibleFiles.length === 0) {
    selectElement.items = [
      { value: '', label: 'No files', disabled: true },
    ];
    selectElement.value = '';
    selectElement.disabled = true;
    return;
  }

  selectElement.items =
    visibleFiles.map(file => ({
      value: file.name,
      label: file.name,
    }));

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
  const provider: FileViewProvider =
    { loadFile: async (fileName: string): Promise<FileViewData | null> => {
        const file =
          options.files.find(
            item => item.name === fileName);

        if (file === undefined) {
          return null;
        }

        const fileData =
          readFileDataInfo(file.content);

        if (fileData !== null) {
          return {
            name: file.name,
            mimeType: fileData.mimeType,
            dataUrl: fileData.dataUrl,
          };
        }

        return {
          name: file.name,
          text: file.content,
        };
      } };

  if (options.onSaveText !== undefined) {
    provider.saveText = options.onSaveText;
  }

  options.fileElement.provider = provider;
  options.fileElement.handlers =
    [ createPdfFileHandler(),
      createImageFileHandler(),
      createTextEditorFileHandler() ];
  options.fileElement.fileName = options.activeFileName;
}
