# Open-Source Classroom Polling Software
## About
The Open-Source Classroom Polling Project seeks to simplify the interactive side of the educational experience, through the development of a free-to-use web-based polling system. Addressing the shortcomings of existing polling software, this project emphasizes affordability, responsiveness, and enhanced interactive capabilities suitable for today’s classrooms. The app aims to deliver a solution that fosters real-time engagement, collaborative learning, and seamless integration with educational platforms.

Read more about MyClassroom on the [MyClassroom website](https://osu-mc.github.io).

## Dependencies
- npm: 10.7.0
- node: 22.2.0
- docker: 24.0.9

## Get Started!
### Download/Install
Install Docker
- Refer to the [Get Docker Guide](https://docs.docker.com/get-docker/) for installing and setting up Docker. Docker Desktop is recommended for simplifying local development.

Clone the GitHub repository:
```
git clone git@github.com:OSU-MC/MyClassroom.git
```

Navigate to the cloned repository:
```
cd MyClassroom
```

Install the application dependencies:
```
npm install
```

### Configure Environment
Configure the local environment:
```
npm run config
```

- Modify `/core/.env` to update the MyClassroom Core configuration.
- Modify `/client/.env` to update the MyClassroom Client configuration.

### Start MyClassroom Application
Start MyClassroom using the following command:
```
npm run start
```

### Stop MyClassroom Application
Press **Ctrl+C** to stop the server and shut down the Docker container.

## Development info
### Client
For more info about developing for the frontend client, visit [client/README.md](https://github.com/OSU-MC/MyClassroom/tree/main/client)

### Core
For more info about developing for the backend core and database, visit [core/README.md](https://github.com/OSU-MC/MyClassroom/tree/main/core)

## Licensing
GNU General Public License v3.0
