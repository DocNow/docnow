#!/bin/bash

if [ $NODE_ENV = "development" ]
then
  npm run migrate
  npm run start:dev
else
  npm run start
fi
