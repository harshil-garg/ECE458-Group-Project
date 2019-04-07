# Backup Guide
## Info

 - Backups are taken at 2:28am every day on production server: `vcm-9167.vm.duke.edu`
 - Backups are sent to the backup server: `vcm-8793.vm.duke.edu`
 - Confirmation emails are sent from `hypotheticalmea3s@gmail.com`
 - Password is `admin458proj`
 - The password of the backup server is never needed as production and backup communicate through an ssh connection

## Configure
 - Configuration is entirely automatic and happens on the installation of the production server
 - Refer to `INSTALL.md`

## Restore
 - Navigate to /backup

 - Run `sh restore.sh`

 - This will start an interactive script where you enter the date of the backup you want formatted: `YYYY-MM-DD`

 - The backup will be restored and an email will be sent to the sysadmin

## Verify

 - Look to see that it is the same

