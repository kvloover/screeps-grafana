FROM node:lts

WORKDIR /app
COPY /docker /app
RUN npm install
# ENV SCREEPS_HOST=https://screeps.com

ENTRYPOINT [ "npm", "start" ]
