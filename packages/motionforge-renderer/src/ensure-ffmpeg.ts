import { execa } from 'execa';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

let cachedFfmpegPath: string | null = null;

/**
 * Ensure FFmpeg is available. Returns the path to the FFmpeg binary.
 * Checks PATH first, then common install locations.
 */
export async function ensureFfmpeg(): Promise<string> {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  // Try PATH
  try {
    await execa('ffmpeg', ['-version'], { reject: true });
    cachedFfmpegPath = 'ffmpeg';
    return 'ffmpeg';
  } catch {
    // Not in PATH
  }

  // Check common locations
  const candidates: string[] = [];
  if (os.platform() === 'darwin') {
    candidates.push('/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg');
  } else if (os.platform() === 'linux') {
    candidates.push('/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg');
  } else if (os.platform() === 'win32') {
    candidates.push('C:\\ffmpeg\\bin\\ffmpeg.exe');
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cachedFfmpegPath = candidate;
      return candidate;
    }
  }

  throw new Error(
    'FFmpeg not found. Install FFmpeg and add it to your PATH.\n' +
    '  macOS:   brew install ffmpeg\n' +
    '  Ubuntu:  sudo apt install ffmpeg\n' +
    '  Windows: Download from https://ffmpeg.org/download.html'
  );
}
