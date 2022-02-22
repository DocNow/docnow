## On Ubuntu

If you intend to run Docnow on Ubuntu (tested on Bionic)

### Prerequisites

* At least 8GB memory
* Git
* Install [Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/) and [Docker compose](https://docs.docker.com/compose/install/)
* (optional) reverse proxy web server ideally with TLS. Your reverse proxy server will listen on port 3000 for the docnow application


### Installing Docnow


```bash
sudo apt -y install git
```

To install Docnow from the repository, clone the repository locally:

```bash
git clone https://github.com/docnow/docnow.git
cd docnow
docker-compose up -d
```

Launch your preferred browser and open up: [http://localhost:3000](http://localhost:3000)
