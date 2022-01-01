# docnow

The web is a big and rapidly changing place, so it can be challenging to
discover what resources related to a particular event or topic are in need of
archiving. [Appraisal] is an umbrella term for the many processes by which
archivists identify records of enduring value for preservation in an archive.
DocNow is an appraisal tool for the social web that uses Twitter.

DocNow allows archivists to tap into conversations in Twitter to help them
discover what web resources for collection and preservation. It also connects
archivists with content creators in order to make the process of archving web
content more collaborative and consentful. The purpose of DocNow is to help
ensure ethical practices in web archiving by building conversations between
archivists and the communities they are documenting.

## Architecture

This repository houses the complete DocNow application which is comprised of a
few components:

* a client side application (React)
* a server side REST API (Node)
* a database (PostgreSQL)
* a messaging queue database (Redis)

## Production

If you are running DocNow in production you will want to check out
[docnow-ansible](https://github.com/DocNow/docnow-ansible) which allows you to
provision and configure DocNow in the cloud.

## Development

To set up DocNow locally on your workstation you will need to install [Git]
and [Docker]. Once you've got them installed open a terminal window and
follow these instructions:

1. git clone https://github.com/docnow/docnow
1. cd docnow
1. cp .env.docker .env
1. docker-compose build --no-cache
1. docker-compose up
1. make some ☕️
1. open http://localhost:3000

If you run into an error above

1. sh clean-up.sh

## Testing

The test suite runs automatically via a GitHub Action. If you want to run the tests yourself you will need to run the supplied `test.sh` script. The test suite needs to talk to the Twitter API so you will need to add your keys to the test.sh script. Please be careful not to commit them!

If you are developing with the docker-compose setup outlined in the previous section you will need to first create a new database that is distinct from your development database (so you don't delete data that you are experimenting with). To do this you need to identify the `postgres` container, connect to it, connect to postgres, and create the database. For example:

```
$ docker ps --format "{{.ID}} {{.Image}}"
f35af00270b4 docnow_webapp
51dbd96b6f58 docnow_stream-loader
6c02318d6225 docnow_url-fetcher
3cb269d64d96 ankane/pghero
27b17b92f77b postgres
d9b39c12c952 redis

$ docker exec -ti 27b17b92f77b bash
root@27b17b92f77b:/ psql --user docnow postgres
postgres=# create database docnow_test;
postgres=# quit
```

Then to run the tests you will need to connect to the `docnow_webapp` container
and run test.sh from inside the container. For example, using the listing of 
docker containers obtained above:

```bash
$ docker exec -ti f35af00270b4a bash

root@f35af00270b4:/code# ./test.sh
  archive
✓ should setup (4315ms)
✓ should create archive (190ms)
✓ should be flagged as archived
✓ should close things
...
```

[Git]: https://git-scm.com/
[Docker]: https://www.docker.com/
[Appraisal]: https://www2.archivists.org/glossary/terms/a/appraisal
