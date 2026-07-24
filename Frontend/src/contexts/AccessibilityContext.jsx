import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'workbridge:accessibility';
const defaultPreferences = {
  fontScale: 'normal',
  contrast: 'normal',
  reduceMotion: false,
  underlineLinks: false,
};

const AccessibilityContext = createContext(null);

const loadPreferences = () => {
  try {
    return { ...defaultPreferences, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return defaultPreferences;
  }
};

const useAccessibility = () => {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return value;
};

export function AccessibilityProvider({ children }) {
  const location = useLocation();
  const [preferences, setPreferences] = useState(loadPreferences);
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);

  const updatePreference = useCallback((name, value) => {
    setPreferences((current) => ({ ...current, [name]: value }));
  }, []);

  const resetPreferences = useCallback(() => setPreferences(defaultPreferences), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    const root = document.documentElement;
    root.dataset.fontScale = preferences.fontScale;
    root.dataset.contrast = preferences.contrast;
    root.classList.toggle('reduce-motion', preferences.reduceMotion);
    root.classList.toggle('underline-links', preferences.underlineLinks);
  }, [preferences]);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    const timer = window.setTimeout(() => main.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const value = useMemo(() => ({
    preferences,
    updatePreference,
    resetPreferences,
    announce,
  }), [announce, preferences, resetPreferences, updatePreference]);

  return (
    <AccessibilityContext.Provider value={value}>
      <a className="skip-link" href="#main-content">Bỏ qua đến nội dung chính</a>
      <a className="skip-link skip-link-secondary" href="#site-navigation">Đến thanh điều hướng</a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function AccessibilityMenu() {
  const { preferences, updatePreference, resetPreferences, announce } = useAccessibility();
  const [open, setOpen] = useState(false);

  const setOption = (name, value, message) => {
    updatePreference(name, value);
    announce(message);
  };

  return (
    <div className="accessibility-tools">
      <button type="button" className="accessibility-tools__trigger" onClick={() => setOpen((value) => !value)}
        aria-expanded={open} aria-controls="accessibility-panel" aria-label="Mở tùy chọn trợ năng">
        <span className="material-symbols-outlined" aria-hidden="true">accessibility_new</span>
      </button>
      {open && (
        <section id="accessibility-panel" className="accessibility-tools__panel" aria-label="Tùy chọn trợ năng">
          <div className="accessibility-tools__heading">
            <div>
              <h2>Trợ năng</h2>
              <p>Điều chỉnh cách WorkBridge hiển thị.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng tùy chọn trợ năng">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>

          <fieldset>
            <legend>Cỡ chữ</legend>
            <div className="accessibility-tools__segmented">
              {[
                ['normal', 'Mặc định'],
                ['large', 'Lớn'],
                ['xlarge', 'Rất lớn'],
              ].map(([value, label]) => (
                <button key={value} type="button" aria-pressed={preferences.fontScale === value}
                  onClick={() => setOption('fontScale', value, `Cỡ chữ ${label.toLowerCase()}`)}>{label}</button>
              ))}
            </div>
          </fieldset>

          <label className="accessibility-tools__toggle">
            <span><strong>Tương phản cao</strong><small>Làm rõ chữ và đường viền</small></span>
            <input type="checkbox" checked={preferences.contrast === 'high'}
              onChange={(event) => setOption('contrast', event.target.checked ? 'high' : 'normal', 'Đã cập nhật độ tương phản')} />
          </label>
          <label className="accessibility-tools__toggle">
            <span><strong>Giảm chuyển động</strong><small>Tắt hiệu ứng không cần thiết</small></span>
            <input type="checkbox" checked={preferences.reduceMotion}
              onChange={(event) => setOption('reduceMotion', event.target.checked, 'Đã cập nhật hiệu ứng chuyển động')} />
          </label>
          <label className="accessibility-tools__toggle">
            <span><strong>Gạch chân liên kết</strong><small>Giúp liên kết dễ nhận biết hơn</small></span>
            <input type="checkbox" checked={preferences.underlineLinks}
              onChange={(event) => setOption('underlineLinks', event.target.checked, 'Đã cập nhật kiểu liên kết')} />
          </label>

          <button type="button" className="accessibility-tools__reset" onClick={() => {
            resetPreferences();
            announce('Đã đặt lại tùy chọn trợ năng');
          }}>Đặt lại mặc định</button>
        </section>
      )}
    </div>
  );
}
