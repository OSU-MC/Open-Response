#!/bin/sh

echo "Checking if MySQL is ready before proceeding..."

# Function to check MySQL readiness
check_mysql() {
  echo "Trying to connect to MySQL at $DEV_DB_HOST:$DEV_DB_PORT..."
  while ! nc -z "$DEV_DB_HOST" "$DEV_DB_PORT"; do
    echo "Waiting for MySQL ($DEV_DB_HOST:$DEV_DB_PORT) to be ready..."
    sleep 5
  done
}

# Run the MySQL readiness check
check_mysql

echo "MySQL is ready. Proceeding with startup..."

# First-time setup
CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"

if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
    touch /$CONTAINER_FIRST_STARTUP
    echo "Container first start initializing database..."
    
    # Run database migrations and seeders only on the first startup
    npx sequelize-cli db:migrate --env test &&
    npx sequelize-cli db:migrate --env development &&
    npx sequelize-cli db:seed:all --env test &&
    npx sequelize-cli db:seed:all --env development
    
    echo "Completed migrating and seeding databases."
    npm run start:dev
else
    echo "Not running first startup script."
    npm run start:dev
fi
