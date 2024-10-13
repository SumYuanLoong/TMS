the 2 cmds are supposed to have the same result
docker image save <imagename> > <filename>.tar - does not work, speculate that this is due to piping in windows not working
docker save -o <filename>.tar <imagename> - will import when exported from windows

npm pack - results in a tgz file based on the app name and version defined in the package.json file
need to add bundleDependencies = trues

docker load
