import { join } from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function deleteFileFromPublic(relativePath: string) {
  if (!relativePath) return;
  
  try {
    const fullPath = join(process.cwd(), 'public', relativePath);

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (error) {
    console.error(`[File System] Error deleting file ${relativePath}:`, error);
  }
}