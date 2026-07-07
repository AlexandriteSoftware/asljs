import { Location }
  from './location.js';

export interface ArtefactDefinitionRule {
    id: string;
    name: string;
    definition: string;
    description: string;
    path?: string;
}

export interface ArtefactDefinition {
    path: string;
    name: string;
    description: string;
    location: Location;
    rules: ArtefactDefinitionRule[];
}
