const { spawn } = require('child_process');

const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

backend.on('error', err => console.error('Backend error:', err));
backend.on('exit', code => console.log('Backend exited with code:', code));

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  backend.kill('SIGTERM');
  process.exit(0);
});
