const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = evn => {
    const isProd = Boolean(evn.prod);

    return {
        entry: './src/index.tsx',
        output: {
            path: __dirname + '/dist',
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        { loader: "style-loader" },
                        { loader: "css-loader", options: { sourceMap: !isProd } },
                        { loader: "sass-loader", options: { sourceMap: !isProd } }
                    ]
                },
                {
                    test: /\.tsx?$/,
                    use: [{ loader: "ts-loader" }],
                    exclude: /node_modules/
                }
            ]
        },
        externals: {
            "react": "React",
            "react-dom": "ReactDOM",
            "immutable": "Immutable",
            "immer": "immer"
        },
        plugins: [new CleanWebpackPlugin(['dist'])],
        devtool: isProd ? undefined : 'inline-source-map',
        plugins: isProd ? [new UglifyJSPlugin()] : undefined
    };
};