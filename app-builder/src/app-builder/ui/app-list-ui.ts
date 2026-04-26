import type {
  SelectItem,
} from 'asljs-components';

type AppListSelectElement = {
  items: SelectItem[];
  value: string | null;
  disabled: boolean;
};

export type AppListItem =
  { id: string;
    name: string;
    updatedAt: string; };

export type RenderAppListUiOptions =
  { selectElement: AppListSelectElement;
    apps: AppListItem[];
    currentAppId: string | null;
    newActionValue: string;
    importActionValue: string; };

export function renderAppListUi(
    options: RenderAppListUiOptions
  ): void
{
  const selectElement = options.selectElement;

  const apps = [ ...options.apps ]
    .sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt));

  const items: SelectItem[] =
    apps.map(app => ({
      value: app.id,
      label: app.name,
    }));

  if (apps.length > 0) {
    items.push({
      value: '__separator__',
      label: '────────',
      disabled: true,
    });
  }

  items.push(
    { value: options.newActionValue, label: 'New...' },
    { value: options.importActionValue, label: 'Import...' },
  );

  selectElement.items = items;
  selectElement.disabled = items.length === 0;

  if (options.currentAppId !== null) {
    selectElement.value = options.currentAppId;
    return;
  }

  selectElement.value = items[0]?.value ?? '';
}
