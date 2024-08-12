FROM node:14

# Install netcat and default MySQL client
RUN apt-get update && apt-get install -y netcat default-mysql-client

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Copy the wait-for-mysql.sh script
COPY wait-for-mysql.sh .
RUN chmod +x wait-for-mysql.sh

EXPOSE 5000

CMD ["./wait-for-mysql.sh", "mysql-db", "node server.js"]
