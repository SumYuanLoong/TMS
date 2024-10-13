FROM node:20-alpine

WORKDIR /myapp

#copy nodemodules
COPY ../internet/microservice-0.0.0.tgz /myapp/modules.tgz

#npm install 
RUN npm i modules.tgz
#copy the truth package.json - must happen after install
COPY ./microservice/package.json /myapp/package.json
#compare will auto fail if cmp finds differences
RUN cmp ./node_modules/microservice/package.json /myapp/package.json && \
#cause mv also acts as a rename function
mv ./node_modules ./node_modules_temp && \
# bring the folder out
mv ./node_modules_temp/microservice/node_modules . && \
# delete the temp folder
rm node_modules_temp -r && \
# save 3 mb by not spliting cmds
addgroup appgroup --gid 1234 && \
adduser -H -s /sbin/nologin -D -u 1337 -G appgroup service_user && \
npm i --omit=dev
COPY ./microservice /myapp

USER service_user
# need to change DB from localhost to host.docker.internal(only for windows, check docs for other host OS)
EXPOSE 3001
CMD ["npm", "run","prod"]
