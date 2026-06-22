import React from 'react';

export default function ReviewModal({ isOpen, onClose, revieweeName, jobTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-900">Review</h2>
        <p className="mt-2 text-sm text-slate-600">
          Leave a review for <span className="font-bold">{revieweeName || 'this company'}</span>
          {jobTitle ? ` about ${jobTitle}` : ''}.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-sky-600 px-4 py-2 font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
