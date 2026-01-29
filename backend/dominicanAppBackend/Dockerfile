# Building .jar file with gradle
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY src src

RUN chmod +x ./gradlew && ./gradlew build -x test

# Running the application
FROM eclipse-temurin:21-jre

ARG SPRING_PROFILES_ACTIVE=prod

COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar
COPY Capsuula.ttf Capsuula.ttf
COPY Baloo-Regular.ttf Baloo-Regular.ttf

ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}

CMD ["java", "-jar", "./app.jar"]