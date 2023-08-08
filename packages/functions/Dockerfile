FROM public.ecr.aws/lambda/nodejs:18

COPY build/index.js ${LAMBDA_TASK_ROOT}/

RUN yum install -y tar gzip wget xz

RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar -xf ffmpeg-release-amd64-static.tar.xz && \
    rm ffmpeg-release-amd64-static.tar.xz && \
    mv ffmpeg-*-static/ffmpeg /usr/bin/ && \
    mv ffmpeg-*-static/ffprobe /usr/bin/ && \
    rm -rf ffmpeg-*-static

CMD [ "build/index.handler" ]