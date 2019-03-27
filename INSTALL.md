## Clone repository
`git clone https://github.com/jap87/ECE458-Group-Project.git`

## SSH into Duke-provisioned VM using credentials and run the following
`sudo apt-get update`

`sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y`

`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`

`sudo apt-key fingerprint 0EBFCD88`

`sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"`

`sudo apt-get update`

`sudo apt-get install docker-ce docker-ce-cli containerd.io -y`

`sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

`sudo chmod +x /usr/local/bin/docker-compose`

`sudo usermod -aG docker ${USER}`

`logout`

## SSH into Duke-provisioned VM AGAIN as the previous command logged you out.
## The below sets up node, angular, docker, certificates.

`curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - && sudo apt-get install -y nodejs`

`sudo npm install -g @angular/cli`

`sudo apt-get update`

`sudo apt-get install software-properties-common`

`sudo add-apt-repository universe`

`sudo add-apt-repository ppa:certbot/certbot -y`

`sudo apt-get update`

`sudo apt-get install certbot -y`

`sudo certbot certonly --standalone --register-unsafely-without-email --agree-tos --no-eff-email --domain $(hostname)`

`sudo chmod 777 /etc/letsencrypt/live`

`sudo chown -R $(whoami) .config`

`cd ECE458-Group-Project`

`rm -rf certificates`

`mkdir certificates`

`sudo cp /etc/letsencrypt/live/$(hostname)/fullchain.pem certificates/server.cert`

`sudo cp /etc/letsencrypt/live/$(hostname)/privkey.pem certificates/server.key`

`echo "{\"/api/*\":{\"target\":\"https://$(hostname):3000\",\"secure\": false}}" > angular-src/proxy.conf.json`

`sudo chmod 777 certificates/server.cert`

`sudo chmod 777 certificates/server.key`

`cd backup`

`rm -rf backup.log`

`sudo npm install`

## Run the backup setup script. Step through it step by step. Make sure you have a second Duke VM provisioned as backup.
## You will be asked for a backup server hostname, password, and email address to send notifications to.
`bash backup_setup.sh`

## Bring up production server
`cd ..`

`docker-compose down -v && docker-compose up --build`
