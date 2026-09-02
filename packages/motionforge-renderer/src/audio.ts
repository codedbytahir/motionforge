import { execa } from 'execa';
import * as path from 'path';
import * as fs from 'fs';

export interface AudioAsset {
  id: string;
  src: string;
  startInVideo: number;     // Frame where audio starts
  duration: number;          // Number of frames
  volume: number[];          // Per-frame volume values (0-1)
  playbackRate: number;
  trimLeft: number;          // Starting position in audio (in frames)
}

/**
 * Create an audio track from all assets found during frame rendering.
 * Returns the path to the final mixed audio file.
 */
export async function createAudio(
  assets: AudioAsset[],
  fps: number,
  outputDir: string,
  targetCodec: 'aac' | 'mp3' | 'flac' | 'wav' = 'aac'
): Promise<string | null> {
  if (assets.length === 0) return null;

  // Step 1: Preprocess each track
  const processedTracks: string[] = [];
  for (const asset of assets) {
    const trackPath = await preprocessAudioTrack(asset, fps, outputDir);
    processedTracks.push(trackPath);
  }

  // Step 2: Mix all tracks into a single WAV
  const mixedPath = path.join(outputDir, 'audio-mixed.wav');
  await mergeAudioTracks(processedTracks, mixedPath);

  // Step 3: Compress to target codec
  const outputPath = path.join(outputDir, `audio-final.${getExtension(targetCodec)}`);
  await compressAudio(mixedPath, outputPath, targetCodec);

  // Cleanup intermediate files
  for (const track of processedTracks) {
    if (fs.existsSync(track)) fs.unlinkSync(track);
  }
  if (fs.existsSync(mixedPath)) fs.unlinkSync(mixedPath);

  return outputPath;
}

async function preprocessAudioTrack(
  asset: AudioAsset,
  fps: number,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, `track-${asset.id}.wav`);

  // Build FFmpeg volume filter with per-frame volume values
  const volumeKeyframes = downsampleVolumeCurve(asset.volume, fps);
  const volumeFilter = volumeKeyframes
    .map(({ time, volume }) => `volume=${volume.toFixed(4)}:t=${time.toFixed(4)}`)
    .join(',');

  const trimStartSeconds = asset.trimLeft / fps;
  const durationSeconds = asset.duration / fps;

  const args: string[] = [
    '-i', asset.src,
    '-ss', String(trimStartSeconds),
    '-t', String(durationSeconds),
    '-af', volumeFilter + (asset.playbackRate !== 1 ? `,atempo=${asset.playbackRate}` : ''),
    '-ar', '48000',
    '-ac', '2',
    outputPath,
    '-y',
  ];

  await execa('ffmpeg', args);
  return outputPath;
}

function downsampleVolumeCurve(
  volume: number[],
  fps: number,
  threshold: number = 0.01
): Array<{ time: number; volume: number }> {
  if (volume.length === 0) return [];

  const keyframes: Array<{ time: number; volume: number }> = [];
  keyframes.push({ time: 0, volume: volume[0] });

  for (let i = 1; i < volume.length; i++) {
    if (Math.abs(volume[i] - (volume[i - 1] ?? 0)) > threshold) {
      keyframes.push({ time: i / fps, volume: volume[i] });
    }
  }

  return keyframes;
}

async function mergeAudioTracks(trackPaths: string[], outputPath: string): Promise<void> {
  if (trackPaths.length === 1) {
    fs.copyFileSync(trackPaths[0], outputPath);
    return;
  }

  const args: string[] = [];
  for (const track of trackPaths) {
    args.push('-i', track);
  }

  const filterParts = trackPaths.map((_, i) => `[${i}:a]`).join('');
  args.push('-filter_complex', `${filterParts}amix=inputs=${trackPaths.length}:duration=longest[out]`);
  args.push('-map', '[out]');
  args.push('-ar', '48000');
  args.push('-ac', '2');
  args.push(outputPath, '-y');

  await execa('ffmpeg', args);
}

async function compressAudio(
  inputPath: string,
  outputPath: string,
  codec: string
): Promise<void> {
  const codecArgs: Record<string, string[]> = {
    aac: ['-c:a', 'aac', '-b:a', '192k'],
    mp3: ['-c:a', 'libmp3lame', '-b:a', '192k'],
    flac: ['-c:a', 'flac'],
    wav: ['-c:a', 'pcm_s16le'],
  };

  const args = ['-i', inputPath, ...(codecArgs[codec] ?? codecArgs.aac), outputPath, '-y'];
  await execa('ffmpeg', args);
}

function getExtension(codec: string): string {
  const map: Record<string, string> = { aac: 'm4a', mp3: 'mp3', flac: 'flac', wav: 'wav' };
  return map[codec] ?? 'm4a';
}
