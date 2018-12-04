let path = require(`path`);
let webpack = require(`webpack`);
let glob = require(`glob`);

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin({
  filename: 'css.bundle.css'
});

module.exports = {
  entry: [...glob.sync(`./src/resources/js/**.js`), ...glob.sync(`./src/resources/css/**.css`), ...glob.sync(`./src/resources/images/**.jpg`)],
  output: {
    path: path.resolve(__dirname, `./public`),
    filename: `app.bundle.js`
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules'
    ]
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }]
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },


      {
        test: /\.svg$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
            },
          },
        ],
      },

      {
        test: /\.(png|jpg|gif)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 100000
          }
        }]
      }

    ]
  },
  plugins: [
    extractCSS
  ]
};