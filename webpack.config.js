var config = {
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
  externals:{
    "react":"React",
    "react-dom":"ReactDOM"
  }
};

module.exports = config;