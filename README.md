# docnow

![Build Status](https://github.com/docnow/docnow/workflows/DocNow%20Test/badge.svg)

The web is a big and rapidly changing place, so it can be challenging to
discover what resources related to a particular event or topic are in need of
archiving. [Appraisal] is an umbrella term for the many processes by which
archivists identify records of enduring value for preservation in an archive.
DocNow is an appraisal tool for the social web that uses Twitter.

DocNow allows archivists to tap into conversations in Twitter to help them
discover what web resources are in need of archiving. It also connects
archivists with content creators in order to make the process of archving web
content more collaborative and consentful. The goal of DocNow is to help ensure
ethical practices in web archiving by building conversations between archivists
and the communities they are documenting.

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

To set up DocNow locally on your workstation you will need to install [Git] and
[Docker]. Once you've got them installed open a terminal window and follow
these instructions:

1. git clone https://github.com/docnow/docnow
1. cd docnow
1. cp .env.docker .env
1. docker-compose build --no-cache
1. docker-compose up
1. make some ☕️
1. open http://localhost:3000

If you run into an error above

1. sh clean-up.sh

If you notice that the `redis` container occasionally errors out run this in the
host operating system as root (not in the Redis container):

```bash
sysctl vm.overcommit_memory=1
```

[Git]: https://git-scm.com/
[Docker]: https://www.docker.com/
[Appraisal]: https://www2.archivists.org/glossary/terms/a/appraisal
