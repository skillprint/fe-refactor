const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: ['@babel/polyfill', './src/main.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `js/bundle.[hash].js`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new WebpackSynchronizableShellPlugin({
            onBuildStart: {
                scripts: ['node ./tools/prebuild/createAudiosprite'],
                blocking: true,
                parallel: false,
            },
            onBuildEnd: {
                scripts: ['node ./tools/postbuild/cacheBuster'],
                blocking: true,
                parallel: false,
            },
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, 'dist')],
            verbose: true,
            dry: false,
        }),
        new CopyPlugin({
            patterns: [{ from: './assets/live', to: './assets' }],
        }),
        new HtmlWebpackPlugin({
            template: './templates/index.html',
            cache: false,
        }),
        // new HtmlWebpackExternalsPlugin({
        //     externals: [
        //         {
        //             module: 'fapi',
        //             entry: '//api.ok.ru/js/fapi5.js',
        //             global: 'FAPI',
        //         },
        //     ],
        // }),
    ],
};
