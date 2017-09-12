#!/bin/bash
docker ps -aq | xargs docker stop
docker ps -aq | xargs docker rm
docker volume ls -q | xargs docker volume rm
docker rmi $(docker images -q)
