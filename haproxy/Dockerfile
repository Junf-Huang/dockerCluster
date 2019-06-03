FROM haproxy
RUN apt-get update && \
    apt-get install -y \
    vim \
    bash \
    ipvsadm \
    keepalived \
    iputils-ping \
    && mkdir /var/lib/haproxy/ \
    && /bin/bash
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
COPY keepalived.conf /etc/keepalived/keepalived.conf
