module.exports = {
  apps: [
    {
      name: 'verniy-bot',
      namespace: 'bot',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
