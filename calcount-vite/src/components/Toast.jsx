import { useImperativeHandle, forwardRef, useState, useRef } from 'react';

const Toast = forwardRef((_, ref) => {
  const [state, setState] = useState({ msg: '', type: 'success', visible: false });
  const timerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show(msg, type = 'success') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState({ msg, type, visible: true });
      timerRef.current = setTimeout(() => setState(s => ({ ...s, visible: false })), 2800);
    },
  }));

  return (
    <div className={`toast ${state.type} ${state.visible ? 'show' : ''}`}>
      {state.msg}
    </div>
  );
});

Toast.displayName = 'Toast';
export default Toast;
