import { execa } from 'execa';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface StitchOptions {
  /** Array of PNG frame buffers (in order) */
  frameBuffers?: Buffer[];
  /** Path pattern for frame images on disk (alternative to frameBuffers) */
  inputPattern?: string;
  /** Output file path */
  outputPath: string;
  /** Frames per second */
  fps: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Video codec */
  codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores' | 'gif';
  /** CRF quality value (default: codec-specific) */
  crf?: number;
  /** Pixel format */
  pixelFormat?: 'yuv420p' | 'yuv422p' | 'rgb24';
  /** Quality preset */
  quality?: 'low' | 'medium' | 'high';
  /** Path to audio file to include */
  audioPath?: string;
  /** Progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * Stitch frame images into a video file using FFmpeg.
 */
export async function stitchFramesToVideo(options: StitchOptions): Promise<string> {
  const args: string[] = ['-y'];

  // Input source
  if (options.frameBuffers) {
    // Pipe frames directly via stdin (parallel encoding)
    args.push(
      '-f', 'image2pipe',
      '-s', `${options.width}x${options.height}`,
      '-pix_fmt', 'rgba',
      '-r', String(options.fps),
      '-i', 'pipe:0'
    );
  } else if (options.inputPattern) {
    // Read frame images from disk
    args.push(
      '-framerate', String(options.fps),
      '-i', options.inputPattern
    );
  } else {
    throw new Error('Must provide either frameBuffers or inputPattern');
  }

  // Audio input
  if (options.audioPath && fs.existsSync(options.audioPath)) {
    args.push('-i', options.audioPath, '-c:a', 'aac', '-b:a', '192k');
  }

  // Codec-specific arguments
  switch (options.codec) {
    case 'h264':
      args.push('-c:v', 'libx264');
      args.push('-crf', String(options.crf ?? 18));
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      args.push('-preset', options.quality === 'high' ? 'slow' : options.quality === 'low' ? 'ultrafast' : 'medium');
      args.push('-movflags', 'faststart');
      break;
    case 'h265':
      args.push('-c:v', 'libx265');
      args.push('-crf', String(options.crf ?? 22));
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      args.push('-preset', options.quality === 'high' ? 'slow' : options.quality === 'low' ? 'ultrafast' : 'medium');
      args.push('-movflags', 'faststart');
      break;
    case 'vp8':
      args.push('-c:v', 'libvpx');
      args.push('-crf', String(options.crf ?? 10));
      args.push('-b:v', '0');
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      break;
    case 'vp9':
      args.push('-c:v', 'libvpx-vp9');
      args.push('-crf', String(options.crf ?? 30));
      args.push('-b:v', '0');
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      break;
    case 'prores':
      args.push('-c:v', 'prores_ks');
      args.push('-profile:v', '3'); // ProRes 4444
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv422p');
      break;
    case 'gif':
      args.push(
        '-filter_complex',
        `[0:v] fps=${Math.min(options.fps, 15)},split [a][b];[a] palettegen [p];[b][p] paletteuse`
      );
      break;
  }

  // Color space metadata
  if (options.codec !== 'gif') {
    args.push('-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709');
  }

  args.push(options.outputPath);

  // Execute FFmpeg
  if (options.frameBuffers) {
    // Pipe mode — write frames to stdin
    const ffmpegProcess = execa('ffmpeg', args, { stdin: 'pipe', reject: false });

    for (const buffer of options.frameBuffers) {
      ffmpegProcess.stdin!.write(buffer);
    }
    ffmpegProcess.stdin!.end();

    const result = await ffmpegProcess;
    if (result.exitCode !== 0) {
      throw new Error(`FFmpeg failed (exit ${result.exitCode}): ${result.stderr}`);
    }
  } else {
    // File mode — just execute
    const result = await execa('ffmpeg', args, { reject: false });
    if (result.exitCode !== 0) {
      throw new Error(`FFmpeg failed (exit ${result.exitCode}): ${result.stderr}`);
    }
  }

  return options.outputPath;
}
