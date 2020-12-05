# WhoAmI
A modified version of the 20Questions game

# Use Docker
You can also run this app as a Docker container:

Step 1: Clone the repo

`git clone https://github.com/Monkmitrad/WhoAmI.git`

Step 2: Build the Docker image

`docker build -t whoami .`

Step 3: Run the Docker container locally:

`docker run -p 8080:8080 -d whoami`