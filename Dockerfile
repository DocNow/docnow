FROM node:12.16.3
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
CMD ./entrypoint.sh
