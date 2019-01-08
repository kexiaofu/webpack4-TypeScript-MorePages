const HTMLWebpackPlugin = require('html-webpack-plugin');
const optimizeCss = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';
const path = require('path'),
      htmlDir =   path.join(__dirname , '/src/html');
      jsDir = path.join(__dirname , '/src/js');
const tools = require('./getAllScript');

const htmls = tools.getAllScript(htmlDir, '.html');

const htmlFiles = [];

console.log(process.env.NODE_ENV );

for(let k in htmls) {
  htmlFiles.push(new HTMLWebpackPlugin({
    title: k,
    template: htmls[k],
    filename: path.normalize(htmls[k].replace(htmlDir, 'html/')),
    chunks: [k, '../common/vendor', '../common/manifest'],
    hash: true,
    minify: {
      removeComments: true,
      collapseWhitespace: false
    }
  }))
}

module.exports = {
  mode: 'development',
  devtool:'eval-source-map',
  entry: tools.getAllScript(jsDir),
  output: {
    filename: 'js/app/[name].js',
    path: path.join(__dirname , '/dist/')
  },
  devServer: {
    port: 8008,
    historyApiFallback: true, //不跳转
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'less-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024 * 8, // 8k以下的base64内联，不产生图片文件
            fallback: 'file-loader', // 8k以上，用file-loader抽离（非必须，默认就是file-loader）
            name: '[name].[ext]?[hash]', // 文件名规则，默认是[hash].[ext]
            outputPath: 'images/', // 输出路径
            publicPath: ''  // 可访问到图片的引用路径(相对/绝对)
          }
        }
      }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style/[name].css'
    }),
    new optimizeCss({}),
    new CleanWebpackPlugin(
      ['dist/**/**/',],　 //匹配删除的文件
      {
        root: __dirname,       　　　　　　　　　　//根目录
        verbose:  true,        　　　　　　　　　　//开启在控制台输出信息
        dry:      false        　　　　　　　　　　//启用删除文件
      }
    ),
    new webpack.DefinePlugin({
      'process.env' : {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ].concat(htmlFiles),
  optimization: {
    runtimeChunk: {
      name: '../common/manifest'
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        default: false,
        libs: {
          name: '../common/vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          enforce: true,
          chunks: "initial"
        },
        commons: {
          test: /[\\/]src[\\/]common[\\/]/,
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  }
};

