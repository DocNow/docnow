FROM node:12.11.1-alpine
RUN apk add --no-cache bash
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
CMD npm run start:dev
