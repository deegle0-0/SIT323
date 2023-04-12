FROM node:16

# app directory
WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install

COPY server.js .

#port number
EXPOSE 3000 
# server.js from present directory to run 
CMD ["node","server.js"]
