const webpack = require("webpack")
module.exports = {
  context: __dirname ,
  watch:true,
  entry: "./js/main.js",
  output: {
    path:__dirname,
    filename:"./dist/dist.js",
  },
  module: {
    rules: [
      // { 
      //   test: /\.js$/, 
      //   exclude: /node_modules/, 
      //   loader: "babel", 
      //   query:{
      //     presets: ['es2015']
      //   }
      // },
      //{ test: /\.html$/, use: 'html-loader' },
      {
        test: /\.scss$/,
        use:[{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      },{
        test: /\.css$/, use:[{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }]
      },{
        test: /\.html$/,
        use: 'vue-template-loader'
      }
    ]
  }
};
