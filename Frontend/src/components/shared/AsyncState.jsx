import React from 'react';
import { getApiErrorMessage } from '../../services/api';

export function LoadingState({ title = 'Đang tải dữ liệu', description = 'Vui lòng chờ trong giây lát.', rows = 3 }) {
  return (
    <div className="async-state" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{title}. {description}</span>
      <div className="async-state__skeleton" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div className="async-state__skeleton-row" key={index}>
            <span className="async-state__skeleton-avatar" />
            <span className="async-state__skeleton-lines"><i /><i /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon = 'inbox',
  title = 'Chưa có dữ liệu',
  description = 'Nội dung sẽ xuất hiện tại đây khi có cập nhật.',
  actionLabel,
  onAction,
  children,
}) {
  return (
    <section className="async-state async-state--centered" aria-labelledby="empty-state-title">
      <span className="async-state__icon material-symbols-outlined" aria-hidden="true">{icon}</span>
      <h2 id="empty-state-title">{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && <button type="button" onClick={onAction}>{actionLabel}</button>}
      {children}
    </section>
  );
}

export function ErrorState({
  error,
  title = 'Không thể tải nội dung',
  description,
  onRetry,
  retryLabel = 'Thử lại',
  compact = false,
}) {
  const message = description || getApiErrorMessage(error, 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  const requestId = error?.response?.headers?.['x-request-id'] || error?.response?.data?.requestId;

  return (
    <section className={`async-state async-state--error ${compact ? 'async-state--compact' : 'async-state--centered'}`}
      role="alert" aria-labelledby="error-state-title">
      <span className="async-state__icon material-symbols-outlined" aria-hidden="true">error</span>
      <div>
        <h2 id="error-state-title">{title}</h2>
        <p>{message}</p>
        {requestId && <small>Mã tra cứu: {requestId}</small>}
      </div>
      {onRetry && <button type="button" onClick={onRetry} autoFocus={!compact}>{retryLabel}</button>}
    </section>
  );
}

export function InlineFieldError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="field-error" role="alert"><span className="material-symbols-outlined" aria-hidden="true">error</span>{children}</p>;
}

export function AsyncContent({ loading, error, isEmpty, onRetry, loadingProps, emptyProps, children }) {
  if (loading) return <LoadingState {...loadingProps} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState {...emptyProps} />;
  return children;
}
