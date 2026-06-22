import fs from 'node:fs/promises';
import path from 'node:path';
export async function write(envelope, command) {
    await fs.mkdir(path.dirname(command.path), { recursive: true });
    await fs.writeFile(command.path, command.content, 'utf-8');
    envelope.commands
        .push(command);
}
