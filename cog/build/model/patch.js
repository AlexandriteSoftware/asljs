import fs from 'node:fs/promises';
export async function loadPatch(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);
    const patch = json;
    return patch;
}
