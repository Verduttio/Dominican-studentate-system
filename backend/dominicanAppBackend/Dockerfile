# Building .jar file with gradle
FROM openjdk:21-jdk as build

RUN microdnf install findutils

WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle.kts .
COPY settings.gradle.kts .

COPY src src

RUN chmod +x ./gradlew && ./gradlew build -x test

# Running the application
FROM openjdk:21-jdk

ARG SPRING_PROFILES_ACTIVE=prod

COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar
COPY Capsuula.ttf Capsuula.ttf
COPY Baloo-Regular.ttf Baloo-Regular.ttf

ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}

CMD ["java", "-jar", "./app.jar"]