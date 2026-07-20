export type FileDataInfo = {
  mimeType: string;
  base64: string;
  dataUrl: string;
};

export function readFileDataInfo(
    content: string
  ): FileDataInfo | null
{
  const trimmed =
    content.trim();

  const match =
    /^data:([^;,]+);base64,([a-z0-9+/]+=*)$/i.exec(
      trimmed.replace(
        /\s+/g,
        ''));

  if (match === null) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase(),
    base64: match[2],
    dataUrl: trimmed
  };
}

export function isImageMimeType(
    mimeType: string
  ): boolean
{
  return /^image\//i.test(
    mimeType.trim());
}
