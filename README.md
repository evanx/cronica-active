
## Chronica - a Node daemon to monitor urls

This is a minimal solution for monitoring HTTP URL status (200 or not), JSON and HTML content.

For URL status monitoring, at a specified interval e.g. 45 seconds, we send an HTTP HEAD request to each URL.

A single YAML configuration file is used. There is no database, and no history.

Alerts are sent to specified email addresses and/or a Slack channel via your Slackbot.

Pros:
- YAML configuration
- Slack integration
- built with Node

Cons:
- URL status monitoring only
- no history
- no fancy graphs

Work in progress:
- JSON content monitoring
- HTML content monitoring (currently only page title)

---
<img src="http://evanx.github.io/images/chronica/chronica-slack.png" width="800" border="1"/>

---

### Work in progress: JSON and HTML content monitoring

The JSON and HTML monitoring is work in progress.

In the case of HTML, we only test the HTML `<title>` in the current initial implementation.

For JSON, we test the content of arrays of data, for our own requirements.


### Installing

```shell
git clone https://github.com/evanx/chronica &&
  cd chronica &&
  cat package.json &&
  npm install &&
  git submodule init &&
  git submodule update
```
Note we have a submodule dependency on `https://github.com/evanx/redexutil` for generic utils for ES7. (We use ES7 async functions, via Babel.)

Our scripts use `pm2` for process management, and `bunyan` for showing logs.
In order to use these scripts, you should install `bunyan` and `pm2` globally:
```shell
 sudo npm install bunyan pm2 -g
```

The `scripts/` directory is a git submodule: https://github.com/evanx/chronica-scripts

Consider forking the `chronica-scripts` repo via github and then deploy your own copy. Then you can modifiy the scripts for your own purposes.

If you are a JavaScript developer, fork the main repo, so can make modifications and easily do a pull request via github.


### Sample config file

```yaml
loggerLevel: info
alerter:
slackMessenger:
   bots: # see: https://api.slack.com/slackbot
   - url: https://MY.slack.com/services/hooks/slackbot?token=...
emailMessenger:
   fromEmail: chronica-alerts@my.com
   admins: # email recipients for alerts
   - email: me@my.com
   - email: other@my.com
tracker: # tracks the status and decides if and when the send an email alert
  debounceCount: 2 # status must stay changed during multiple iterations before alert
reporter:
  helloDelay: 16000 # send an email 16 seconds after starting
  daily: # send a daily digest of current status of all services
    hour: 16 # 16:10 (pm)
    minute: 10
urlMonitor:
  interval: 45000 # check status every 45 seconds
  timeout: 8000 # HTTP connection timeout after 8 seconds
  services:
    myserver1: http://myserver1.com
    myserver2: http://myserver2.com
```

See https://github.com/evanx/chronica/blob/master/sample-config.yaml


### Running

You must create your own configuration file e.g. `~/.chronica.yaml.`

The `scripts/` are just a guide and won't work as in unless:
- Current working directory is `chronica/` i.e. from `git clone`
- `~/.chronica.yaml` exists, e.g. copy and edit the `sample/sample-config.yaml`

See `scripts/run.sh`
```shell
  node index.js ~/.chronica.yaml debug | bunyan -o short
```
where we specify the config file.

Also see `scripts/restart.pm2.sh` which includes the following command:
```shell
cd ~/chronica
pm2 start index.js --name chronica -- ~/.chronica.yaml
```

You can `tail -f` the log file as follows:
```shell
ls --sort=time ~/.pm2/logs/chronica-out-*.log |
    head -1 | xargs tail -f | bunyan -o short
```

### Recommended deployment configuration

Note that if you use multiple instances with the same config file i.e. monitoring the same endpoints, you can expect duplicate alerts by default. Perhaps use one instance to monitor all your endpoints, and another remote instance to monitor the monitor ;)

In order to monitor Chronica remotely, include the following in its config file:
```yaml
expressServer:
   location: /chronica
   port: 8882
```
and proxy as required via NGINX or other.

---

<img src="http://evanx.github.io/images/chronica/chronica-remote.png" width="400" border="1"/>

---

In the `systemReporter` above, the `disk` is a percentage value, `load` is the current load average, and the `redis` is the current Redis memory usage in megs.


#### Alerting peers

It is possible to deploy multiple instances monitoring the same endpoints, and still avoid duplicate alerts via the following configuration:

```yaml
alerter:
  elapsedThreshold: 300000
  peers:
    server1: http://chronica.server1.com/chronica
```

In this case, Chronica will check its peers before sending an alert. If any of its peers have sent any alerts in the past 5 minutes, then it will suppress the alert.

The `elapsedThreshold` is used for both itself and its remote peers, to suppress alerts for the configured duration after an alert is sent.


### Other documentation

Implementation overview: https://github.com/evanx/chronica/blob/master/lib/readme.md

Component factory overview: https://github.com/evanx/chronica/blob/master/lib/ComponentFactory.md


### Future work

We may copy these components into Redex, our modular/CSP project.

See: https://github.com/evanx/redex


### Other resources

Redex utils: https://github.com/evanx/redexutil

Wiki home: https://github.com/evanx/vellum/wiki
