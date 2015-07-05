// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redex/LICENSE

export function create(config, logger, components, state) {

   function getEventType(service, status) {
      if (!service.status) { // no status i.e. app restarted
         return 'initial';
      } else if (service.status !== status) { // status changed
         return 'changed';
      } else { // status unchanged
         if (service.statusCount === config.debounceCount) {
            return 'debounced';
         } else if (service.statusCount < config.debounceCount) {
            return 'debouncing';
         } else {
            return 'unchanged';
         }
      }
   }

   function setServiceStatus(service, status, eventType) {
      if (eventType === 'initial') {
         assert(!service.status, 'initial');
         service.status = status;
         service.alertedStatus = service.status;
         service.statusCount = config.debounceCount;
      } else if (eventType === 'changed') {
         assert(service.status != status, 'status changed');
         service.statusCount = 0;
         service.status = status;
      } else {
         assert(service.status == status, 'status unchanged');
         service.statusCount += 1;
      }
   }

   function isAlertableEvent(eventType) {
      if (eventType === 'debounced') {
         return true;
      } else if (eventType === 'changed' && config.debounceCount === 0) {
         return true;
      } else {
         return false;
      }
   }

   const those = {
      async start() {
         logger.info('started');
      },
      async end() {
      },
      async processStatus(service, status, message) {
         const log = logger.method('processStatus', service.name + ' ' + status);
         let eventType = getEventType(service, status);
         setServiceStatus(service, status, eventType);
         if (isAlertableEvent(eventType)) {
            if (service.alertedStatus !== service.status) {
               service.alertedStatus = service.status;
               components.reporter.sendAlert(status + ' ' + service.name, message);
            } else {
               log.debug('equals alertedStatus:', service.alertedStatus, eventType);
            }
         } else {
            log.debug('not alertable eventType:', eventType);
         }
      }
   };
   return those;
}