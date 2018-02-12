const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: __dirname + '/dist',
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [new CleanWebpackPlugin(['dist'])]
};