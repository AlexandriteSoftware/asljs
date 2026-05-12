export type ComponentModelPropertyType =
  | 'array'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string';

export interface ComponentModelPropertyDefinition {
  name: string;
  type: ComponentModelPropertyType;
  title?: string;
  description?: string;
  editable?: boolean;
}

export interface ComponentModelDefinition {
  name: string;
  title?: string;
  properties: readonly ComponentModelPropertyDefinition[];
}