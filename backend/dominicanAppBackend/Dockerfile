FROM openjdk:21-jdk

ARG SPRING_PROFILES_ACTIVE=prod

COPY build/libs/*SNAPSHOT.jar app.jar
COPY Capsuula.ttf Capsuula.ttf
COPY .env .env

ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}

CMD ["java", "-jar", "/app.jar"]