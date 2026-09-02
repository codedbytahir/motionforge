import webpack from 'webpack';
import { webpackConfig } from './webpack-config.js';
import * as fs from 'fs';
import * as path from 'path';

export interface BundleOptions {
  entry: string;
  outDir: string;
  dev?: boolean;
}

export async function bundle(options: BundleOptions): Promise<void> {
  const config = webpackConfig({
    entry: options.entry,
    outDir: options.outDir,
    dev: options.dev ?? false,
  });

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats?.hasErrors()) {
        const info = stats.toJson();
        reject(new Error(info.errors?.[0].message));
        return;
      }

      compiler.close((closeErr) => {
        if (closeErr) {
          reject(closeErr);
        } else {
          resolve();
        }
      });
    });
  });
}
