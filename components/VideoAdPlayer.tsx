import React, { useRef, useState, useEffect, FC } from 'react';

interface VideoAdPlayerProps {
    videoUrl: string;
    onComplete: () => void;
    onClose: () => void;
    duration?: number; // Required if not a video file
}

const XIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const VideoAdPlayer: FC<VideoAdPlayerProps> = ({ videoUrl, onComplete, onClose, duration = 15 }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [canSkip, setCanSkip] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isIframe, setIsIframe] = useState(false);

    useEffect(() => {
        // Determine if URL is a video file
        const isVideoFile = videoUrl.match(/\.(mp4|webm|ogg)$/i);
        setIsIframe(!isVideoFile);

        if (!isVideoFile) {
            // IFRAME LOGIC
            setLoading(false);
            setTimeLeft(duration);
            
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timer);
                        setCanSkip(true);
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }

        // VIDEO LOGIC (handled by video events below)
        return () => {};
    }, [videoUrl, duration, onComplete]);

    // Video Event Handlers
    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            const remaining = Math.ceil(videoRef.current.duration - videoRef.current.currentTime);
            setTimeLeft(remaining);
        }
    };

    const handleEnded = () => {
        setCanSkip(true);
        onComplete();
    };

    const handleVideoLoaded = () => {
        setLoading(false);
        if (videoRef.current?.duration) {
            setTimeLeft(Math.ceil(videoRef.current.duration));
        }
        videoRef.current?.play().catch(err => console.log("Autoplay blocked", err));
    };

    const handleCloseAttempt = () => {
        if (canSkip) {
            onClose();
        } else {
            if (confirm("If you close the ad now, you won't get the reward. Are you sure?")) {
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-center items-center">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="bg-black/60 px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-lg">
                    {canSkip ? "Reward Granted" : `Reward in: ${timeLeft !== null ? timeLeft : '...'}s`}
                </div>
                <button 
                    onClick={handleCloseAttempt} 
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors pointer-events-auto"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content Area */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-2"></div>
                        Loading Ad...
                    </div>
                )}

                {isIframe ? (
                    <iframe 
                        src={videoUrl} 
                        title="Ad Content"
                        className="w-full h-full bg-white border-none"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                ) : (
                    <video 
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        playsInline
                        disablePictureInPicture
                        controlsList="nodownload noremoteplayback noplaybackrate"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onLoadedData={handleVideoLoaded}
                    />
                )}
            </div>

            {/* Bottom Overlay (for Video only) */}
            {!isIframe && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center z-10 pointer-events-none">
                    <p className="text-white/80 text-xs mb-2">Advertisement</p>
                </div>
            )}
        </div>
    );
};

export default VideoAdPlayer;