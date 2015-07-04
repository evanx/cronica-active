

if ! which pm2
then
  echo 'Please install pm2 globally: npm install pm2 -g'
  exit 1
fi

  rm -f ~/.pm2/logs/chronica-active-*

  [ -f  ~/.chronica-active.yaml ] || exit 1

  cat index.js | grep -q evanxsummers || exit 1

  pm2 stop chronica-active

  pm2 start index.js --name chronica-active -- ~/.chronica-active.yaml

  pm2 show chronica-active

  sleep 2

  ls -l ~/.pm2/logs/chronica-active-*

  ls --sort=time ~/.pm2/logs/chronica-active-err-*.log |
     head -1 | xargs cat | bunyan -o short

  ls --sort=time ~/.pm2/logs/chronica-active-out-*.log |
     head -1 | xargs tail -f | bunyan -o short
