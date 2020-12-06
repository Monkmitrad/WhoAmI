# WhoAmI
A modified version of the 20Questions game

![ci](https://github.com/Monkmitrad/WhoAmI/workflows/ci/badge.svg)

# Use Docker
You can also run this app as a Docker container:

## Use Docker Hub

On every push to the main branch, a new version of the image will be pushed to Docker Hub.

You can pull the image with `docker pull monkmitrad/whoami`

## Build the image yourself

Step 1: Clone the repo

`git clone https://github.com/Monkmitrad/WhoAmI.git`

Step 2: Build the Docker image

`docker build -t whoami .`

Step 3: Run the Docker container locally:

`docker run -p 8080:8080 -d whoami`