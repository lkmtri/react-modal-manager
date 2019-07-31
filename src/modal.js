import uuid from 'uuid/v4';
import EventEmitter from '@suinegmai/js-events';

const emitter = EventEmitter();

const events = {
  ENTER: 'ENTER',
  EXIT: 'EXIT',
};

const modal = {
  ...emitter,
  events,
  states: {},
  subscribe: obj => {
    Object.keys(obj).forEach(key => {
      modal.on(key, obj[key]);
    });

    return () => {
      Object.keys(obj).forEach(key => {
        modal.off(key, obj[key]);
      });
    };
  },
  isOpen: id => modal.states[id],
  show: (element, options) => {
    const id = (options || {}).id || uuid();
    emitter.emit(events.ENTER, id, element, options);
    modal.states[id] = true;
    return id;
  },
  hide: (id, callback) => {
    if (!modal.states[id]) return;
    emitter.emit(events.EXIT, id, callback);
    modal.states[id] = false;
  },
};

export default modal;
