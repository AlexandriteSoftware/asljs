import fs from 'node:fs/promises';
const textDecoder = new TextDecoder('utf-8', { fatal: true });
export async function read(envelope, command) {
    const file = await getEnvelopeFile(command.path);
    envelope.commands
        .push(command);
    const fileIndex = envelope.files
        .findIndex(file => file.path === command.path);
    if (fileIndex === -1) {
        envelope.files
            .push(file);
    }
    else {
        envelope.files[fileIndex] =
            file;
    }
}
async function getEnvelopeFile(filePath) {
    let content;
    const data = await fs.readFile(filePath);
    try {
        content = textDecoder.decode(data);
    }
    catch {
        return { path: filePath, type: "binary" };
    }
    return {
        path: filePath,
        type: "text",
        content,
        complete: true
    };
}
