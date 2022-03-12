# Configure your Docnow Application

⚠️Note: For this to work reliably we are recommend using the same web browser (in another tab ideally) with a logged in connection to the Twitter account you want associated with your app. You will also need the IP address of your Virtual Private server. 

If this is a local (non-cloud setup) install of Docnow you will use http://localhost in Step 3. 

## 1. Set up your Developer Account

* Twitter provides information on how to set up your [Developer Account](https://developer.twitter.com/en/apply-for-access)

## 2. Set up your Docnow App on Twitter

* With your account setup visit the [Developers Portal](https://developer.twitter.com/en/portal/projects-and-apps)
  * Create and name new Project
  * Select your usecase from the drop down
  * Provide a description of your project
  * Select your app environment
  * Provide a name for your app

## 3. Set up Authentication of Docnow App on Twitter

* With your Project and App setup visit the [Developers Portal](https://developer.twitter.com/en/portal/projects-and-apps)
  * Select User authentication settings and click Setup
  * Toggle the OAuth 1.0a button (leave the default settings)
  * In the callback URI enter http://[yourIPaddresshere]/auth/twitter/callback
  * In the Website URI enter https://[yourIPaddresshere]

