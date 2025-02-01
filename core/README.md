# MyClassroom Core
Welcome to the MyClassroom node.js Backend Core! This README.md is dedicated to development guidance and information reguarding the core side of the application. For more information about contributing, or general user guides, please visit the [MyClassroom Wiki](https://github.com/OSU-MC/MyClassroom/wiki).

## Setup Application for Core Development
This guide is specifically for local development of the MyClassroom Core. You may prefer to use the main [README.md](../README.md) install/setup instructions for other deployments.

There are two development methods for the MyClassroom Core application.

1. [Docker](#docker): Install Docker locally and automatically deploy the databases for a simple development environment.
2. [MySQL](#mysql): Install MySQL locally and manually intilize databases for detailed application control.

### Docker
The core NodeJS app and MySQL database can also be deployed in containers using Docker (As used in the primary installation method). The Dockerfile will build the core NodeJS app as a standalone whilst the compose.yml file will build and run the core and MySQL containers. If you plan to re-initialize the database from scratch remember to delete the docker volume for it as well.

Install and configure the Application according to the steps in the main [README.md](../README.md) but do not start the application. Then run the following from the root directory.

#### Build MyClassroom Core and MySQL Docker Containers
Build Docker containers:
```
docker compose build
```

Start Docker containers:
```
docker compose up -d
```

When finished, shutdown Docker containers:
```
docker compose down
```

(Optional) Inspect detached containers:
```
docker compose logs
```

(Optional) The MySQL database can be started/stopped individually after the first build using:
```
docker container start myclasroom_db
```

### MySQL
If you are working on the MyClassroom Core application without Docker, you will need to install MySQL.

- Refer to the [MySQL Getting Started Guide](https://dev.mysql.com/doc/mysql-getting-started/en/) for installing and troubleshooting MySQL.

#### Navigate to Core and Install Dependencies

Navigate to the Core Directory
```
cd MyClassroom/core
```

Install the Application Dependencies
```
npm install
```

#### Build MyClassroom Core
Build MyClassroom Core (without DB):
```
docker build -t myclassroom_core .
```

Run MyClassroom Core (without DB):
```
docker run -p 3001:3001: myclassroom_core
```

#### Setup Development Database
Connect to the MySQL Database using the Root User
```
mysql -u root -p
```

Create the Application Database
```
CREATE DATABASE myclassroom_development;
```

Create the Administrative Database User
```
CREATE USER 'dev_admin'@'localhost' IDENTIFIED BY 'password';
```

Grant the Administrative User Access to the Application Database
```
GRANT ALL PRIVILEGES ON myclassroom.* TO 'dev_admin'@'localhost';
```

Disconnect from the MySQL Database
```
exit
```

Migrate the Database using Sequelize
```
npx sequelize-cli db:migrate --env development
```

#### Setup Testing Database
Connect to the MySQL Database using the Root User
```
mysql -u root -p
```

Create the Test Application Database
```
CREATE DATABASE myclassroom_test;
```

Create the Testing Administrative Database User
```
CREATE USER 'test_admin'@'localhost' IDENTIFIED BY 'password';
```

Grant the Testing Administrative User Access to the Test Application Database
```
GRANT ALL PRIVILEGES ON myclassroom_test.* TO 'test_admin'@'localhost';
```

Disconnect from the MySQL Database
```
exit
```

Migrate the Test Database using Sequelize
```
npx sequelize-cli db:migrate --env test
```

Seed the Test Database using Sequelize
```
npx sequelize-cli db:seed:all --env test
```

#### Start Core
Start the MyClassroom Core
```
npm run start
```

#### (Optional) Test the Application
Testing the application is easy. The Jest testing framework is used to write tests for the system. A script has been added to the package.json file to run tests locally:
```
npm run test
```

If you run into issues, ensure you have done the following:

1. Created a local test database
2. Properly instantiated all env variables for the test environment

#### (Optional) Resetting/Rolling Back Databases
(Append `npx` commands with `--env test` to run on the test database)

Undo Database Migrations
```
npx sequelize-cli db:migrate:undo:all
```

Undo Test Database Seeding
```
npx sequelize-cli db:seed:undo:all
```

Reset Local Database
```
mysql -u root -p
```

```
DROP DATABASE myclassroom_development;
```

or

```
DROP DATABASE myclassroom_test;
```

## Update Core Configuration
Modify `/core/.env` to update the MyClassroom Core configuration. The `DEV_DB_...` and `TEST_DB_...` environment variables should match those in the database/user creation commands listed in the [MySQL](#mysql) setup steps below. Additionally, `CLIENT_URL` should be set to the MyClassroom Client application URL. For basic testing, the default values can be used.

## Application Authentication & Session
The application uses cookie-based authentication once a user session has been created (i.e. a user has logged in). A user's session will have a specific XSRF token value associated with it to protect against XSRF attacks. As such, the value of that token will be sent back as a cookie, and the application expects to recieve with each authenticated request a custom X-XSRF-TOKEN header with that value, along with the traditional authentication cookie \_myclassroom_session which the application generated as part of initial session creation.

A user's session is valid for a minimum of 4 hours, and as long as the user is active within 4 hours of last activity, the session can be valid for as long as 24 hours. In other words, users will be asked to login again after 4 hours of inactivity or 24 hours since they last provided their credentials.

## Configuring Services
### Emailer
The application is configured to use Courier notification infastructure to message users. In order to use the application's mailer, create an account at https://www.courier.com/. Follow Courier's setup instructions and prompts.

The process should yield a bearer token in the HTTPS request Courier generates. Copy this token, and paste it in the application environment as `COURIER_AUTH_TOKEN`. Also set `EABLE_EMAIL='true'`. That's it! You should be able to interact with the configured emailer through Courier.

It's worth noting that the application is only configured for email use through Courier, but Courier supports a variety of modern notification methods.

## Database Schema
![Schema](https://github.com/user-attachments/assets/cc642b55-d099-46cd-a5c4-95efee36c15e)
