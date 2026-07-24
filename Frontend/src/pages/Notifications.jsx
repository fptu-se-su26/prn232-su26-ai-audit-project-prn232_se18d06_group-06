import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { signalRService } from '../services/signalrService';
import Pagination from '../components/shared/Pagination';
import { getNotificationIcon } from '../utils/notificationIcon';

const PAGE_SIZE = 12;
const STATES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'unread', label: 'Chưa đọc' },
    { value: 'read', label: 'Đã đọc' },
    { value: 'archived', label: 'Đã lưu trữ' },
];

const Notifications = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ items: [], totalItems: 0, unreadCount: 0, categoryCounts: {} });
    const [page, setPage] = useState(1);
    const [state, setState] = useState('all');
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/notification', {
                params: { page, pageSize: PAGE_SIZE, state, category: category || undefined, search: search || undefined },
            });
            setData(response.data);
            setSelected([]);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải thông báo.');
        } finally {
            setLoading(false);
        }
    }, [page, state, category, search]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
    useEffect(() => {
        const refresh = () => { setPage(1); fetchNotifications(); };
        signalRService.on('ReceiveNotification', refresh);
        return () => signalRService.off('ReceiveNotification', refresh);
    }, [fetchNotifications]);

    const updateFilter = (setter, value) => { setter(value); setPage(1); };
    const toggleSelected = (id) => setSelected((current) => current.includes(id)
        ? current.filter((item) => item !== id) : [...current, id]);
    const selectPage = () => setSelected(selected.length === data.items.length
        ? [] : data.items.map((item) => item.notificationId));

    const markAsRead = async (notification) => {
        if (!notification.isRead) await api.patch(`/notification/${notification.notificationId}/read`);
        if (notification.actionUrl) return navigate(notification.actionUrl);
        const text = `${notification.title} ${notification.message}`.toLowerCase();
        const role = localStorage.getItem('role');
        if (role === 'Employer') {
            if (text.includes('application')) return navigate('/employer-dashboard?tab=review-applicants');
            if (text.includes('interview')) return navigate('/employer-dashboard?tab=interviews');
            if (text.includes('offer')) return navigate('/employer-dashboard?tab=offers');
            return navigate('/employer-dashboard');
        }
        if (text.includes('application')) return navigate('/my-applications');
        if (text.includes('interview')) return navigate('/interviews');
        if (text.includes('offer')) return navigate('/offers');
        return navigate('/profile');
    };

    const archiveSelected = async (archived = true) => {
        if (!selected.length) return;
        await api.patch(`/notification/archive?archived=${archived}`, { notificationIds: selected });
        toast.success(archived ? 'Đã lưu trữ thông báo.' : 'Đã khôi phục thông báo.');
        fetchNotifications();
    };

    const deleteSelected = async () => {
        if (!selected.length) return;
        await api.delete('/notification/bulk', { data: { notificationIds: selected } });
        toast.success('Đã xóa thông báo đã chọn.');
        fetchNotifications();
    };

    const deleteOne = async (id, event) => {
        event.stopPropagation();
        await api.delete(`/notification/${id}`);
        toast.success('Đã xóa thông báo.');
        fetchNotifications();
    };

    const categories = Object.entries(data.categoryCounts || {});

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-display">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-5xl px-5 py-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Trung tâm thông báo</h1>
                            <p className="mt-2 text-sm text-slate-600">{data.unreadCount} thông báo chưa đọc</p>
                        </div>
                        <label className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                            <input value={search} onChange={(e) => updateFilter(setSearch, e.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary"
                                placeholder="Tìm theo tiêu đề hoặc nội dung" aria-label="Tìm thông báo" />
                        </label>
                    </div>
                </div>
            </header>

            <main className="mx-auto mt-7 max-w-5xl px-5">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    {STATES.map((item) => (
                        <button key={item.value} onClick={() => updateFilter(setState, item.value)}
                            className={`rounded-full px-4 py-2 text-sm font-bold ${state === item.value ? 'bg-primary text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                            {item.label}
                        </button>
                    ))}
                    <select value={category} onChange={(e) => updateFilter(setCategory, e.target.value)}
                        className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Loại thông báo">
                        <option value="">Mọi loại</option>
                        {categories.map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}
                    </select>
                </div>

                {selected.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white">
                        <span className="mr-auto text-sm font-bold">Đã chọn {selected.length}</span>
                        <button onClick={() => archiveSelected(state !== 'archived')} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20">
                            {state === 'archived' ? 'Khôi phục' : 'Lưu trữ'}
                        </button>
                        <button onClick={deleteSelected} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold hover:bg-red-600">Xóa</button>
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy={loading}>
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
                        <input type="checkbox" checked={data.items.length > 0 && selected.length === data.items.length}
                            onChange={selectPage} aria-label="Chọn tất cả thông báo trong trang" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{data.totalItems} thông báo</span>
                    </div>
                    {loading ? (
                        <div className="p-16 text-center text-slate-500">Đang tải thông báo...</div>
                    ) : data.items.length === 0 ? (
                        <div className="p-16 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300">notifications_off</span>
                            <h2 className="mt-3 font-bold text-slate-700">Không tìm thấy thông báo</h2>
                        </div>
                    ) : data.items.map((item) => (
                        <article key={item.notificationId} onClick={() => markAsRead(item)}
                            className={`group flex cursor-pointer gap-4 border-b border-slate-100 p-5 last:border-0 hover:bg-slate-50 ${item.isRead ? '' : 'bg-blue-50/40'}`}>
                            <input type="checkbox" checked={selected.includes(item.notificationId)}
                                onChange={() => toggleSelected(item.notificationId)} onClick={(e) => e.stopPropagation()}
                                aria-label={`Chọn ${item.title}`} />
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">{getNotificationIcon(item.title, item.message)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{item.category}</span>
                                    {!item.isRead && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Chưa đọc" />}
                                </div>
                                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                                <time className="mt-2 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                            </div>
                            <button onClick={(e) => deleteOne(item.notificationId, e)}
                                className="h-9 w-9 rounded-lg text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                aria-label={`Xóa ${item.title}`}><span className="material-symbols-outlined text-lg">delete</span></button>
                        </article>
                    ))}
                    <Pagination currentPage={page} totalItems={data.totalItems} itemsPerPage={PAGE_SIZE}
                        onPageChange={setPage} label="thông báo" />
                </section>
            </main>
        </div>
    );
};

export default Notifications;
