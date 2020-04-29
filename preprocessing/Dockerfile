FROM continuumio/miniconda3:4.8.2

ENV DATABASE_HOSTNAME=
ENV DATABASE_URL=
ENV POSTER_SERVICE_URL=

# install the netcat dependency for the wait script
RUN set -x && apt-get -y install netcat

# setup the conda environment
COPY environment.yml /app/environment.yml
WORKDIR /app
RUN set -x && conda env update --name base --file environment.yml

# inject start scripts
ADD https://raw.githubusercontent.com/eficode/wait-for/f71f8199a0dd95953752fb5d3f76f79ced16d47d/wait-for /wait-for.sh
COPY run.sh /run.sh
RUN set -x && chmod u+x /wait-for.sh /run.sh

# inject the preprocessing script
COPY Preprocessing.py .

CMD "/run.sh"
