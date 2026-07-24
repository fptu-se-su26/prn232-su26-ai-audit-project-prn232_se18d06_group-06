import React from 'react';

const createReference = () => `WB-${Date.now().toString(36).toUpperCase()}`;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, reference: null, detailsOpen: false };
    this.headingRef = React.createRef();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, reference: createReference() };
  }

  componentDidCatch(error, info) {
    console.error('UI error boundary caught:', error, info);
    this.props.onError?.({ error, info, reference: this.state.reference });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
      return;
    }
    if (!prevState.hasError && this.state.hasError) {
      this.headingRef.current?.focus();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, reference: null, detailsOpen: false });
  };

  copyReference = async () => {
    const text = `${this.state.reference}: ${this.state.error?.message || 'Unknown UI error'}`;
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
    } catch {
      this.setState({ copied: false });
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    const { error, reference, detailsOpen, copied } = this.state;
    return (
      <section className="error-boundary" role="alert" aria-labelledby="error-boundary-title">
        <div className="error-boundary__card">
          <span className="error-boundary__icon material-symbols-outlined" aria-hidden="true">sentiment_dissatisfied</span>
          <p className="error-boundary__eyebrow">WorkBridge gặp sự cố</p>
          <h1 id="error-boundary-title" ref={this.headingRef} tabIndex="-1">Không thể hiển thị phần nội dung này</h1>
          <p className="error-boundary__description">
            Dữ liệu của bạn vẫn an toàn. Bạn có thể thử mở lại phần này hoặc tải lại toàn bộ trang.
          </p>

          <div className="error-boundary__actions">
            <button type="button" className="error-boundary__primary" onClick={this.reset}>
              <span className="material-symbols-outlined" aria-hidden="true">replay</span>Thử mở lại
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>Tải lại trang
            </button>
            <a href="/">
              <span className="material-symbols-outlined" aria-hidden="true">home</span>Về trang chủ
            </a>
          </div>

          <div className="error-boundary__reference">
            <span>Mã tra cứu: <strong>{reference}</strong></span>
            <button type="button" onClick={this.copyReference}>{copied ? 'Đã sao chép' : 'Sao chép mã'}</button>
          </div>

          {import.meta.env.DEV && error && (
            <details open={detailsOpen} onToggle={(event) => this.setState({ detailsOpen: event.currentTarget.open })}>
              <summary>Chi tiết dành cho nhà phát triển</summary>
              <pre>{error.stack || error.message}</pre>
            </details>
          )}
        </div>
      </section>
    );
  }
}
