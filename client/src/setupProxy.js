// const {apiURL}
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/api/*',
        createProxyMiddleware({
            target: 'https://csea-interview-exp-server.vercel.app',
            changeOrigin: true,
        })
    );
};
