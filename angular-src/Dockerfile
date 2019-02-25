# Node JS image from DockerHub
FROM node as server

# Define directory where app will reside
RUN mkdir -p /app
WORKDIR /app

# Delete local node modules
RUN rm -rf node_modules/

# Install dependencies using npm
COPY package.json /app/package.json
RUN npm install -g @angular/cli
RUN npm install

# Copy the source code directory to the Docker container
COPY . /app

### DEVELOPMENT ENVIRONMENT (ng serve, hot reload) ###
# Start the app via npm
# Expose a few ports for communication
EXPOSE 4200 49153
CMD ["npm", "start"]

