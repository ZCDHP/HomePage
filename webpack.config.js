var config = {
  entry: './src/index.ts',
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
  node:false
};

module.exports = config;