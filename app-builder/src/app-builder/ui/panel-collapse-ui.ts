export type TogglePanelUiOptions =
  { panelElement: HTMLElement;
    toggleButtonElement: HTMLButtonElement;
    panelsElement: HTMLElement;
    collapsedPanelsClass: string;
    expandedLabel: string;
    collapsedLabel: string; };

export function togglePanelUi(
    options: TogglePanelUiOptions
  ): boolean
{
  const collapsed = !options.panelElement.classList.contains('collapsed');

  options.toggleButtonElement.textContent = collapsed
    ? options.collapsedLabel
    : options.expandedLabel;

  options.toggleButtonElement.setAttribute(
    'aria-expanded',
    collapsed
      ? 'false'
      : 'true');

  options.panelElement.classList.toggle('collapsed', collapsed);
  options.panelsElement.classList.toggle(
    options.collapsedPanelsClass,
    collapsed);

  return collapsed;
}
