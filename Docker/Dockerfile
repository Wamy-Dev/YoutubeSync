FROM node:19-alpine3.15

WORKDIR /srv/app

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN pip3 install pytube

COPY ./package*.json .

RUN npm install

COPY . .

VOLUME /mnt/share
EXPOSE 8080

CMD ["node", "server.js"]