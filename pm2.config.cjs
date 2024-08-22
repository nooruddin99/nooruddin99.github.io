module.exports = {
  apps: [
    {
      name: `test-LV-frontend`,
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./dist",
        PM2_SERVE_PORT: 5500,
        PM2_SERVE_SPA: "true",
        NODE_ENV: "production",
      },
    },
  ],
};
