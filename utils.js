'use strict';

function readEnv(name, defaultValue) {
  const env = process.env[name];
  if (env) {
    return env;
  }
  if (defaultValue === undefined) {
    throw new Error(`Environment variable "${name}" must be set`);
  }
  return defaultValue;
}


module.exports = { readEnv };
