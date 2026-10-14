// start-all.js - Starts both NestJS API and Next.js Web for single-project Render deployment
const { spawn } = require('child_process');
const path = require('path');

const externalPort = process.env.PORT || '10000';
const internalApiPort = process.env.INTERNAL_API_PORT || '3001';

console.log(`[Snapbook Runner] Starting monolithic deploy...`);
console.log(`[Snapbook Runner] External Web Port: ${externalPort}`);
console.log(`[Snapbook Runner] Internal API Port: ${internalApiPort}`);

const apiDist = path.join(__dirname, 'api', 'dist', 'main.js');

let nextBin;
try {
  nextBin = require.resolve('next/dist/bin/next', { paths: [path.join(__dirname, 'web')] });
} catch (e) {
  nextBin = path.join(__dirname, 'web', 'node_modules', 'next', 'dist', 'bin', 'next');
}

// 1. Launch NestJS API on internal port (3001)
const apiProcess = spawn('node', [apiDist], {
  cwd: path.join(__dirname, 'api'),
  env: {
    ...process.env,
    PORT: internalApiPort,
  },
  stdio: 'inherit',
  shell: true,
});

// 2. Launch Next.js Web on external port (Render $PORT)
const webProcess = spawn(
  'node',
  [nextBin, 'start', '-p', externalPort, '-H', '0.0.0.0'],
  {
    cwd: path.join(__dirname, 'web'),
    env: {
      ...process.env,
      PORT: externalPort,
      INTERNAL_API_URL: `http://127.0.0.1:${internalApiPort}`,
    },
    stdio: 'inherit',
    shell: true,
  }
);

const shutdown = (signal) => {
  console.log(`[Snapbook Runner] Received ${signal}, terminating child processes...`);
  try {
    apiProcess.kill();
  } catch (e) {}
  try {
    webProcess.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[Snapbook Runner] API process exited with code ${code}`);
    process.exit(code || 1);
  }
});

webProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[Snapbook Runner] Web process exited with code ${code}`);
    process.exit(code || 1);
  }
});
