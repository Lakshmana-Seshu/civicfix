import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, ArrowRight, CheckCircle2, AlertTriangle, Building2, MapPin } from 'lucide-react';

const SmartDepartmentRouter = ({ description, location, onAnalysisComplete }) => {
    const [routingData, setRoutingData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounce analysis
    useEffect(() => {
        const timer = setTimeout(() => {
            if (description && description.length > 10) {
                analyze();
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [description, location]);

    const analyze = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/routing/analyze`, {
                text: description,
                lat: location?.lat,
                lng: location?.lng
            });
            if (res.data.success) {
                setRoutingData(res.data.data);
                if (onAnalysisComplete) {
                    onAnalysisComplete(res.data.data);
                }
            }
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Headless component - logic only
    if (!description || description.length <= 10) return null;
    if (loading) return null;
    if (!routingData) return null;

    return null;
};

const WandIcon = ({ className, size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8 19 13" />
        <path d="M15 9h0" />
        <path d="M17.8 6.2 19 5" />
        <path d="m3 21 9-9" />
        <path d="M12.2 6.2 11 5" />
    </svg>
);

export default SmartDepartmentRouter;
