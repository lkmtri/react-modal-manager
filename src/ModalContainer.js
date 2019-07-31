import React, { useState, useEffect, useRef, useCallback } from 'react';
import modal from './modal';

const useForceUpdate = () => {
  const [, setState] = useState({});

  const forceUpdate = useCallback(() => {
    setState({});
  }, []);

  return forceUpdate;
};

const ModalContainer = ({ channel }) => {
  const modalByIdsRef = useRef({});
  const allModalIdsRef = useRef([]);
  const forceUpdate = useForceUpdate();

  const onModalEnter = useCallback(
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

  const onModalExit = useCallback(
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

  useEffect(
    () =>
      modal.subscribe({
        [modal.events.ENTER]: onModalEnter,
        [modal.events.EXIT]: onModalExit,
      }),
    [onModalEnter, onModalExit],
  );

  return allModalIdsRef.current.map(id => {
    const { element, ...modal } = modalByIdsRef.current[id];
    return React.cloneElement(element, { key: id, ...modal });
  });
};

export default ModalContainer;
