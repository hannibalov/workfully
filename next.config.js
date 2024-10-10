const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  async rewrites() {
    console.log('Rewrites to', process.env.BACKEND_PORT);
    const rewritesConfig = [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:${process.env.BACKEND_PORT}/api/:path*`,
      },
    ];
    return rewritesConfig;
  },
};
