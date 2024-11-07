module.exports = {
  apps: [
    {
      name: 'quaise-api',
      script: './dist/main.js',
      exec_mode: 'cluster',
      instances: 4,
      autorestart: true,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      kill_timeout: 5000,
      stop_exit_codes: [0],
      out_file: '/dev/null',
      error_file: '/dev/null',
      watch: false,
    },
  ],
};
