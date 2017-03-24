This is a work in progress. When it becomes more fleshed out details about how
to run in production will be provided. Till then ....

## Development

To set up a development environment you will need to install [Git] and [Docker].
Once you've got them installed open a terminal window and follow these
instructions:

1. git clone https://github.com/docnow/docnow
1. cd docnow
1. cp docnow/settings.py.template docnow/settings.py
1. docker-compose up
1. make some ☕️
1. open http://localhost:8000

Things should be setup so that modifications to the Django application source
code in `docnow` and the JavaScript/CSS in `docnow/assets` will be automatically
reflected in the running application.

## Gotchas

### No Email

If you never receive the confirmation email when creating an account you may 
be on a network that doesn't route traffic on port 25 (SMTP) which is what the
Postfix Docker container tries to do. For example many ISPs like Verizon will
block port 25.

If you look in your `docnow/settings.py` file you should see a commented out
section that tells DocNow to use Google as an email server. Try adding your
Google username/password and registering again. 

[Git]: https://git-scm.com/
[Docker]: https://www.docker.com/
[Twitter App]: https://apps.twitter.com
