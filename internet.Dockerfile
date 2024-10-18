# set the base image
FROM node:20-alpine
# Create the folder myapp and set it as the working directory
WORKDIR /myapp
# Copy in the source codes 
COPY ./microservice /myapp
# addition of runtime user and installing node_modules
RUN adduser -H -D -u 1337 service_user && \
npm i --omit=dev 

USER service_user
CMD ["node","./bin/www"]
