import React, { useState } from 'react';
import { Star, MessageSquare, Lightbulb, Send } from 'lucide-react';

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [feedback, setFeedback] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ rating, suggestion, feedback });
        alert('Thank you for your feedback!');
        setRating(0);
        setSuggestion('');
        setFeedback('');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-civic-800">We Value Your Feedback</h1>
                <p className="text-slate-600">Help us improve CivicFix for everyone.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating Section */}
                        <div className="space-y-4 text-center">
                            <label className="block text-sm font-medium text-slate-700">
                                How would you rate your experience?
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= (hoveredStar || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300'
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 min-h-[20px]">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent!"}
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Suggestion Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-civic-700">
                                <Lightbulb size={20} />
                                <h3 className="font-semibold">Have a Suggestion?</h3>
                            </div>
                            <textarea
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                placeholder="What features would you like to see?"
                                className="w-full h-32 px-4 py-3 rounded-lg border border-slate-300 focus:border-civic-500 focus:ring-2 focus:ring-civic-200 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* General Feedback Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-civic-700">
                                <MessageSquare size={20} />
                                <h3 className="font-semibold">General Feedback</h3>
                            </div>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell us about your experience..."
                                className="w-full h-32 px-4 py-3 rounded-lg border border-slate-300 focus:border-civic-500 focus:ring-2 focus:ring-civic-200 outline-none transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-civic-600 hover:bg-civic-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-civic-600/20"
                        >
                            <Send size={20} />
                            Submit Feedback
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
