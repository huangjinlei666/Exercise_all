FROM nginx:1.19.8-alpine

ARG build_version

# 版本号
ENV BUILD_VERSION ${build_version}

ENV FREGATA_WEB_HOME=/home/fregata/fregata-web
ENV PATH=${FREGATA_WEB_HOME}/bin:${PATH}

COPY dist/fregata ${FREGATA_WEB_HOME}/html
COPY bin  ${FREGATA_WEB_HOME}/bin
COPY conf ${FREGATA_WEB_HOME}/conf

RUN rm -f /etc/nginx/conf.d/* && \
  ln -s ${FREGATA_WEB_HOME}/conf/fregata-web.conf /etc/nginx/conf.d/default.conf && \
  sed -i -e '/^user /s/^.*$/daemon off;/' -e '/worker_processes /s/1/auto/' /etc/nginx/nginx.conf

EXPOSE 8080/tcp

WORKDIR ${FREGATA_WEB_HOME}

RUN chmod +x  ${FREGATA_WEB_HOME}/bin/fregata-web

ENTRYPOINT ["fregata-web"]
