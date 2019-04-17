#!/bin/sh
echo "Enter backup data in form YYYY-MM-DD_type where type is either daily, weekly, or monthly";
read date_str;
DIRNAME="backup_$date_str";
scp -i ~/.ssh/id_rsa -r vcm@$backup_hostname:/home/vcm/$DIRNAME/ .
if [ $? -eq 0 ] && [ -d "$DIRNAME" ] && [ "$(ls -A $DIRNAME)" ]; then
    DELETE_SUCCESS=$(docker exec ece458-group-project_database_1 mongo hypotheticalmeals --eval "db.dropDatabase()" | grep "ok");
    if [ -n "$DELETE_SUCCESS" ]; then
        RESTORE_ERROR=$(docker run --network=ece458-group-project_default --link ece458-group-project_database_1:db --rm -v $(pwd)/$DIRNAME:/backup mongo bash -c "mongorestore /backup --host db:27017" | grep "error");
        if [ -z "$RESTORE_ERROR" ]; then
            node js/restore.js $email_address $(hostname) true
            echo "Success.";
        else
            node js/restore.js $email_address $(hostname) false "Mongorestore failed. The data could be corrupted or the Docker container subnetwork is unreachable. Please debug manually."
            echo "Restore failed.";
        fi
    else
        node js/restore.js $email_address $(hostname) false "Previous database could not be discarded. Please check MongoDB logs."
        echo "Database drop failed.";
    fi
    sudo rm -rf $DIRNAME;
else
    node js/restore.js $email_address $(hostname) false "SCP failed, please check the backup server health, credentials, and sudo privileges. It may also be possible that the backup requested does not exist."
    echo "SCP failed.";
fi
