import { useRef, useState, useEffect, useCallback } from 'react';
import uuid from 'uuid/v4';
import modal from './modal';

export const useModalState = id => {
  const [isOpen, setOpen] = useState(() => {
    return modal.isOpen(id);
  });

  useEffect(() => {
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

export const useModalHandle = id => {
  const hide = useCallback(
    callback => {
      modal.hide(id, callback);
    },
    [id],
  );

  return {
    hide,
  };
};

export const useModal = (element, options) => {
  const [id, setId] = useState(() => (options || {}).id || uuid());
  const optionsRef = useRef(options);
  const elementRef = useRef(element);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    elementRef.current = element;
  }, [element]);

  useEffect(() => {
    if (options && options.id && id !== options.id) {
      setId(options.id)
    }
  }, [id, options]);

  const show = useCallback(() => {
    modal.show(elementRef.current, { ...optionsRef.current, id });
  }, [id]);

  return {
    ...useModalState(id),
    ...useModalHandle(id),
    show,
  };
};
