#!/bin/bash
DATE=`date +%Y-%m-%d`;
NAME="backup_$DATE""_$1";
echo $NAME;
echo $email_address
/usr/bin/docker run --name backup_container --network=ece458-group-project_default --link ece458-group-project_database_1:db -v $(pwd)/$NAME:/backup mongo bash -c "mongodump --out /backup --host db:27017"
/usr/bin/docker logs backup_container >& docker.log
/usr/bin/docker rm backup_container
if [ -d "$NAME" -a "$(ls -A $NAME)" ]; then
	scp -i ~/.ssh/id_rsa -r $NAME/ vcm@$backup_hostname:/home/vcm/
	if [ $? -eq 0 ]; then
		node js/backup.js $email_address $(hostname) true
		echo "Success.";
	else
		node js/backup.js $email_address $(hostname) false "Secure Shell Copy failed, please check the backup server health, credentials, and sudo privileges"
		echo "SCP failed.";
	fi
else
	node js/backup.js $email_address $(hostname) false "Mongodump failed, likely due to failed Docker connection to MongoDB server. Check health of the MongoDB instance"
	echo "Mongodump failed."
fi
sudo rm -rf $NAME
sudo rm -rf docker.log
