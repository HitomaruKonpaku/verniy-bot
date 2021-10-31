module.exports = {
  apps: [
    {
      name: 'verniy-bot',
      namespace: 'bot',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
