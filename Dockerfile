FROM node:8
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
CMD npm run start
