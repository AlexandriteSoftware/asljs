type ToggleButtonElement =
  HTMLElement
  & {
    text?: string;
  };

export type TogglePanelUiOptions =
  { panelElement: HTMLElement;
    toggleButtonElement: ToggleButtonElement;
    panelsElement: HTMLElement;
    collapsedPanelsClass: string;
    expandedLabel: string;
    collapsedLabel: string; };

export function togglePanelUi(
    options: TogglePanelUiOptions
  ): boolean
{
  const collapsed = !options.panelElement.classList.contains('collapsed');

  const nextLabel =
    collapsed
      ? options.collapsedLabel
      : options.expandedLabel;

  if ('text' in options.toggleButtonElement) {
    options.toggleButtonElement.text = nextLabel;
  } else {
    options.toggleButtonElement.textContent = nextLabel;
  }

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
