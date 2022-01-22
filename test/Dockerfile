FROM node:12-alpine

RUN apk add curl
RUN npm install -g newman

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait

CMD chmod +x /wait && sh -c /wait && \
    for collection in /collections/*; \
        do newman run "$collection" -e /env/postman_environment.json --verbose; \
    done