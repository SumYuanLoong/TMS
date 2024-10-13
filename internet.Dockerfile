FROM node:20-alpine

WORKDIR /myapp
COPY ./microservice/package.json /myapp/package.json
RUN addgroup appgroup --gid 1234 && \
adduser -H -s /sbin/nologin -D -u 1337 -G appgroup service_user && \
npm i --omit=dev
COPY ./microservice /myapp

USER service_user
# need to change DB from localhost to host.docker.internal(only for windows, check docs for other host OS)
EXPOSE 3001
CMD ["npm", "run","prod"]
