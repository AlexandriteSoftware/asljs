import {
    observable,
    type Observable,
  } from 'asljs-observable';
import {
    type ComponentModelDefinition,
  } from './component-model.js';

export type ComponentPreviewModel =
  Observable<Record<string, unknown>>;

export interface ComponentPreviewBinding {
  model: ComponentPreviewModel;
  syncFromComponent: () => void;
  dispose: () => void;
}

export function createComponentPreviewModel(
    definition: ComponentModelDefinition,
    component: Record<string, unknown>
  ): ComponentPreviewModel
{
  return observable(
    extractComponentModelValues(
      definition,
      component));
}

export function bindComponentPreviewModel(
    definition: ComponentModelDefinition,
    model: ComponentPreviewModel,
    component: EventTarget & Record<string, unknown>
  ): ComponentPreviewBinding
{
  const editablePropertyNames =
    new Set(
      definition.properties
        .filter(
          property => isPropertyEditable(property))
        .map(
          property => property.name));

  const modelChangeDispose =
    model.on(
      'set',
      ({ property, value }) => {
        if (!editablePropertyNames.has(property)) {
          return;
        }

        component[property] = value;
      });

  const syncFromComponent =
    (): void => {
      for (const property of definition.properties) {
        const nextValue =
          component[property.name];

        if (!Object.is(model[property.name], nextValue)) {
          model[property.name] = nextValue;
        }
      }
    };

  const handleComponentChanged =
    (): void => {
      syncFromComponent();
    };

  component.addEventListener(
    'input',
    handleComponentChanged);
  component.addEventListener(
    'change',
    handleComponentChanged);

  syncFromComponent();

  return {
    model,
    syncFromComponent,
    dispose: (): void => {
      modelChangeDispose();
      component.removeEventListener(
        'input',
        handleComponentChanged);
      component.removeEventListener(
        'change',
        handleComponentChanged);
    },
  };
}

function extractComponentModelValues(
    definition: ComponentModelDefinition,
    component: Record<string, unknown>
  ): Record<string, unknown>
{
  return Object.fromEntries(
    definition.properties.map(
      property => [ property.name,
                    component[property.name] ]));
}

function isPropertyEditable(
    property: ComponentModelDefinition['properties'][number]
  ): boolean
{
  if (property.editable !== undefined) {
    return property.editable;
  }

  return property.type === 'boolean'
    || property.type === 'number'
    || property.type === 'string';
}