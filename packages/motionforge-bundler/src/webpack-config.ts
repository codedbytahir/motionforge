import webpack, { type Configuration } from 'webpack';
import path from 'path';

export interface WebpackConfigOptions {
  entry: string;
  outDir: string;
  dev: boolean;
  enableReactRefresh?: boolean;
}

export function webpackConfig(options: WebpackConfigOptions): Configuration {
  const isDev = options.dev;

  return {
    mode: isDev ? 'development' : 'production',
    entry: isDev ? [
      'webpack-hot-middleware/client',
      options.entry,
    ] : [options.entry],

    output: {
      path: options.outDir,
      filename: 'bundle.js',
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'esbuild-loader',
            options: { jsx: 'automatic', target: 'es2020' },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/,
          type: 'asset/resource',
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    plugins: [
      ...(isDev ? [
        new webpack.HotModuleReplacementPlugin(),
      ] : []),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      }),
    ],

    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',

    optimization: {
      minimize: !isDev,
    },
  };
}
