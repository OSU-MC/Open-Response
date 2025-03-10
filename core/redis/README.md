# Setting Up Redis on WSL

This guide will walk you through the process of setting up Redis on Windows Subsystem for Linux (WSL).

## Prerequisites
- WSL installed and configured.

## Steps to Set Up Redis on WSL

### Step 1: Open a WSL Console
Open a WSL console.

### Step 2: Install Redis
Run the following command to install Redis:

```
sudo apt-get install redis
```

### Step 3: Start the Redis Cache Server
Once Redis is installed, start the Redis server on port 6380 using the following command:

```
redis-server --port 6380
```

The Redis server should now be running.

### Step 4: Test Redis Server
To verify the Redis server setup, open another WSL console and navigate to your project directory:

```
cd Open-Response/core
```

Install all redis dependencies:

```
npm install
```

Run the following command to test Redis functionality:

```
npm run redis:basics
```

The results should be as follows:

```
Redis connection successful
OK
Student
1
1
```