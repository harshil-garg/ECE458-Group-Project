#!/bin/bash
ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa
sudo apt install sshpass
echo "Enter the backup server's hostname"
read backup_hostname
echo "Enter the backup server's password. Please enter carefully, this script is brittle."
read backup_password
sshpass -p $backup_password ssh-copy-id -o "StrictHostKeyChecking no" $backup_hostname
echo "Enter the email address you would like to send backup failure and success alerts to."
read email_address
echo "export backup_hostname=$backup_hostname" >> ~/.bashrc
echo "export backup_hostname=$backup_hostname" >> ~/.profile
echo "export email_address=$email_address" >> ~/.bashrc
echo "export email_address=$email_address" >> ~/.profile
source ~/.bashrc
source ~/.profile
(crontab -l ; echo "28 2 * * * . ~/.profile; cd ~/ECE458-Group-Project/backup && sh backup.sh daily >> daily_backup.log 2>&1") 2>&1 | sed "s/no crontab for $(whoami)//"  | sort | uniq | crontab
(crontab -l ; echo "0 0 * * 0 . ~/.profile; cd ~/ECE458-Group-Project/backup && sh backup.sh weekly >> weekly_backup.log 2>&1") 2>&1 | sed "s/no crontab for $(whoami)//"  | sort | uniq | crontab
(crontab -l ; echo "0 0 1 * * . ~/.profile; cd ~/ECE458-Group-Project/backup && sh backup.sh monthly >> monthly_backup.log 2>&1") 2>&1 | sed "s/no crontab for $(whoami)//"  | sort | uniq | crontab