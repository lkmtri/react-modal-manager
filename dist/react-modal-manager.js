'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var uuid = _interopDefault(require('uuid/v4'));
var EventEmitter = _interopDefault(require('@suinegmai/js-events'));

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

const useForceUpdate = () => {
  const [, setState] = React.useState({});

  const forceUpdate = React.useCallback(() => {
    setState({});
  }, []);

  return forceUpdate;
};

const ModalContainer = ({ channel }) => {
  const modalByIdsRef = React.useRef({});
  const allModalIdsRef = React.useRef([]);
  const forceUpdate = useForceUpdate();

  const onModalEnter = React.useCallback(
    (id, element, options = {}) => {
      if (options.channel !== channel) return;
      modalByIdsRef.current[id] = {
        id,
        element,
        isOpen: true,
        onExit: callback => modal.hide(id, callback),
        onExited: () => modal.emit(id),
      };
      if (!allModalIdsRef.current.includes(id)) {
        allModalIdsRef.current.push(id);
      }
      forceUpdate();
    },
    [channel, forceUpdate],
  );

  const onModalExit = React.useCallback(
    (id, callback) => {
      if (!allModalIdsRef.current.includes(id)) return;
      modalByIdsRef.current[id].isOpen = false;
      forceUpdate();
      modal.once(id, () => {
        if (!modalByIdsRef.current[id].isOpen) {
          allModalIdsRef.current = allModalIdsRef.current.filter(i => i !== id);
          forceUpdate();
        }
        typeof callback === 'function' && callback();
      });
    },
    [forceUpdate],
  );

  React.useEffect(
    () =>
      modal.subscribe({
        [modal.events.ENTER]: onModalEnter,
        [modal.events.EXIT]: onModalExit,
      }),
    [onModalEnter, onModalExit],
  );

  return allModalIdsRef.current.map(id => {
    const { element, ...modal } = modalByIdsRef.current[id];
    return React__default.cloneElement(element, { key: id, ...modal });
  });
};

const useModalState = id => {
  const [isOpen, setOpen] = React.useState(() => {
    return modal.isOpen(id);
  });

  React.useEffect(() => {
    return modal.subscribe({
      [modal.events.ENTER]: modalId => {
        modalId === id && setOpen(true);
      },
      [modal.events.EXIT]: modalId => {
        modalId === id && setOpen(false);
      },
    });
  }, [id]);

  return {
    isOpen,
  };
};

const useModalHandle = id => {
  const hide = React.useCallback(
    callback => {
      modal.hide(id, callback);
    },
    [id],
  );

  return {
    hide,
  };
};

const useModal = (element, options) => {
  const [id, setId] = React.useState(() => (options || {}).id || uuid());
  const optionsRef = React.useRef(options);
  const elementRef = React.useRef(element);

  React.useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  React.useEffect(() => {
    elementRef.current = element;
  }, [element]);

  React.useEffect(() => {
    if (options && options.id && id !== options.id) {
      setId(options.id);
    }
  }, [id, options]);

  const show = React.useCallback(() => {
    modal.show(elementRef.current, { ...optionsRef.current, id });
  }, [id]);

  return {
    ...useModalState(id),
    ...useModalHandle(id),
    show,
  };
};

exports.ModalContainer = ModalContainer;
exports.modal = modal;
exports.useModal = useModal;
exports.useModalHandle = useModalHandle;
exports.useModalState = useModalState;
