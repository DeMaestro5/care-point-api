# Here we are getting our node as Base image
FROM node:20.10.0

# create user in the docker image
USER node

# Creating a new directory for app files and setting path in the container
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# setting working directory in the container
WORKDIR /home/node/app

# Configure npm to use a specific registry and add network settings
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 3 \
    && npm config set fetch-retry-mintimeout 5000 \
    && npm config set fetch-retry-maxtimeout 60000

# grant permission of node project directory to node user
COPY --chown=node:node . .

# installing the dependencies into the container with retry logic
RUN npm install --verbose || (sleep 5 && npm install --verbose) || (sleep 10 && npm install --verbose)

# container exposed network port number
EXPOSE 3000

# command to run within the container
CMD [ "npm", "start" ]