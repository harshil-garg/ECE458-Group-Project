#!/bin/sh
DATE=`date +%Y-%m-%d`;
NAME="backup_$DATE";
/usr/bin/docker run --network=ece458-group-project_default --link ece458-group-project_database_1:db --rm -v $(pwd)/$NAME:/backup mongo bash -c "mongodump --out /backup --host db:27017"
if [ -d "$NAME" -a "$(ls -A $NAME)" ]; then
	scp -i ~/.ssh/id_rsa -r $NAME/ vcm@$backup_hostname:/home/vcm/
	if [ $? -eq 0 ]; then
		#node js/index.js $email_address $(hostname) true
		echo "Success.";
	else
		#node js/index.js $email_address $(hostname) false "Secure Shell Copy failed, please check the backup server health, credentials, and sudo privileges"
		echo "SCP failed.";
	fi
else
	#node js/index.js $email_address $(hostname) false "Mongodump failed, likely due to failed Docker connection to MongoDB server. Check health of the MongoDB instance"
	echo "Mongodump failed."
fi
sudo rm -rf $NAME;
