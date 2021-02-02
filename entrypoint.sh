#!/bin/bash

if [ $NODE_ENV = "development" ]; then
  npm run migrate
  npm run start:dev
elif [ $NODE_ENV = "test" ]; then
  npm run migrate
  npm run test
else
  npm run start
fi
