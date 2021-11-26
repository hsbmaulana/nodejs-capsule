FROM node:15.12.0-alpine as core

    ARG TIMEZONE
    ARG NAME
    ARG MODE
    ARG HOST
    ARG PORT

    ENV TZ=${TIMEZONE}
    ENV NAME=${NAME}
    ENV MODE=${MODE}
    ENV HOST=${HOST}
    ENV PORT=${PORT}

    WORKDIR /var/www/${NAME}/
    COPY . .

    RUN apk update && npm install --loglevel verbose;

    EXPOSE ${PORT}

    ENTRYPOINT []
    CMD npm run serve:${MODE}