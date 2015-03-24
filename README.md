
# chronica - microservice-based monitoring

Chronica is envisaged as a simple secure monitoring solution using Node.js and Redis.

This is a Node redesign of my abandoned Java <a href="https://github.com/evanx/chronic">Chronic</a> project.

It's a design/work in progress, as a side-project.
 

### Background: Chronic

The intial problem that prompted Chronic, was my receiving many overnight cronjob emails, from custom backup scripts etc. And wanting to use cron scripts for monitoring security-related information.

Chronic was a Java monitoring server whereby client machines can post output e.g. from shell scripts, to this server. This text is diff'ed to the previous posting e.g from the previous day, and then sending a notification when the content has changed. This enabled custom monitoring scripts to be run via the cron, e.g. every minute, or every day.

An extensible client bash script was developed, which included various standard checks. More importantly, it enabled custom checks. It piped shell output into `curl` in order to POST information to the server via client-authenticated HTTPS, with auto-enrollment. Email notifications would include HTTPS links to view the information via the browser, with Mozilla Persona authentication. 

This seemed like a simple secure solution to the problem of custom monitoring of security and operations.

But the Chronic server was a terribly monolithic Java/SQL application, with an Angular front-end. I enjoyed learning Angular for that. Anyway, I abandoned that project within a few months, about a year ago.

But monitoring is fun. So Chronica will re-imagine that solution, and implement it using Node microservices, Redis and ReactJS.

Also I hope that by building an easy free service for security monitoring, based on this opensource project, might have a positive effect on internet security for many.


### Chronica systems and services

* example "agent" script (Node)
* admin console (ReactJS)
* ingester service
* data store service (Redis)
* proxy service
* cert service 


### Related services

https://github.com/evanx/certserver - certificate enrollment, management and authentication


### Other resources

Wiki home: https://github.com/evanx/vellum/wiki

