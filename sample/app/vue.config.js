const path = require('path')

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@contracts': path.join(__dirname, '../contract/build/contracts')
      }
    },
    entry: {
      app: './frontend/main.ts'
    }
  },
  devServer: {
    proxy: 'http://localhost:4000'
  }
}
