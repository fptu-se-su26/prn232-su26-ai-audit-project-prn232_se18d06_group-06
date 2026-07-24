import React, { useEffect, useRef, useState } from 'react';

const CHECK_DELAY_MS = 2500;

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [visible, setVisible] = useState(() => !navigator.onLine);
  const hideTimer = useRef(null);

  useEffect(() => {
    const handleOffline = () => {
      window.clearTimeout(hideTimer.current);
      setOnline(false);
      setVisible(true);
    };
    const handleOnline = () => {
      setOnline(true);
      setVisible(true);
      hideTimer.current = window.setTimeout(() => setVisible(false), CHECK_DELAY_MS);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.clearTimeout(hideTimer.current);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`network-status ${online ? 'network-status--online' : 'network-status--offline'}`}
      role="status" aria-live="assertive">
      <span className="material-symbols-outlined" aria-hidden="true">{online ? 'wifi' : 'wifi_off'}</span>
      <div>
        <strong>{online ? 'Đã kết nối lại' : 'Bạn đang ngoại tuyến'}</strong>
        <span>{online ? 'Dữ liệu mới sẽ tiếp tục được đồng bộ.' : 'Một số thao tác có thể chưa được lưu.'}</span>
      </div>
      {!online && <button type="button" onClick={() => window.location.reload()}>Thử lại</button>}
    </div>
  );
}
