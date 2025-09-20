FROM node:20-alpine

# ENV MONGO_URI=mongodb://localhost:27017/key-hub
# RUN env
WORKDIR /app

# Copy package.json and package-lock.json to cache dependencies
ADD package*.json ./
RUN npm install

# Add source code of our app
ADD . .
EXPOSE 3000
CMD ["npm", "start"]