FROM node:20-alpine

WORKDIR /myapp
COPY ./microservice/package.json /myapp/package.json
RUN addgroup appgroup --gid 1234 && \
adduser -h /dev/null -D -u 1337 -G appgroup service_user && \
npm i --omit=dev && \
chown -R root:root /myapp && \
chmod -R 555 /myapp
COPY ./microservice /myapp


# need to change DB from localhost to host.docker.internal(only for windows, check docs for other host OS)
EXPOSE 3001
CMD ["npm", "run","prod"]
USER service_user