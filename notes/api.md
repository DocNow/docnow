# API

The following REST API calls are returned by the DocNow server application.
Use the endpoint `/api/v1/`

### /setup *(GET)*

Returns true/false depending on whether the app has been setup yet.

### /settings *(GET, PUT)*

Get or set application wide settings.

### /user *(GET)*

Returns the user information for the user who is logged in (GET)

### /world *(GET)*

Returns a dictionary of locations that can be monitored for trends.

### /trends *(GET, PUT)*

Returns the users trending locations, or the application wide trends when
a user is not logged in. If a list of place identifiers is PUT then
the trending locations are updated to use those places.

### /searches *(POST)*

Post a query as JSON and get a redirect to a URL for the search result.

### /search/{search-id} *(GET)*

Get the current results of a search.

### /search/{search-id}/tweets *(GET)*

Recent tweets in a given search.

### /search/{search-id}/users *(GET)*

Top users in a given search.

### /search/{search-id}/hashtags *(GET)*

Top hashtags in a given search.
