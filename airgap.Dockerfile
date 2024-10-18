FROM node:20-alpine
WORKDIR /myapp
#copy nodemodules
COPY ./internet/microservice-0.0.0.tgz /myapp
#npm install 
RUN npm i microservice-0.0.0.tgz
#copy the truth package.json - must happen after install
COPY ./microservice /myapp
# save size by not spliting cmds since 1 more docker cmd is 1 more layer
#compare will auto fail if cmp finds differences
RUN cmp ./node_modules/microservice/package.json /myapp/package.json && \
#cause mv also acts as a rename function
mv ./node_modules ./node_modules_temp && \
# bring the folder out to pwd
mv ./node_modules_temp/microservice/node_modules . && \
# delete the temp folder and the tgz file
rm node_modules_temp -r && \
rm /myapp/microservice-0.0.0.tgz && \
# adding the runtime user
adduser -H -D -u 1337 service_user
USER service_user
CMD ["node","./bin/www"]
