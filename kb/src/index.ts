export {
  findBacklinks,
  resolveLinkTarget,
  type Backlink,
  type BacklinkOptions
} from './backlinks.js';

export {
  runCli
} from './cli.js';

export {
  createEnvironment,
  type Environment,
  type WritableBuffer
} from './environment.js';

export {
  copyEntry,
  createFolder,
  DEFAULT_EXCLUDES,
  listEntries,
  resolveTransferTarget,
  moveEntry,
  readTextFile,
  removeEntry,
  statEntry,
  writeTextFile,
  type EntryKind,
  type LibraryEntry,
  type ListOptions,
  type OverwriteOptions,
  type RemoveOptions,
  type TransferResult,
  type WriteOptions
} from './files.js';

export {
  extractCodeBlocks,
  extractData,
  extractHeadings,
  extractLinks,
  extractTables,
  extractTasks,
  EXTRACTION_KINDS,
  toExtractionKind,
  toPlainText,
  toSlug,
  type ExtractedCodeBlock,
  type ExtractedHeading,
  type ExtractedLink,
  type ExtractedTable,
  type ExtractedTask,
  type ExtractionKind,
  type LinkKind
} from './extract.js';

export {
  createLinkGraph,
  LinkGraph,
  type Article,
  type GraphLink,
  type GraphStats,
  type LinkGraphOptions
} from './graph.js';

export {
  formatLibrary,
  type FormatFileResult,
  type FormatOptions,
  type FormatReport
} from './format.js';

export {
  isInsideLibrary,
  LibraryPathError,
  resolveLibraryPath,
  resolveLibraryRoot,
  toLibraryPath
} from './library.js';

export {
  createLoggerProvider
} from './logger.js';

export {
  documentLine,
  documentOffset,
  formatMarkdown,
  parseMarkdown,
  splitFrontMatter,
  type FrontMatter,
  type MarkdownDocument
} from './markdown.js';

export {
  handleMessage,
  PROTOCOL_VERSION,
  runMcpServer,
  serveEndpoint,
  SERVER_NAME,
  type EndpointServer,
  type JsonRpcMessage,
  type JsonRpcResponse
} from './mcp/server.js';

export {
  connectToEndpoint,
  createInProcessClient,
  openClient,
  startInternalServer,
  type ClientKind,
  type McpClient,
  type OpenClientOptions
} from './mcp/client.js';

export {
  endpointFor,
  endpointIsFile
} from './mcp/endpoint.js';

export {
  main as runMcpMain
} from './mcp/main.js';

export {
  createTools,
  type McpTool
} from './mcp/tools.js';

export {
  createNote,
  documentTitle,
  isMarkdown,
  summarizeDocument,
  type CreateNoteOptions,
  type DocumentSummary
} from './notes.js';

export {
  createDefaultReaderRegistry
} from './readers/registry.js';

export {
  PdfReader
} from './readers/pdf-reader.js';

export {
  ReaderRegistry,
  type DocumentReader
} from './readers/reader.js';

export {
  TEXT_EXTENSIONS,
  TextReader
} from './readers/text-reader.js';

export {
  relocateEntry,
  renameEntry,
  type RelocatedFile,
  type RelocateOptions,
  type RelocateResult
} from './relocate.js';

export {
  retarget,
  rewriteLinks,
  type LinkEdit,
  type PathMapping,
  type RewriteResult,
  type SkippedLink
} from './link-rewrite.js';

export {
  searchLibrary,
  type SearchMatch,
  type SearchOptions,
  type SearchReport
} from './search.js';

export {
  watchLibrary,
  type LibraryWatcher,
  type WatchOptions
} from './watcher.js';
