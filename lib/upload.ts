import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string | null> {
    if (!file || file.size === 0) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/${folder}/${filename}`;
}
