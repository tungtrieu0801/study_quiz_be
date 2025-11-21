#Base image node
FROM node:20-alpine

#Create working directory
WORKDIR /app

#Copy package.json & package-lock.json
COPY package*.json ./

#Install dependence
RUN npm install --production

#Copy source cod
COPY . .

#Export port backend
EXPOSE 5678

#Command run app
CMD ["node", "server.js"]