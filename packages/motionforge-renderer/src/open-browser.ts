import puppeteer, { type Browser } from 'puppeteer-core';
import { execa } from 'execa';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

let cachedBrowserPath: string | null = null;

/**
 * Ensure a Chrome binary is available and return its path.
 * Downloads a known-good version if not found.
 */
export async function ensureBrowserPath(): Promise<string> {
  if (cachedBrowserPath) return cachedBrowserPath;

  // Try to find an existing Chrome installation
  const candidates: string[] = [];

  if (os.platform() === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else if (os.platform() === 'linux') {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    );
  } else if (os.platform() === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    );
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cachedBrowserPath = candidate;
      return candidate;
    }
  }

  // Fall back to puppeteer's bundled browser download
  try {
    const { executablePath } = await import('puppeteer');
    cachedBrowserPath = executablePath();
    return cachedBrowserPath;
  } catch {
    throw new Error(
      'No Chrome/Chromium installation found. Install Chrome or set PUPPETEER_EXECUTABLE_PATH.'
    );
  }
}

/**
 * Launch a headless Chrome browser with optimized flags for video rendering.
 */
export async function ensureBrowser(): Promise<Browser> {
  const executablePath = await ensureBrowserPath();

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu-shm-usage',
      '--mute-audio',
      '--disable-extensions',
      '--no-zygote',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
    ],
    userDataDir: path.join(os.tmpdir(), `motionforge-chrome-${Date.now()}`),
  });
}
