// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redex/LICENSE

import * as YamlAsserts from '../lib/YamlAsserts';

export default class HtmlMonitor {

   constructor(config, logger, context) {
      this.config = config;
      this.logger = logger;
      this.context = context;
      this.init();
   }

   init() {
      for (let name in this.config.services) {
         this.logger.info('service', name);
         let service = this.config.services[name];
         service.name = name;
         service.type = 'html';
         assert(service.url, 'service.url');
         assert(service.name, 'service.name');
         if (!service.content) {
            this.logger.warn('no content requirements', service.name);
         }
         if (!service.label) {
            service.label = service.name;
         }
         this.context.stores.service.add(service);
      }
   }

   async checkServices() {
      for (const [name, service] of this.context.stores.service.services) {
         if (service.type === 'html') {
            await this.checkService(service);
         }
      }
   }

   checkContent(service, response, content) {
      assert(!lodash.isEmpty(content), 'content');
      assert(lodash.startsWith(response.headers['content-type'], 'text/html'), 'content type');
      let contentLength = response.headers['content-length'];
      if (!contentLength) {
         this.logger.verbose('response.headers', service.name, Object.keys(response.headers).join(', '));
      } else {
         this.logger.verbose('content', service.name, contentLength, content.length);
         if (false) {
            assert.equal(parseInt(contentLength), content.toString().length, 'content length');
         }
      }
      if (service.content) {
         let checked = false;
         if (service.content.title) {
            checked = true;
            let titleMatcher = content.match(/<title>(.+)<\/title>/);
            assert(titleMatcher && titleMatcher.length > 1, 'title');
            let title = lodash.trim(titleMatcher[1]);
            service.debug.title = title;
            assert.equal(title, service.content.title, 'title');
         }
         if (service.content.canonicalLink) {
            checked = true;
            let matcher = content.match(/<link rel="canonical" href="([^"]+)"\/>/);
            assert(matcher && matcher.length > 1, 'canonicalLink');
            let canonicalLink = lodash.trim(matcher[1]);
            service.debug.canonicalLink = canonicalLink;
            assert.equal(canonicalLink, service.content.canonicalLink, 'canonicalLink');
         }
         if (!checked) {
            this.logger.debug('checkService', service.name, content.length);
         }
      }
   }

   async checkService(service) {
      try {
         this.logger.verbose('checkService', service.name);
         let options = {
            url: service.url,
            method: 'get',
            timeout: this.config.timeout
         };
         service.debug.url = service.url;
         if (service.headers) {
            options.headers = service.headers;
            service.debug['User-Agent'] = service.headers['User-Agent'];
            this.logger.verbose('request', options);
         }
         let [response, content] = await Requests.response(options);
         this.logger.verbose('response', service.name, response.statusCode, service.headers);
         if (service.statusCode) {
            service.debug.statusCode = response.statusCode;
            assert.equal(response.statusCode, service.statusCode, 'statusCode: ' + service.statusCode);
         } else {
            assert.equal(response.statusCode, 200, 'statusCode');
         }
         if (response.statusCode === 200) {
            this.checkContent(service, response, content);
         }
         await this.context.components.tracker.processStatus(service, 'OK');
      } catch (err) {
         service.debug.error = {
            message: err.message || err,
            time: new Date()
         };
         this.logger.verbose('checkService', service.name, err);
         this.context.components.tracker.processStatus(service, 'WARN', err.message);
      }
   }

   async pub() {
      return { };
   }

   async start() {
      this.logger.info('started');
   }

   async end() {
   }

   async scheduledTimeout() {
      this.logger.verbose('scheduledTimeout');
      await this.checkServices();
   }

   async scheduledInterval() {
      this.logger.verbose('scheduledInterval');
      await this.checkServices();
   }
}
