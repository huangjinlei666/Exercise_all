const chalk = require('chalk');
const cookieParser = require('cookie-parser');

const path = require('path');
const fs = require('fs');

function sendJson(req, res, next, file, root) {
  res.sendFile(
    file,
    {
      root,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    (err) => {
      if (err) {
        console.error(chalk.red(err.message), file);
        next(err);
      }
    }
  );
}

module.exports = {
  proxy: {
    '/fregataDev': {
      target: 'http://172.28.2.206:8088/',
      ws: true,
      changeOrigin: true,
      pathRewrite: {
        '^/fregataDev': '',
      },
    },
  },
  historyApiFallback: true,
  progress: true,
  host: '0.0.0.0',
  port: 3003,
  hot: true,
  disableHostCheck: true,
  inline: true,
  compress: true,
  contentBase: ['./dist'], // 本地服务器加载的资源页面所在的目录
  publicPath: '/',
  stats: 'errors-only',
  staticOptions: {
    maxAge: 365 * 24 * 3600 * 1000,
  },
  before(app) {
    [['/rest/api', './mock/rest/api']].forEach(([url, targetPath]) => {
      app.use(url, cookieParser(), function rest(req, res, next) {
        const filePath = path.join(process.cwd(), targetPath, req.path);
        const file = req.path;
        const checkFiles = ['.json', '']
          .map((ext) => filePath + ext)
          .map((p) => {
            return new Promise((resolve) => {
              fs.exists(p, (exists) => {
                resolve(exists);
              });
            });
          });
        Promise.all(checkFiles).then(([json, normal]) => {
          if (json) {
            sendJson(req, res, next, `${file}.json`, targetPath);
          } else if (normal) {
            sendJson(req, res, next, file, targetPath);
          } else {
            next();
          }
        });
      });
    });
  },
};
