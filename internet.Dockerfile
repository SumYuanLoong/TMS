FROM node:bookworm-slim

WORKDIR myapp
 

COPY ./microservice /myapp
RUN npm i --omit=dev
RUN ls -a 
# need to change DB from localhost to host.docker.internal(only for windows, check docs for other host OS)
EXPOSE 3001
CMD ["npm", "run","prod"]