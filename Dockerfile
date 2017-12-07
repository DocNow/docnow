FROM node:8.4.0
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
CMD npm run start:dev
