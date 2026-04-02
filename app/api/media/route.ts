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

    const mediaItems = files
      .filter((file) => file.toLowerCase().endsWith('.mp4'))
      .map((file) => {
        const id = path.basename(file, '.mp4');
        const possibleThumbExts = ['.jpg', '.jpeg', '.png'];
        let thumbnailUrl = `/media/${id}.jpg`;
        for (const ext of possibleThumbExts) {
          if (files.includes(`${id}${ext}`)) {
            thumbnailUrl = `/media/${id}${ext}`;
            break;
          }
        }
        return {
          id,
          title: id.replace(/[-_]/g, ' '),
          videoUrl: `/media/${file}`,
          thumbnailUrl,
        };
      });

    return new Response(JSON.stringify({ items: mediaItems, count: mediaItems.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[API /api/media] Error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ error: 'Could not load media list', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
