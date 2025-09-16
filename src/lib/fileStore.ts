import { randomUUID } from "crypto";

export interface FileEntry {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  uploadedAt: number;
}

const store = new Map<string, FileEntry>();

const TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanup() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.uploadedAt > TTL_MS) {
      store.delete(id);
    }
  }
}

export function saveFile(buffer: Buffer, filename: string, mimeType: string): string {
  cleanup();
  const id = randomUUID();
  store.set(id, { buffer, filename, mimeType, uploadedAt: Date.now() });
  console.log(`Saved file: ${id}, filename: ${filename}, store size: ${store.size}`);
  return id;
}

export function getFile(fileId: string): FileEntry | undefined {
  cleanup();
  const file = store.get(fileId);
  console.log(`Getting file: ${fileId}, found: ${file ? 'yes' : 'no'}`);
  if (file) {
    console.log(`File details: ${file.filename}, ${file.mimeType}, ${file.buffer.length} bytes`);
  }
  return file;
}

export function deleteFile(fileId: string): void {
  store.delete(fileId);
}
