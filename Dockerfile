# Use the official Node.js 18 image as the base image
FROM node:18-alpine AS builder


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json .

# Install dependencies
RUN npm install

# Install for image optimization and pg library
RUN npm install sharp

# Copy the rest of the project files
COPY . .

# Build the Next.js project
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]

