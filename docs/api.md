# API

The following REST API calls are returned by the DocNow server application.
Use the endpoint `/api/v1/`

### /setup *(GET)*

Returns true/false depending on whether the app has been setup yet.

### /settings *(GET, PUT)*

Get or set application wide settings.

### /user *(GET)*

Returns the user information for the user who is logged in (GET)

### /user/{user-id} *(PUT)*

Set user information, admin only.

### /world *(GET)*

Returns a dictionary of locations that can be monitored for trends.

### /trends *(GET, PUT)*

Returns the users trending locations, or the application wide trends when
a user is not logged in. If a list of place identifiers is PUT then
the trending locations are updated to use those places.

### /searches *(GET, POST)*

Post a query as JSON and get a redirect to a URL for the search result. If a Get is used the logged in users searches are returned. If the user is not logged in only information about public searches will be returned. If the user is logged in and wants to get a list of public searches the `public=true` query parameter can be used.

### /search/{search-id} *(GET, PUT)*

Get or updated the current results of a search.

### /search/{search-id}/tweets *(GET, PUT)*

Get the recent tweets in a given search. By default all Parameters include:

* **url**: return tweets that reference a URL
* **mine**: return user's tweets in a search
* **image**: return tweets that reference a particular image URL
* **video**: return tweets that reference a particular video URL
* **ids**: a comma separated list of ids in the search to return
* **includeRetweets**: if set include retweets in addition to tweets
* **limit**: the number of tweets to return (default is 100)
* **offset**: indicate how many results to skip, useful when paging

When issuing a PUT more tweets matching the query will be fetched.

### /search/{search-id}/users *(GET)*

Top users in a given search.

### /search/{search-id}/hashtags *(GET)*

Top hashtags in a given search.

### /search/{search-id}/images *(GET)*

Top images in a given search.

### /search/{search-id}/videos *(GET)*

Top videos in a given search.

### /search/{search-id}/webpages *(GET)*

Metadata for webpages referenced in a given search.

### /search/{search-id}/queue *(GET)*

Statistics for the url fetching queue for a search.

### /search/{search-id}/actions (GET, PUT)

Get or update the actions associated with a search.

### /actions *(GET)*

Get the consent actions for the authenticated user.

### /findme (GET)

Returns collections that a given user's tweets are a part of.
