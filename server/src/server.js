const app = require('./app');
const env = require('./config/env');
const pool = require('./db/pool');
const migrate = require('./db/migrate');

async function start() {
  await migrate();

  const server = app.listen(env.port, () => {
    console.log(`CineZone API listening on http://localhost:${env.port}`);
  });

  function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch(async (err) => {
  console.error('Failed to start server');
  console.error(err);
  await pool.end();
  process.exit(1);
});
