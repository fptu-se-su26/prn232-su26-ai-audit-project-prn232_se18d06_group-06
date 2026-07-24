import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { API_BASE_URL, getApiErrorMessage } from '../../services/api';

const FILTERS = ['Pending', 'Verified', 'Rejected', 'All'];
const LABELS = { Pending: 'Chờ duyệt', Verified: 'Đã duyệt', Rejected: 'Từ chối', All: 'Tất cả' };
const fileUrl = (path) => `${API_BASE_URL.replace('/api', '')}${path}`;

export default function AdminEmployerVerifications() {
  const [data, setData] = useState({ items: [], totalCount: 0, pendingCount: 0, verifiedCount: 0, rejectedCount: 0 });
  const [status, setStatus] = useState('Pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Verified');
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/employers/verifications', { params: { status, search: search.trim() || undefined } });
      setData(response.data);
      setSelected((current) => current
        ? response.data.items.find((item) => item.verificationId === current.verificationId) || null
        : null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải danh sách hồ sơ KYB.'));
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadVerifications, 250);
    return () => window.clearTimeout(timer);
  }, [loadVerifications]);

  const counts = useMemo(() => ({
    Pending: data.pendingCount,
    Verified: data.verifiedCount,
    Rejected: data.rejectedCount,
    All: data.totalCount,
  }), [data]);

  const openReview = (item, nextStatus) => {
    setSelected(item);
    setReviewStatus(nextStatus);
    setReviewNote(nextStatus === 'Rejected' ? item.reviewNote || '' : 'Hồ sơ hợp lệ và đầy đủ.');
  };

  const submitReview = async () => {
    if (!selected) return;
    if (reviewStatus === 'Rejected' && !reviewNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối để doanh nghiệp có thể bổ sung.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/employers/verifications/${selected.verificationId}/review`, {
        status: reviewStatus,
        reviewNote: reviewNote.trim(),
      });
      toast.success(reviewStatus === 'Verified' ? 'Đã xác thực doanh nghiệp.' : 'Đã gửi yêu cầu bổ sung.');
      setSelected(null);
      await loadVerifications();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể xử lý hồ sơ.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="admin-kyb-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="admin-kyb-title" className="text-xl font-black text-slate-900">Duyệt hồ sơ doanh nghiệp</h2>
            <p className="mt-1 text-sm text-slate-500">Kiểm tra thông tin pháp lý, tài liệu và phản hồi trực tiếp cho nhà tuyển dụng.</p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Tìm hồ sơ</span>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên công ty, email, mã số thuế..." className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Trạng thái hồ sơ">
          {FILTERS.map((filter) => (
            <button key={filter} type="button" role="tab" aria-selected={status === filter} onClick={() => setStatus(filter)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${status === filter ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {LABELS[filter]} <span className="ml-1 opacity-75">{counts[filter] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải hồ sơ...</div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined !text-5xl text-slate-300" aria-hidden="true">fact_check</span>
            <p className="mt-2 font-bold text-slate-600">Không tìm thấy hồ sơ phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr><th className="px-5 py-4">Doanh nghiệp</th><th className="px-5 py-4">Pháp lý</th><th className="px-5 py-4">Người đại diện</th><th className="px-5 py-4">Ngày gửi</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.verificationId} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-black text-slate-900">{item.companyName}</p><p className="text-xs text-slate-500">{item.contactEmail}</p></td>
                    <td className="px-5 py-4"><p className="font-bold text-slate-800">{item.legalCompanyName}</p><p className="text-xs text-slate-500">MST: {item.taxId}</p></td>
                    <td className="px-5 py-4"><p className="font-bold text-slate-800">{item.representativeName}</p><p className="text-xs text-slate-500">{item.representativeTitle || 'Chưa cung cấp chức danh'}</p></td>
                    <td className="px-5 py-4 text-slate-600">{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${item.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-700' : item.verificationStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{LABELS[item.verificationStatus]}</span></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(item)} className="rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-700 hover:bg-slate-100">Chi tiết</button>{item.verificationStatus === 'Pending' && <><button type="button" onClick={() => openReview(item, 'Verified')} className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white hover:bg-emerald-700">Duyệt</button><button type="button" onClick={() => openReview(item, 'Rejected')} className="rounded-lg bg-rose-50 px-3 py-2 font-bold text-rose-700 hover:bg-rose-100">Từ chối</button></>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="kyb-review-title" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h3 id="kyb-review-title" className="text-lg font-black text-slate-900">{selected.legalCompanyName}</h3><p className="text-sm text-slate-500">Hồ sơ #{selected.verificationId}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Đóng" className="rounded-lg p-2 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button></div>
            <div className="space-y-5 p-6">
              <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2"><div><dt className="text-xs font-bold uppercase text-slate-500">Mã số thuế</dt><dd className="mt-1 font-black text-slate-900">{selected.taxId}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Người đại diện</dt><dd className="mt-1 font-black text-slate-900">{selected.representativeName}</dd></div><div className="md:col-span-2"><dt className="text-xs font-bold uppercase text-slate-500">Địa chỉ đăng ký</dt><dd className="mt-1 font-bold text-slate-800">{selected.registrationAddress}</dd></div></dl>
              <div className="flex flex-wrap gap-3"><a href={fileUrl(selected.businessLicenseUrl)} target="_blank" rel="noreferrer" className="rounded-xl bg-sky-50 px-4 py-2 font-bold text-sky-700">Xem giấy phép kinh doanh</a>{selected.supportingDocumentUrl && <a href={fileUrl(selected.supportingDocumentUrl)} target="_blank" rel="noreferrer" className="rounded-xl bg-violet-50 px-4 py-2 font-bold text-violet-700">Xem tài liệu bổ sung</a>}</div>
              {selected.submissionNote && <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700"><strong>Ghi chú doanh nghiệp:</strong> {selected.submissionNote}</div>}
              {selected.verificationStatus === 'Pending' && <div className="space-y-3 border-t border-slate-200 pt-5"><div className="flex gap-2"><button type="button" onClick={() => setReviewStatus('Verified')} className={`rounded-lg px-4 py-2 font-bold ${reviewStatus === 'Verified' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Phê duyệt</button><button type="button" onClick={() => setReviewStatus('Rejected')} className={`rounded-lg px-4 py-2 font-bold ${reviewStatus === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Yêu cầu bổ sung</button></div><label className="block text-sm font-bold text-slate-700">Phản hồi<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows="4" maxLength="1000" className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" /></label><button type="button" disabled={submitting} onClick={submitReview} className="w-full rounded-xl bg-sky-600 py-3 font-black text-white hover:bg-sky-700 disabled:opacity-60">{submitting ? 'Đang xử lý...' : 'Xác nhận kết quả'}</button></div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
