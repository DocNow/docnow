## On macOS

If you intend to run Docnow on macOS (tested on Monterey)

Start by opening the Terminal application on your Mac in `Applications/Utilities` 
This can be also found by typing `terminal`' in Spotlight.

### Prerequisites

* At least 8GB memory
* Install [Homebrew](https://brew.sh)
  * ``` /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" ``` This step will prompt you for the `macOSusername` password. Please remember to hit `Enter` after each entry. 
  * Then copy the following into your Terminal if this is your first time installing Homebrew:

```git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow```
* Git
* Install [Docker](https://docs.docker.com/install/linux/docker-ce/centos/) and [Docker compose](https://docs.docker.com/compose/install/)
* (optional) reverse proxy web server ideally with TLS. Your reverse proxy server will listen on port 3000 for the docnow application


### Installing Docnow


```bash
brew install git
```

To install Docnow from the repository, clone the repository locally:

```bash
git clone https://github.com/docnow/docnow.git
cd docnow
docker-compose up -d
```

Launch your preferred browser and open up: [http://localhost:3000](http://localhost:3000)