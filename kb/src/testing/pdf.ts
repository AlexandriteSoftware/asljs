/**
 * Build a minimal, single page PDF with one line of text, including a valid
 * cross-reference table. Used to test PDF text extraction without adding a
 * binary fixture to the repository.
 */
export function createSinglePagePdf(
    text: string
  ): Buffer
{
  const content =
    `BT /F1 24 Tf 20 120 Td (${escapeText(text)}) Tj ET\n`;

  const objects =
    [ '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
      + '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${content.length} >>\nstream\n${content}endstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' ];

  const offsets: number[] = [ ];

  let pdf = '%PDF-1.4\n';

  for (const [ index, body ] of objects.entries()) {
    offsets.push(pdf.length);

    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  }

  const startXref = pdf.length;

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const offset of offsets) {
    pdf += `${String(offset).padStart(
      10,
      '0')} 00000 n \n`;
  }

  pdf
    += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
    + `startxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(
    pdf,
    'latin1');
}

function escapeText(
    value: string
  ): string
{
  return value.replace(
    /[\\()]/g,
    '\\$&');
}
