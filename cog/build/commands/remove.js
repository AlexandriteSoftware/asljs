import fs from 'node:fs/promises';
export async function remove(envelope, command) {
    await fs.rm(command.path, { force: true });
    envelope.commands
        .push(command);
    const fileIndex = envelope.files
        .findIndex(file => file.path === command.path);
    if (fileIndex !== -1) {
        envelope.files.splice(fileIndex, 1);
    }
}
