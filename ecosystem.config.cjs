module.exports = {
  apps: [
    {
      name: 'safe8-assessment',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=safe8-assessment-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Disable PM2 file monitoring (wrangler has its own)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork'
    }
  ]
}