## Development

To set up a development environment you will need to install [Git] and [Docker].
Once you've got them installed open a terminal window and follow these
instructions:

1. git clone https://github.com/docnow/docnow
1. cp docnow/settings.py.template docnow/settings.py
1. add the keys for your [Twitter App] to the bottom of docnow/settings.py
1. docker-compose up
1. open http://localhost:8000

Things should be setup so that modifications to the Django application source
code in `docnow` and the JavaScript/CSS in `assets` will be automatically
reflected in the running application.

[Git]: https://git-scm.com/
[Docker]: https://www.docker.com/
[Twitter App]: https://apps.twitter.com
