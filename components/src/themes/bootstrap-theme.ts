import type {
    ComponentsTheme,
  } from './theme.js';

export function createBootstrapTheme(
  ): ComponentsTheme
{
  return {
    button:
      { addIcon: '<i class="bi bi-plus"></i>',
        deleteIcon: '<i class="bi bi-trash"></i>' },
  };
}