## Development

To get a development environment you will need to install [Git] and install
[Docker]. Then follow these instructions:

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
