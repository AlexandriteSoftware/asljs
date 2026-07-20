import { ImportedPayload,
         parseImportedPayloadText }
  from '../services/export-import.js';
import { FileRecord }
  from '../types.js';
import pdfParserJson
  from './PdfParser.json?raw';
import todoSampleJson
  from './TODO-Sample.json?raw';

const SAMPLE_JSON_SOURCES =
  [
  todoSampleJson,
  pdfParserJson
] as const;

function getSamples(
  ): ImportedPayload[]
{
  return SAMPLE_JSON_SOURCES
    .map(
      normalizeSampleSource)
    .map(
      parseImportedPayloadText);
}

export function listSamples(
  ): ImportedPayload[]
{
  return getSamples();
}

export function getSampleByName(
    name: string
  ): ImportedPayload | null
{
  const sample =
    getSamples().find(
      item => item.name === name);

  return sample ?? null;
}

export function getSampleById(
    id: string
  ): ImportedPayload | null
{
  const sample =
    getSamples().find(
      item => item.id === id);

  return sample ?? null;
}

export function buildSampleFiles(
    sample: ImportedPayload,
    appId: string,
    createId: () => string
  ): FileRecord[]
{
  return Object.entries(
    sample.files).map(
      ([fileName, content]) => ({
      id: createId(),
      appId,
      name: fileName,
      content
    }));
}

function normalizeSampleSource(
    source: unknown
  ): string
{
  if (typeof source === 'string') {
    return source;
  }

  if (source !== null && typeof source === 'object') {
    return JSON.stringify(source);
  }

  throw new Error('Invalid sample source format.');
}
