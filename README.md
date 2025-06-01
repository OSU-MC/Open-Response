# Open-Source Classroom Polling Software
## About
The Open-Source Classroom Polling Project seeks to simplify the interactive side of the educational experience, through the development of a free-to-use web-based polling system. Addressing the shortcomings of existing polling software, this project emphasizes affordability, responsiveness, and enhanced interactive capabilities suitable for today’s classrooms. The app aims to deliver a solution that fosters real-time engagement, collaborative learning, and seamless integration with educational platforms.

Read more about Open Response on the [Open Response website](https://osu-mc.github.io).

## Dependencies
- npm: 10.9.2
- node: 22.14.0
- docker: 28.1.1
- *mysql: 8.0.42
- *mysql-server: 8.0.42
- *k6: 1.0.0
* Indicates that this is a development dependency, and is not needed to run the software in a production environment. 

## Get Started

Follow these steps to run the Open Response application.

### Prerequisites

Install the following:
- [Node.js & npm via NVM](https://github.com/nvm-sh/nvm) — for managing Node versions (recommended)
- [Docker](https://docs.docker.com/get-docker/) — Docker Desktop recommended for Windows
- [MySQL Server](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/) – required for data storage
- [Grafana k6](https://k6.io/docs/getting-started/installation/) – for performance/load testing

### Setup & Run

```bash
# === Open Response First-Time Setup Script ===

# -----------------------------------------------
# Clone the repository and navigate into it
# -----------------------------------------------
git clone git@github.com:OSU-MC/Open-Response.git
cd Open-Response

# -----------------------------------------------
# Set up Node.js using NVM (Node Version Manager)
# This ensures the correct version of Node is used
# -----------------------------------------------
nvm install 22.14.0
nvm use 22.14.0

# -----------------------------------------------
# Install project dependencies from package.json
# This includes frontend, backend, and shared deps
# -----------------------------------------------
npm install

# -----------------------------------------------
# Initialize Docker Swarm and overlay network
# This sets up container orchestration
# -----------------------------------------------
npm run init

# -----------------------------------------------
# Generate and configure local .env files
# This will set up required environment variables
# -----------------------------------------------
npm run config
# This modifies:
# - /core/.env (Open Response Core)
# - /client/.env (Open Response Client)
# - /socket/.env (Open Response WebSocket)

# -----------------------------------------------
# === DATABASE SETUP (Development & Testing) ===
# -----------------------------------------------

# Connect to MySQL as root (you will be prompted for your MySQL root password)
# Inside the MySQL shell, run the following SQL commands to set up both databases:
mysql -u root -p -e "
  CREATE DATABASE openresponse_development;
  CREATE USER 'dev_admin'@'localhost' IDENTIFIED BY 'password';
  GRANT ALL PRIVILEGES ON openresponse_development.* TO 'dev_admin'@'localhost';

  CREATE DATABASE openresponse_test;
  CREATE USER 'test_admin'@'localhost' IDENTIFIED BY 'password';
  GRANT ALL PRIVILEGES ON openresponse_test.* TO 'test_admin'@'localhost';
"
exit

# -----------------------------------------------
# Run Sequelize commands to initialize schema
# -----------------------------------------------
cd ./core

# Install Sequelize CLI globally if not already installed
npm install -g sequelize-cli

# Migrate the development database
npx sequelize-cli db:migrate --env development
npx sequelize-cli db:seed:all --env development

# Migrate and seed the test database
npx sequelize-cli db:migrate --env test
npx sequelize-cli db:seed:all --env test

# -----------------------------------------------
# === STOPPING THE APPLICATION ===
# This will remove the Docker Swarm stack
# -----------------------------------------------
npm run stop
```

## Development Information
The Open Response project is divided into three main components: the client (frontend), the core (backend and database), and the websocket server. Each component has its own directory and can be developed independently.

### System Architecture
The system architecture consists of a client application that communicates with a backend server and a websocket server for real-time interactions. The backend handles data storage and business logic, while the websocket server manages real-time communication between clients.

Data is stored in a MySQL database, with caching served by Redis, and the application is containerized using Docker for easy deployment and scalability. The architecture supports a modular approach, allowing for independent development and deployment of each component.

![System Architecture](./docs/images/systemArchitectureDiagram.png)

### Directory Structure
```bash
Open-Response/
├── __tests__/               # Test files (not unit or integration tests)
├── .github/                 # GitHub-related files
├── client/                  # Frontend client code
├── core/                    # Backend core and database code
├── docker/                  # Docker-related files
├── docs/                    # Documentation files
├── socket/                  # Websocket server code
```

### Client
For more info about developing for the frontend client, visit [client/README.md](https://github.com/OSU-MC/Open-Response/tree/main/client).

For running the frontend development server that supports hot module replacement, allowing automatic refresh of the webpage whenever frontend code is edited, follow instructions at [client/README.md](https://github.com/OSU-MC/Open-Response/tree/main/client).

### Core
For more info about developing for the backend core and database, visit [core/README.md](https://github.com/OSU-MC/Open-Response/tree/main/core).

For instructions on how to run the backend server with automatic restart on changed files for development without using Docker for development ease of use, follow isntructions at [core/README.md](https://github.com/OSU-MC/Open-Response/tree/main/core).

### Websocket
For more info about developing for the websocket server, visit [socket/README.md](https://github.com/OSU-MC/Open-Response/tree/main/socket).

## Deployment
For deployment instructions, please refer to [docs/DEPLOYMENT.md](https://github.com/OSU-MC/Open-Response/tree/main/docs/DEPLOYMENT.md). This includes setup steps, environment configuration, and common troubleshooting tips.

## Maintenance Guidelines
- **Dependency Updates**: 
  - Regularly run `npm outdated` and `npm update` to keep Node.js packages current.
  - Check for security advisories using `npm audit` and address critical issues promptly.

- **Docker Image Rebuilds**:  
  - Rebuild Docker images after major changes to source code or dependencies:
    ```sh
    docker build -t openresponse_backend ./core
    docker build -t openresponse_frontend ./client
    docker build -t openresponse_socket ./socket
    ```

- **Configuration Changes**:
  - All environment variables should be documented in `.env.example`.
  - Update `docker-stack.yml` or `.env` files accordingly when modifying service-level settings.

- **Scaling & Performance**:
  - Monitor service metrics and scale services as needed using:
    ```sh
    docker service scale openresponse_backend=3
    ```
  - Use the auto-scaling script (`docker/docker_swarm_scaling.py`) to adjust based on load.

- **Backup & Restore**:
  - Ensure database and persistent volumes are backed up regularly if applicable.
  - Document the restore process separately if needed.

## Troubleshooting
- **Docker Build Fails**  
  Ensure Docker is running and you're in the project root. Try rebuilding with `--no-cache`.

- **Services Not Starting in Swarm**  
  Run `docker service ls` and `docker service logs <service-name>` to inspect startup issues.

- **Port Conflicts**  
  Make sure no other process is using ports defined in `docker-stack.yml` or the `.env` files at `/client/.env`, `/core/.env`, or `/socket.env`.

- **Website Not Connecting**  
  Confirm the server is running and accessible at the correct address and port. Check browser console for CORS or network errors.

- **Environment Variables Missing**  
  Verify that your `.env` file is correctly set up and matches `.env.example`, with modifications made as needed for your specific system.

## Licensing

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).  
You are free to use, modify, and distribute the software under the terms of this license.

See the [LICENSE](./LICENSE) file for full license text.
