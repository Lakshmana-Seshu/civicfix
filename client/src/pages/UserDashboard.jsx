import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Search, MapPin, ThumbsUp, Radio, LayoutGrid, List, Filter, Bell, MessageSquare, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my_reports'); // 'my_reports' | 'community'
    const [myTicketIds, setMyTicketIds] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    useEffect(() => {
        // Load my ticket IDs from local storage
        const storedIds = JSON.parse(localStorage.getItem('civic_my_tickets') || '[]');
        setMyTicketIds(storedIds);

        const fetchTickets = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets`);
                setTickets(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching tickets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const myReports = tickets.filter(t => myTicketIds.includes(t._id || t.ticketId));
    const communityReports = tickets.filter(t => !myTicketIds.includes(t._id || t.ticketId));
    const displayedTickets = activeTab === 'my_reports' ? myReports : communityReports;

    // Stats Calculation
    const totalReports = myReports.length;
    const resolvedReports = myReports.filter(t => t.status === 'Resolved').length;
    const inProgressReports = myReports.filter(t => t.status === 'In Progress').length;
    const pendingReports = myReports.filter(t => t.status === 'Open').length;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-civic-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your reports and civic issues.</p>
                </div>
                <button
                    onClick={() => navigate('/report')}
                    className="bg-civic-600 hover:bg-civic-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg shadow-civic-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Radio size={18} />
                    Report New Issue
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Reports"
                    value={totalReports}
                    icon={<List size={20} />}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    label="Resolved"
                    value={resolvedReports}
                    icon={<CheckCircle2 size={20} />}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    label="In Progress"
                    value={inProgressReports}
                    icon={<Clock size={20} />}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    label="Pending"
                    value={pendingReports}
                    icon={<AlertTriangle size={20} />}
                    color="bg-slate-100 text-slate-600"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs & Filters */}
                <div className="border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="flex p-1 bg-slate-200/60 rounded-lg w-full md:w-auto">
                        <TabButton
                            active={activeTab === 'my_reports'}
                            onClick={() => setActiveTab('my_reports')}
                            label={`My Reports (${totalReports})`}
                        />
                        <TabButton
                            active={activeTab === 'community'}
                            onClick={() => setActiveTab('community')}
                            label="Community Feed"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-civic-500 focus:border-civic-500 bg-white"
                            />
                        </div>
                        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid/List */}
                <div className="p-6 min-h-[400px]">
                    {displayedTickets.length === 0 ? (
                        <EmptyState
                            type={activeTab}
                            onAction={() => navigate('/report')}
                        />
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {displayedTickets.map(ticket => (
                                <TicketCard
                                    key={ticket._id}
                                    ticket={ticket}
                                    viewMode={viewMode}
                                    onClick={() => navigate(`/reports/${ticket._id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${active
                ? 'bg-white text-civic-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
    >
        {label}
    </button>
);

const EmptyState = ({ type, onAction }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Radio size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {type === 'my_reports' ? "No reports yet" : "Quiet in the neighborhood"}
        </h3>
        <p className="text-slate-500 max-w-sm mb-8">
            {type === 'my_reports'
                ? "You haven't submitted any civic issues yet. Be the first to report something in your area!"
                : "There are no community reports to display right now."}
        </p>
        {type === 'my_reports' && (
            <button
                onClick={onAction}
                className="text-civic-600 font-semibold hover:text-civic-700 flex items-center gap-2 hover:gap-3 transition-all"
            >
                Start a Report <ArrowRight size={18} />
            </button>
        )}
    </div>
);

const TicketCard = ({ ticket, viewMode, onClick }) => {
    const isList = viewMode === 'list';

    return (
        <div
            onClick={onClick}
            className={`
                group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-civic-200
                ${isList ? 'flex gap-4 p-4 items-center' : 'flex flex-col'}
            `}
        >
            <div className={`
                relative overflow-hidden bg-slate-100
                ${isList ? 'w-24 h-24 rounded-lg flex-shrink-0' : 'h-48 w-full'}
            `}>
                <img
                    src={ticket.imageUrl}
                    alt="Issue"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!isList && (
                    <div className="absolute top-3 right-3">
                        <StatusBadge status={ticket.status} />
                    </div>
                )}
            </div>

            <div className={`flex-1 ${isList ? '' : 'p-4'}`}>
                {isList && (
                    <div className="mb-2 flex justify-between">
                        <StatusBadge status={ticket.status} />
                        <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-civic-600 transition-colors">
                        {ticket.aiAnalysis?.issueType || "Reported Issue"}
                    </h3>
                    {!isList && <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>}
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {ticket.userDescription || ticket.aiAnalysis?.issueDescription || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{ticket.location?.address?.split(',')[0] || "Location"}</span>
                    </div>
                    {(ticket.upvotes > 0) && (
                        <div className="flex items-center gap-1 text-civic-600 font-medium bg-civic-50 px-2 py-0.5 rounded-md">
                            <ThumbsUp size={12} /> {ticket.upvotes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Resolved': 'bg-green-100 text-green-700 border-green-200',
        'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
        'Open': 'bg-blue-100 text-blue-700 border-blue-200',
        'Duplicate': 'bg-slate-100 text-slate-600 border-slate-200'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles['Open']} shadow-sm`}>
            {status}
        </span>
    );
};

export default UserDashboard;
