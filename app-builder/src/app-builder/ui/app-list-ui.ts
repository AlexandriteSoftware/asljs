export type AppListItem =
  { id: string;
    name: string;
    updatedAt: string; };

export type RenderAppListUiOptions =
  { selectElement: HTMLSelectElement;
    apps: AppListItem[];
    currentAppId: string | null;
    newActionValue: string;
    importActionValue: string; };

export function renderAppListUi(
    options: RenderAppListUiOptions
  ): void
{
  const selectElement = options.selectElement;

  selectElement.replaceChildren();

  const apps = [ ...options.apps ]
    .sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt));

  for (const app of apps) {
    const option = document.createElement('option');
    option.value = app.id;
    option.textContent = app.name;
    selectElement.appendChild(option);
  }

  if (apps.length > 0) {
    const separator = document.createElement('option');
    separator.value = '__separator__';
    separator.textContent = '────────';
    separator.disabled = true;
    selectElement.appendChild(separator);
  }

  const newOption = document.createElement('option');
  newOption.value = options.newActionValue;
  newOption.textContent = 'New...';
  selectElement.appendChild(newOption);

  const importOption = document.createElement('option');
  importOption.value = options.importActionValue;
  importOption.textContent = 'Import...';
  selectElement.appendChild(importOption);

  if (options.currentAppId !== null) {
    selectElement.value = options.currentAppId;
  }
}
