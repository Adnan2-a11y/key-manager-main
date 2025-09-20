# Steps to manage Docker Repository
## Login to Docker Hub
```
docker login
```

## Dockerfile তৈরি করুন

## Docker Image Build করুন
```
docker build -t myapp:latest .

docker build -t key-hub:3.1 .
docker build -t key-hub-front:3.0 .
```

## Docker Image ট্যাগ করুন
```
docker tag myapp:latest YOUR_DOCKER_HUB_USERNAME/myapp:latest

docker tag key-hub:3.1 autocircled/key-hub:3.1
docker tag key-hub-front:3.0 autocircled/key-hub-front:3.0
```

## Push Docker Repository
docker push autocircled/key-hub:version

docker push autocircled/key-hub:3.1
docker push autocircled/key-hub-front:3.0

## Docker Container রান করুন
```
docker run -d -p 5000:5000 YOUR_DOCKER_HUB_USERNAME/myapp:latest
```

## Docker Hub থেকে পুরনো ইমেজ ডিলিট করা (প্রয়োজনে)


## Stop Running Container
```
docker compose down
```

## Pull Docker Image using docker-compose.yaml
Update image version in docker-compose.yaml

## Start Stopped Container with detached mode
```
docker compose up -d
```



cloudflared.exe service install eyJhIjoiNWIxYmI0MzZiNzJjNTRmYTM2NWYxNTVlNzFkNmM4ZjciLCJ0IjoiOWFhZGUyNGYtNjZhZC00ZTNhLWFhZDEtODI2ZWU4Mzc1NjI0IiwicyI6IlptVmpNREUzWTJZdFpEUTROeTAwWTJaakxXRmtPREF0WVRWa1lUWmpNekJpTnpWbSJ9