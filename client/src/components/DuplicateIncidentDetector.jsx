import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, ThumbsUp, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DuplicateIncidentDetector = ({ description, location, onCheckComplete, reporter }) => {
    const [isChecking, setIsChecking] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState(null);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const navigate = useNavigate();

    // Debounce check logic (run when description is substantial and location is set)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (description && description.length > 20 && location?.lat && !hasUpvoted) {
                checkDuplicate();
            }
        }, 2000); // 2-second debounce to avoid spamming while typing

        return () => clearTimeout(timer);
    }, [description, location, hasUpvoted]);

    const checkDuplicate = async () => {
        setIsChecking(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/check-duplicate`, {
                description,
                lat: location.lat,
                lng: location.lng
            });

            if (res.data.isDuplicate && !hasUpvoted) {
                // Auto-Upvote immediately
                await handleAutoUpvote(res.data);
            }
        } catch (error) {
            console.error("Duplicate check failed", error);
        } finally {
            setIsChecking(false);
            if (onCheckComplete) onCheckComplete();
        }
    };

    const handleAutoUpvote = async (data) => {
        if (!data?.duplicateTicketId || hasUpvoted) return;

        // Optimistically set upvoted to prevent double submission
        setHasUpvoted(true);

        try {
            console.log("Auto-upvoting ticket:", data.duplicateTicketId, "Reporter:", reporter);
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/${data.duplicateTicketId}/upvote`, {
                name: reporter?.name,
                contact: reporter?.contact,
                email: reporter?.email
            });
            // Set result to show popup
            setDuplicateResult(data);
        } catch (error) {
            console.error("Auto-upvote failed", error);
            // Revert state if failed
            setHasUpvoted(false);
        }
    };

    if (!duplicateResult) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95 text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full text-green-600 w-16 h-16 flex items-center justify-center mb-4">
                    <ThumbsUp size={32} />
                </div>

                <h3 className="text-xl font-bold text-slate-800">Issue Already Reported!</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                    We found a similar issue nearby and have automatically upvoted it for you.
                </p>

                {duplicateResult.expectedResolutionDate && (
                    <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Expected Resolution</p>
                        <p className="text-lg font-bold text-slate-800">
                            {new Date(duplicateResult.expectedResolutionDate).toLocaleDateString(undefined, {
                                weekday: 'short', month: 'short', day: 'numeric'
                            })}
                        </p>
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="mt-6 w-full bg-civic-600 hover:bg-civic-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-civic-500/20"
                >
                    Okay, Got it
                </button>
            </div>
        </div>
    );
};

export default DuplicateIncidentDetector;
