
# Deployment

The following is a walk-through of the steps to deploy Open Response for development purposes, and to maintain the deployment. Adjustments will likely have to be made for a full launch in order to ensure proper security.

## Create a LightSail Instance

Once AWS access has been granted, navigate through the AWS dashboard to the LightSail page. Click on "Create instance" and on the resulting page, select the following:  
* **Location:** Oregon, Zone A (us-west-2a)  
* **Platform:** Linux/Unix  
* **Blueprint:** Apps + OS &rarr; MEAN  
* **Launch script:** None
* **SSH key:** Create custom key  
* **Automatic snapshots:** Unchecked  
* **Network type:** Dual-stack  
* **Size:** Depends on your budget but >= 1 GB memory recommended  
* **Instance name:** Open-Response if project name is unchanged  

Now select "Create instance" at the bottom of this page.  

Once the instance has been started, click on the shell icon. This should open a shell connecting you to the instance without having to set up any keys on your end.

### Getting a Static IP

In order to connect the instance to a custom domain, a static IP address has to be created. As it is, the instance will have a different address each time it is started. To do this, click on your instance, and then select the "Networking" tab. Under the "PUBLIC IPV4" section, there will be a link to attach a static IP. Click on the link and follow the steps provided.

## Set Up the Instance

The MEAN blueprint comes pre-installed with Node.js, Apache, and Git. However, MySQL and Docker still need to be installed. 

### Installing MySQL

Run the following commands the files for MySQL installation:

```sudo apt install wget -y```  
```sudo wget https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb```  

Run the following command to install MySQL:

```sudo apt install ./mysql-apt-config_*_all.deb```

A window will appear with settings for the installation. Select the "MySQL Server & Cluster" option and press enter. Select the most recent version of MySQL and press enter. Select "Ok" and press enter.

Next, enter the following commands:

```sudo apt update```  
```sudo apt install mysql-server```  

When prompted, configure the server password and enable String Password Encryption.

To start the server, run ```sudo systemctl start mysql``` and verify that it is running with ```sudo systemctl status mysql```. (Note: to exit the systemctl screen simply type ```:q```)  

### Installing Docker

Start by running the following command to use the Docker HTTPS repo:  

```sudo apt install apt-transport-https ca-certificates curl gnupg```

Next, add the Docker GPG key and the Docker repo with the following:

```curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg```    

```echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null```

```sudo apt update```

Now install Docker with this command:

```sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin```  

To finalize the Docker installation, run the following command and then restart the LightSail instance.

```sudo usermod -aG docker ${USER}```

Once the instance has rebooted, start MySQL and Docker again with the following commands:

```sudo systemctl start mysql```  
```sudo systemctl start docker```

Next, to enable docker swarm mode, run the following command:

```sudo docker swarm init```

Note: you can disable the swarm mode with `sudo docker swarm leave --force`.

### Adding the Open-Response Repository

Unless the repository name has changed, enter the following:

```git clone https://github.com/OSU-MC/Open-Response.git```  

```git checkout development```

Then ```npm install``` in the main, client, and core directories.

As long as the project name and ownership has remained the same, then DNS records should still exist for the core and client subdomains. If this is the case, be sure to replace the CLIENT_URL and VITE_API_URL in the core and client .env files with ```'http://client.open-response.org'``` and ```'http://core.open-response.org'``` respectively.

### Configure Apache

Included in the repository is a file called "vhost.conf". This is a file used for configuring Apache virtual hosts. Check the file to ensure that the localhost ports are correct still, and if so, copy the file to the necessary folder with the following command:

```cp vhost.conf /opt/bitnami/apache/conf/vhosts/```

## Start the Core and Client as Daemons

Before continuing with the deployment, make sure to follow the instructions for setting up the core and client in their respective READMEs.

With the LightSail instance, processes must be run as daemons in order to stay running when the ssh connection is closed. To do this, use the Forever npm package.

To view the available commands with Forever, enter ```forever --help```.

To finish deploying the application, simply cd to the main folder and run:

```sudo forever start -c "npm run start" ./```  

Now, verify that the site is up by going to the client url in your browser.

That's it for the main deployment!

### Note
For development purposes, know that any node command can be run in the above fashion, where the command is simply follows the -c flag.

To stop a forever process, first enter the following:

```sudo forever list```

Then, use stop the process using the process id shown in the list like so:

```sudo stop [pid]```

Sometimes forever will fail to full stop a node process, which will cause issues in deploying the client to port 3000. To fix this, run ```sudo netstat -nlp```, find the pid of the troublesome node process, and kill it with ```sudo kill [pid]```.