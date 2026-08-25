const app = require('./app');
const { connectDb } = require('./config/db');
const env = require('./config/env');

async function startServer() {
  try {
    await connectDb();

    app.listen(env.port, () => {
      console.log(`API listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error(`Unable to start API: ${error.message}`);
    process.exit(1);
  }
}

startServer();
