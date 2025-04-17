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

DB_USER="dev_admin"
DB_NAME="openresponse_development"
TABLE_TO_CHECK="Users"

# Function to check if database is initialized
is_database_initialized() {
    TABLE_COUNT=$(mysql -u$DB_USER -p$DEV_DB_PASSWORD -h $DEV_DB_HOST -P $DEV_DB_PORT -D $DB_NAME -se \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$TABLE_TO_CHECK';")

    if [ "$TABLE_COUNT" -gt 0 ]; then
        return 0  # Database is uninitialized
    else
        return 1  # Database is initialized
    fi
}

# Check if database is already initialized
if is_database_initialized; then
    echo "Database is already initialized. Skipping migrations and seeders."
else
    echo "Database not initialized. Running migrations and seeders..."
    
    # Run migrations and seeders
    npx sequelize-cli db:migrate --env test &&
    npx sequelize-cli db:migrate --env development &&
    npx sequelize-cli db:seed:all --env test &&
    npx sequelize-cli db:seed:all --env development
    
    echo "Database migrations and seeding completed."
fi

# Start the application
npm run start:dev