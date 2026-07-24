import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { API_BASE_URL, getApiErrorMessage } from '../../services/api';

const EMPTY_FORM = {
  taxId: '',
  legalCompanyName: '',
  registrationAddress: '',
  representativeName: '',
  representativeTitle: '',
  submissionNote: '',
};

const STATUS_META = {
  Verified: { label: 'Đã xác thực', icon: 'verified', tone: 'bg-emerald-100 text-emerald-700' },
  Pending: { label: 'Đang chờ duyệt', icon: 'pending_actions', tone: 'bg-amber-100 text-amber-700' },
  Rejected: { label: 'Cần bổ sung', icon: 'error', tone: 'bg-rose-100 text-rose-700' },
  Unverified: { label: 'Chưa xác thực', icon: 'shield_question', tone: 'bg-slate-100 text-slate-700' },
};

const fileUrl = (path) => path ? `${API_BASE_URL.replace('/api', '')}${path}` : '#';
const formatDate = (value) => value
  ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
  : '—';

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Unverified;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${meta.tone}`}>
      <span className="material-symbols-outlined !text-[17px]" aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

function DocumentLink({ href, children }) {
  if (!href) return null;
  return (
    <a
      href={fileUrl(href)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100"
    >
      <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">description</span>
      {children}
    </a>
  );
}

export default function EmployerVerification() {
  const [overview, setOverview] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [licenseFile, setLicenseFile] = useState(null);
  const [supportingFile, setSupportingFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewResponse, profileResponse] = await Promise.all([
        api.get('/employer/verification'),
        api.get('/employer/profile'),
      ]);
      setOverview(overviewResponse.data);
      setProfile(profileResponse.data);
      setForm((current) => ({
        ...current,
        taxId: current.taxId || profileResponse.data.taxId || '',
        legalCompanyName: current.legalCompanyName || profileResponse.data.companyName || '',
        registrationAddress: current.registrationAddress || profileResponse.data.address || '',
        representativeName: current.representativeName || profileResponse.data.fullName || '',
      }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải hồ sơ xác thực.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentStatus = useMemo(() => {
    if (overview?.currentStatus === 'Pending' && !overview?.latestSubmission) return 'Unverified';
    return overview?.currentStatus || profile?.verificationStatus || 'Unverified';
  }, [overview, profile]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateFile = (file, label) => {
    if (!file) return true;
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!['.png', '.jpg', '.jpeg', '.webp', '.pdf'].includes(extension)) {
      toast.error(`${label} phải là ảnh hoặc PDF.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${label} không được vượt quá 5MB.`);
      return false;
    }
    return true;
  };

  const submitVerification = async (event) => {
    event.preventDefault();
    const normalizedTaxId = form.taxId.replace(/\D/g, '');
    if (normalizedTaxId.length < 10 || normalizedTaxId.length > 14) {
      toast.error('Mã số thuế phải gồm từ 10 đến 14 chữ số.');
      return;
    }
    if (!licenseFile) {
      toast.error('Vui lòng chọn giấy phép đăng ký kinh doanh.');
      return;
    }
    if (!validateFile(licenseFile, 'Giấy phép kinh doanh') ||
        !validateFile(supportingFile, 'Tài liệu bổ sung')) return;

    const payload = new FormData();
    Object.entries({ ...form, taxId: normalizedTaxId }).forEach(([key, value]) => payload.append(key, value));
    payload.append('businessLicenseFile', licenseFile);
    if (supportingFile) payload.append('supportingDocumentFile', supportingFile);

    setSubmitting(true);
    try {
      await api.post('/employer/verify', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Đã gửi hồ sơ xác thực doanh nghiệp.');
      setLicenseFile(null);
      setSupportingFile(null);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể gửi hồ sơ xác thực.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Đang tải hồ sơ KYB...</div>;
  }

  const latest = overview?.latestSubmission;
  const canSubmit = overview?.canSubmit ?? currentStatus !== 'Verified';

  return (
    <section className="space-y-6" aria-labelledby="kyb-heading">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-7 text-white lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-100">Business verification</p>
              <h2 id="kyb-heading" className="mt-1 text-2xl font-black">Xác thực doanh nghiệp (KYB)</h2>
              <p className="mt-2 max-w-2xl text-sm text-sky-100">Cung cấp thông tin pháp lý để mở khóa đăng tuyển và tăng độ tin cậy với ứng viên.</p>
            </div>
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div>
            {canSubmit ? (
              <form className="space-y-5" onSubmit={submitVerification} noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Tên pháp lý doanh nghiệp *
                    <input name="legalCompanyName" value={form.legalCompanyName} onChange={updateField} required className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                  </label>
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Mã số thuế *
                    <input name="taxId" inputMode="numeric" value={form.taxId} onChange={updateField} required className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                  </label>
                </div>
                <label className="block space-y-1.5 text-sm font-bold text-slate-700">
                  Địa chỉ đăng ký kinh doanh *
                  <textarea name="registrationAddress" value={form.registrationAddress} onChange={updateField} required rows="2" className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Người đại diện pháp luật *
                    <input name="representativeName" value={form.representativeName} onChange={updateField} required className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                  </label>
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Chức danh
                    <input name="representativeTitle" value={form.representativeTitle} onChange={updateField} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Giấy phép ĐKKD *
                    <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={(event) => setLicenseFile(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-dashed border-slate-300 p-3 font-normal" />
                  </label>
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Tài liệu bổ sung
                    <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={(event) => setSupportingFile(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-dashed border-slate-300 p-3 font-normal" />
                  </label>
                </div>
                <label className="block space-y-1.5 text-sm font-bold text-slate-700">
                  Ghi chú cho quản trị viên
                  <textarea name="submissionNote" value={form.submissionNote} onChange={updateField} maxLength="1000" rows="3" className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                </label>
                <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-black text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">
                  <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                  {submitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xác thực'}
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-black text-slate-900">{overview?.blockingReason || 'Hồ sơ hiện không thể gửi lại.'}</h3>
                {latest?.reviewNote && <p className="mt-2 text-sm text-rose-700"><strong>Phản hồi:</strong> {latest.reviewNote}</p>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <DocumentLink href={latest?.businessLicenseUrl}>Giấy phép kinh doanh</DocumentLink>
                  <DocumentLink href={latest?.supportingDocumentUrl}>Tài liệu bổ sung</DocumentLink>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 rounded-2xl bg-slate-50 p-5">
            <h3 className="font-black text-slate-900">Quy trình xét duyệt</h3>
            {['Điền thông tin pháp lý', 'Tải tài liệu hợp lệ', 'Quản trị viên kiểm tra', 'Nhận kết quả qua thông báo'].map((step, index) => (
              <div key={step} className="flex gap-3 text-sm text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 font-black text-sky-700">{index + 1}</span>
                <span className="pt-1">{step}</span>
              </div>
            ))}
            <p className="rounded-xl bg-white p-3 text-xs leading-5 text-slate-600">Định dạng hỗ trợ: PNG, JPG, WEBP, PDF. Mỗi file tối đa 5MB.</p>
          </aside>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <button type="button" onClick={() => setShowHistory((value) => !value)} aria-expanded={showHistory} className="flex w-full items-center justify-between text-left">
          <span className="font-black text-slate-900">Lịch sử gửi hồ sơ ({overview?.history?.length || 0})</span>
          <span className="material-symbols-outlined" aria-hidden="true">{showHistory ? 'expand_less' : 'expand_more'}</span>
        </button>
        {showHistory && (
          <div className="mt-5 space-y-4">
            {(overview?.history || []).length === 0 ? <p className="text-sm text-slate-500">Chưa có hồ sơ nào được gửi.</p> : overview.history.map((item) => (
              <article key={item.verificationId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge status={item.status} />
                  <time className="text-xs font-semibold text-slate-500">{formatDate(item.submittedAt)}</time>
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div><dt className="text-slate-500">Tên pháp lý</dt><dd className="font-bold text-slate-800">{item.legalCompanyName}</dd></div>
                  <div><dt className="text-slate-500">Mã số thuế</dt><dd className="font-bold text-slate-800">{item.taxId}</dd></div>
                  <div><dt className="text-slate-500">Người đại diện</dt><dd className="font-bold text-slate-800">{item.representativeName}</dd></div>
                  <div><dt className="text-slate-500">Ngày xử lý</dt><dd className="font-bold text-slate-800">{formatDate(item.reviewedAt)}</dd></div>
                </dl>
                {item.reviewNote && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{item.reviewNote}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
