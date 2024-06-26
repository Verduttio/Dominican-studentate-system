## App info

Dominican internal management system is a full stack app written in Spring boot and React Typescript. 

It is a comprehensive resource management system easily adaptable to the needs of other organizations. The app provides a user-friendly interface and a robust set of features that allow you to efficiently monitor resources, ensuring optimal utilization and productivity.

## Prerequisites to run on your own machine
  * docker
  * docker-compose
  * SSL certificate

## Usage

Initially, you have to create .env file. You can just use .env.template file. Run this in the root directory of the project:
```
cp .env.template .env
```
also set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` int the .env file. It it needed to enable Google Authentication.

Then, provide SSL certificate's files to `/nginx` directory. You can generate certificate on your own via Let's encrypt organization.

Next, add your custom initial data into database migration by creating file `V2__Initial_data.sql` in `/backend/.../db/migration` or if you do not want initial data just rename `V3` migration to `V2`. 

After that in the root of the project run:
```
docker compose build
docker compose up -d
```
The application should 
run now.

## Screenshots

![Screen_1](https://github.com/Verduttio/Dominican-internal-management-system/assets/72033031/efd49c91-e22f-44b8-a6db-b7137069b9f2)
![Screen_2](https://github.com/Verduttio/Dominican-internal-management-system/assets/72033031/017429c7-4933-4767-bdba-4eaf26da9d74)
