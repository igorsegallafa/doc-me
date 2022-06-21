const path = require('path');
const glob = require('glob');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'app': glob.sync('./vendor/**/*.js').concat(['./js/app.js'])
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../priv/static/js'),
        publicPath: '/js/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.[s]?css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: "../assets/app.css"}),
        new CopyWebpackPlugin({
            patterns: [{ from: 'static/', to: '../' }],
        }),
    ]
};