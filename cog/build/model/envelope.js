import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export async function loadEnvelope(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(content);
        const envelope = json;
        return envelope;
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        return {
            instruction: await loadInstruction(),
            commands: [],
            files: []
        };
    }
}
async function loadInstruction() {
    const instructionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/files/Instruction.txt');
    return fs.readFile(instructionPath, 'utf-8');
}
export async function saveEnvelope(envelope, filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(envelope, null, 2)}\n`, 'utf-8');
}
