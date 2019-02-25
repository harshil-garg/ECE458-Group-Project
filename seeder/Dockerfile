FROM node

# Node JS image from DockerHub
FROM node as server

# Define directory where app will reside
RUN mkdir -p /app
WORKDIR /app

# Install dependencies using npm
COPY package.json /app/package.json
RUN npm install

# Copy the source code directory to the Docker container
COPY . /app

CMD ["node", "app.js"]
