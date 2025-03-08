# Use the official Node.js image as a base image
FROM node:21.7.3

# Install netcat and mysql-client for debugging
RUN apt-get update && apt-get install -y netcat-openbsd default-mysql-client

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory but ignore node_modules
COPY . .

# Make sure the entrypoint file is executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "start:dev"]
