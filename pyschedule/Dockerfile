FROM python:2

# Define directory where app will reside
RUN mkdir -p /app
WORKDIR /app

ENV PYTHONUNBUFFERED=0

RUN pip install Flask
RUN pip install pyschedule
RUN pip install matplotlib
EXPOSE 5000
COPY . .
CMD [ "python", "-u", "./app.py" ]