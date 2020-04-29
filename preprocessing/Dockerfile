FROM continuumio/miniconda3:4.8.2

WORKDIR /app

ENV DATABASE_URL=
ENV POSTER_SERVICE_URL=

ADD environment.yml .
RUN set -x && conda env update --name base --file environment.yml

ADD Preprocessing.py .

CMD ["python", "Preprocessing.py"]
