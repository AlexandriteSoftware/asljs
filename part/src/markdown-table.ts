export interface Column
{
  property: string;
  name?: string;
}

export function renderObjectsToMarkdownTable(
  columns: Column[],
  objects: Record<string, any>[]
): string
{
  const minWidth = 3;

  const properties =
    columns.map(
      (column) =>
      typeof column === 'string'
        ? column
        : column.property);

  const headers =
    columns.map(
      (column) =>
      typeof column === 'string'
        ? column
        : (column.name
          ?? column.property));

  const widths =
    properties.map(
      (property) =>
    {
      const columnWidths =
        objects.map(
          (row) =>
        {
          const text =
            String(
              row[property]);

          return text.length;
        });

      columnWidths.push(
        property.length
      );

      columnWidths.push(
        minWidth
      );

      return Math.max(
        ...columnWidths
      );
    });

  const lines = [];

  lines.push(
    renderRow(
      headers,
      widths
    )
  );

  lines.push(
    renderRow(
      widths.map(
        (width) => '-'.repeat(width)
      ),
      widths
    )
  );

  for (const obj of objects) {
    lines.push(
      renderRow(
        properties.map(
          (property) =>
            String(
              obj[property]
            )
        ),
        widths
      )
    );
  }

  return lines.join('\n');
}

function renderRow(
  cells: any[],
  widths: number[]
): string
{
  const md = [];

  for (
    let index = 0;
    index < cells.length;
    index++
  ) {
    const cell =
      cells[index];

    const width =
      widths[index];

    md.push(
      cell.padEnd(width)
    );
  }

  return `| ${md.join(' | ')} |`;
}
