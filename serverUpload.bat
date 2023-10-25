echo off
setlocal
set files="./controllers ./functions ./middlewares ./models ./routes ./index.js package.json package-lock.json router.js createNewPromoUsers.js"

echo Sending %files%

pscp -r -i .\cleBDA.ppk "%files%" ec2-user@ec2-54-166-175-189.compute-1.amazonaws.com:/home/ec2-user

endlocal
echo "Don't forget to upload the .env file and to restart the servers with: pm2 restart 0"