// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redex/LICENSE

const logger = Loggers.create(module.filename);

module.exports = {

   create(state, rootConfig, config) {

      const that = {
      };

      function serviceLine(service) {
         logger.warn('service', service);
         if (service.status) {
            return '' + service.status + ' ' + service.name;
         } else {
            return service.name;
         }
      }

      const those = {
         async start() {
            logger.info('started');
         },
         async end() {
         },
         async serviceReport() {
            let lines = [], ok = [], critical = [], other = [];
            logger.info('services', state.services.size);
            for (let [name, service] of state.services) {
               if (service.status === 'OK') {
                  ok.push(service.name)
               } else if (service.status === 'CRITICAL') {
                  critical.push(service.name)
               } else {
                  lines.push(serviceLine(service));
               }
            }
            if (critical.length) {
               lines.push('CRITICAL: ' + critical.join(' '));
            }
            if (ok.length) {
               lines.push('OK: ' + ok.join(' '));
            }
            return lines;
         }
      };
      return those;
   }
};