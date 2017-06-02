FROM node:7
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
CMD npm run start
