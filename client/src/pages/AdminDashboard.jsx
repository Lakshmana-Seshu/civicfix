import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiMode } from '../context/UiModeContext';
import axios from 'axios';
import { Loader2, Map, AlertTriangle, CheckCircle2, Clock, ThumbsUp, ArrowRight } from 'lucide-react';
import PriorityHeatmap from '../components/PriorityHeatmap';

const AdminDashboard = () => {
    const { uiMode } = useUiMode();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (uiMode !== 'admin') {
            navigate('/');
            return;
        }

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
    }, [uiMode, navigate]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-civic-600" /></div>;

    const highPriority = tickets.filter(t => t.aiAnalysis?.severity === 'High');
    const recentTickets = tickets;

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">City Admin Dashboard</h2>
                    <div className="flex gap-2">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            Total: {tickets.length}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            Open: {tickets.filter(t => t.status === 'Open').length}
                        </span>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            In Progress: {tickets.filter(t => t.status === 'In Progress').length}
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            Resolved: {tickets.filter(t => t.status === 'Resolved').length}
                        </span>
                    </div>
                </div>

                {/* High Urgency Notification Panel */}
                {tickets.some(t => (t.upvotes || 0) > 5 && t.status === 'Open') && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                            <AlertTriangle className="animate-pulse" size={20} /> High Urgency Alerts
                        </h3>
                        <div className="space-y-2">
                            {tickets.filter(t => (t.upvotes || 0) > 5 && t.status === 'Open').map(ticket => (
                                <div key={ticket._id} onClick={() => navigate(`/admin/reports/${ticket._id}`)} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex justify-between items-center cursor-pointer hover:bg-red-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 text-red-600 p-2 rounded-lg font-bold">
                                            {ticket.upvotes} Reports
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{ticket.aiAnalysis?.issueType || "Reported Issue"}</p>
                                            <p className="text-sm text-slate-500">{ticket.location?.address || "Location unavailable"}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-red-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Heatmap Placeholder */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Map size={18} /> Priority Heatmap</h3>
                    <span className="text-xs text-slate-400">Live Updates</span>
                </div>
                <div className="aspect-[3/1] bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <PriorityHeatmap tickets={tickets.filter(t => t.status !== 'Resolved')} />
                </div>
            </div>

            {/* Kanban / List View */}
            {/* Kanban / List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Open / New Column */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> New Reports
                    </h4>
                    <div className="space-y-3">
                        {tickets.filter(t => t.status === 'Open').map(ticket => (
                            <div key={ticket._id} onClick={() => navigate(`/admin/reports/${ticket._id}`)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${ticket.aiAnalysis?.severity === 'High' ? 'bg-red-50 text-red-600' :
                                        ticket.aiAnalysis?.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                        {ticket.aiAnalysis?.severity || 'Unknown'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h5 className="font-medium text-slate-900 text-sm mb-1 line-clamp-1">{ticket.aiAnalysis?.issueType || 'Unspecified Issue'}</h5>
                                <p className="text-xs text-slate-500 line-clamp-2">{ticket.userDescription || ticket.aiAnalysis?.issueDescription || 'No description available'}</p>
                                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} />
                                        <span>Due: {ticket.sla?.expectedResolutionDate ? new Date(ticket.sla.expectedResolutionDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    {(ticket.upvotes > 0) && (
                                        <div className="flex items-center gap-1 text-xs text-civic-600 bg-civic-50 px-1.5 py-0.5 rounded font-medium">
                                            <ThumbsUp size={10} /> {ticket.upvotes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {tickets.filter(t => t.status === 'Open').length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">No open reports</p>
                        )}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> In Progress
                    </h4>
                    <div className="space-y-3">
                        {tickets.filter(t => t.status === 'In Progress').map(ticket => (
                            <div key={ticket._id} onClick={() => navigate(`/admin/reports/${ticket._id}`)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-90 hover:opacity-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-amber-50 text-amber-600">
                                        Processing
                                    </span>
                                    <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h5 className="font-medium text-slate-900 text-sm mb-1 line-clamp-1">{ticket.aiAnalysis?.issueType || ticket.title}</h5>
                                <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                                    <span className="font-semibold">Dept:</span> {ticket.department?.name}
                                </p>
                                {(ticket.upvotes > 0) && (
                                    <div className="mt-1 flex justify-end">
                                        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                            <ThumbsUp size={10} /> {ticket.upvotes} Citizens Reported
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {tickets.filter(t => t.status === 'In Progress').length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">No active tasks</p>
                        )}
                    </div>
                </div>

                {/* Resolved Column */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved
                    </h4>
                    <div className="space-y-3">
                        {tickets.filter(t => t.status === 'Resolved').map(ticket => (
                            <div key={ticket._id} onClick={() => navigate(`/admin/reports/${ticket._id}`)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer grayscale hover:grayscale-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-green-50 text-green-600 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Done
                                    </span>
                                    <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h5 className="font-medium text-slate-900 text-sm mb-1 line-clamp-1">{ticket.aiAnalysis?.issueType || ticket.title}</h5>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-slate-500">Resolved</p>
                                    {(ticket.upvotes > 0) && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            <ThumbsUp size={10} /> {ticket.upvotes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {tickets.filter(t => t.status === 'Resolved').length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">No resolved tickets yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
