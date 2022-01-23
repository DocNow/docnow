#!/bin/bash

if [ $NODE_ENV = "development" ]; then
  npm run migrate
  npm run start:dev
elif [ $NODE_ENV = "test" ]; then
  if [ -f .env.test ]; then
      set -o allexport
      source .env.test
  fi
  rm test.log
  npm run migrate
  npm run test:cmd
else
  npm run start
fi
