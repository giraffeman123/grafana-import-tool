FROM node:12.18.1

ENV NODE_ENV=production

WORKDIR /app
COPY . .
RUN npm install --production
#RUN apt-get update && apt-get install -y netcat

EXPOSE 80

CMD ["node", "index.js"]
