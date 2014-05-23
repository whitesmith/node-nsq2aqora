#
# nsq2aqora Dockerfile
# Runs an `nsq2aqora` instance.
#
# FIXME: Currently assuming `node_modules` are already available, since
# `npm install` is failing.
#

# Pull base image.
FROM dockerfile/nodejs
MAINTAINER José Ribeiro <root@jlbribeiro.com>

ADD . /nsq2aqora
WORKDIR /nsq2aqora

# Ideally, this would install dependencies during a deployment, but this command
# is failing.
#RUN npm install

EXPOSE 80

# Michael Crosby says `CMD` array syntax is preferable.
# http://crosbymichael.com/dockerfile-best-practices.html
#CMD /usr/bin/node /nsq2aqora/src/app.js

CMD ["/bin/sh", "-c", "/usr/bin/node /nsq2aqora/src/app.js"]
