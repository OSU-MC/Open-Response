#!/bin/sh
# This script checks if the container is started for the first time.

CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"
if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
    touch /$CONTAINER_FIRST_STARTUP
	echo "Container first start intializing database..."
    # place your script that you only want to run on first startup.
    npx sequelize-cli db:migrate --env test &&
	npx sequelize-cli db:migrate --env development &&
	npx sequelize-cli db:seed:all --env test &&
	npx sequelize-cli db:seed:all --env development
	echo "Completed migrating and seeding databases."
	npm run start:dev
else
    echo "Not running first start up script."
	npm run start:dev
fi