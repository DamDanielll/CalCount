import { useEffect, useRef } from 'react';

let _show = null;

export function useToast() {
  return (msg, type = 'success') => {
    if (_show) _show(msg, type);
  };
}

export function Toast() {
  const elRef = useRef(null);

  useEffect(() => {
    _show = (msg, type = 'success') => {
      const el = elRef.current;
      if (!el) return;
      el.textContent = msg;
      el.className = `toast ${type} show`;
      clearTimeout(el._t);
      el._t = setTimeout(() => {
        el.className = 'toast';
      }, 2800);
    };
    return () => { _show = null; };
  }, []);

  return <div ref={elRef} className="toast" />;
}
