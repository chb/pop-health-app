FROM nginx:alpine

COPY ./build /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/env.js.tpl > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
