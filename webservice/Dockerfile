FROM openjdk:8-jdk-alpine
VOLUME /data
COPY ./*.jar app.jar
RUN apk add --no-cache bash \
        && rm -rf /var/cache/apk/* \
        && /bin/bash
COPY ./wait-for-it.sh /
RUN ["chmod", "+x", "/wait-for-it.sh"]
CMD ["./wait-for-it.sh", "mgr1:3306"]
