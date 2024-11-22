#!/bin/bash

# Create the nginx-proxy network
docker network create nginx-proxy

# Start the nginx-proxy container
docker run -d -p 80:80 -p 443:443 \
    --name nginx-proxy \
    --network nginx-proxy \
    -v /var/run/docker.sock:/tmp/docker.sock:ro \
    -v certs:/etc/nginx/certs \
    -v vhost:/etc/nginx/vhost.d \
    -v html:/usr/share/nginx/html \
    --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy \
    jwilder/nginx-proxy

# Start the SSL companion container
docker run -d \
    --name nginx-proxy-letsencrypt \
    --network nginx-proxy \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -v certs:/etc/nginx/certs:rw \
    -v vhost:/etc/nginx/vhost.d \
    -v html:/usr/share/nginx/html \
    --volumes-from nginx-proxy \
    jrcs/letsencrypt-nginx-proxy-companion
