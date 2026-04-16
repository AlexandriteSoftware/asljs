import todoSampleJson
  from './TODO-Sample.json?raw';
import pdfParserJson
  from './PdfParser.json?raw';
import {
  type FileRecord,
} from '../types.js';
import {
  parseImportedPayloadText,
  type ImportedPayload,
} from '../services/export-import.js';

const SAMPLE_JSON_SOURCES = [
  todoSampleJson,
  pdfParserJson,
] as const;

function getSamples(): ImportedPayload[] {
  return SAMPLE_JSON_SOURCES.map(parseImportedPayloadText);
}

export function getSampleByName(name: string): ImportedPayload | null {
  const sample = getSamples().find(item => item.name === name);
  return sample ?? null;
}

export function getSampleById(id: string): ImportedPayload | null {
  const sample = getSamples().find(item => item.id === id);
  return sample ?? null;
}

export function buildSampleFiles(
    sample: ImportedPayload,
    appId: string,
    createId: () => string,
  ): FileRecord[]
{
  return Object.entries(sample.files).map(([ fileName, content ]) => ({
    id: createId(),
    appId,
    name: fileName,
    content,
  }));
}