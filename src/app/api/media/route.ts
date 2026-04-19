import { promises as fs } from 'fs';
import path from 'path';

const PUBLIC_MEDIA_PATH = path.join(process.cwd(), 'public', 'media');

export async function GET() {
  try {
    console.log('API called, PUBLIC_MEDIA_PATH:', PUBLIC_MEDIA_PATH);
    const files = await fs.readdir(PUBLIC_MEDIA_PATH).catch((err) => {
      console.error('[API /api/media] Could not read /public/media:', err);
      throw new Error('Could not read /public/media: ' + err.message);
    });

    console.log('Files found:', files);

    const naturalSort = (a: string, b: string) => {
      const normalizedA = a.toLowerCase();
      const normalizedB = b.toLowerCase();
      return normalizedA.localeCompare(normalizedB, undefined, { numeric: true, sensitivity: 'base' });
    };

    const detectOrientation = (fileName: string, folderName: string): 'horizontal' | 'vertical' | 'unknown' => {
      const lower = fileName.toLowerCase();
      const folderLower = folderName.toLowerCase();
      if (/reel/.test(lower) || /reel/.test(folderLower)) {
        return 'vertical';
      }
      if (/cinema|cut/.test(lower) || /cinema|cut/.test(folderLower)) {
        return 'horizontal';
      }
      if (/vertical|portrait|vert/.test(lower) || /vertical|portrait|vert/.test(folderLower)) {
        return 'vertical';
      }
      if (/horizontal|landscape|horiz/.test(lower) || /horizontal|landscape|horiz/.test(folderLower)) {
        return 'horizontal';
      }
      return 'unknown';
    };

    const collectMediaItems = async (dirPath: string, folderName: string): Promise<Array<any>> => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const results: Array<any> = [];

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const nested = await collectMediaItems(entryPath, entry.name);
          results.push(...nested);
          continue;
        }

        if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.mp4')) {
          continue;
        }

        const id = path.basename(entry.name, '.mp4');
        const relDir = path.relative(PUBLIC_MEDIA_PATH, dirPath).replace(/\\/g, '/');
        const prefix = relDir ? `${relDir}/` : '';

        const possibleThumbExts = ['.jpg', '.jpeg', '.png', '.webp'];
        let thumbnailUrl = `/media/${prefix}${id}.jpg`;
        for (const ext of possibleThumbExts) {
          const candidate = `${id}${ext}`;
          if (entries.some((e) => e.isFile() && e.name.toLowerCase() === candidate)) {
            thumbnailUrl = `/media/${prefix}${id}${ext}`;
            break;
          }
        }

        const orientation = detectOrientation(entry.name, folderName);

        results.push({
          id,
          title: id.replace(/[-_]/g, ' '),
          videoUrl: `/media/${prefix}${entry.name}`,
          thumbnailUrl,
          orientation,
          folder: relDir || 'root',
        });
      }

      return results;
    };

    const mediaItems = await collectMediaItems(PUBLIC_MEDIA_PATH, 'root');
    mediaItems.sort((a, b) => naturalSort(a.id, b.id));

    return new Response(JSON.stringify({ items: mediaItems, count: mediaItems.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[API /api/media] Error:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return new Response(JSON.stringify({ error: 'Could not load media list', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
