import React, { FC, useEffect, useState } from 'react';

interface RewardAnimationProps {
    amount: number;
    texts: any;
    onAnimationEnd: () => void;
}

const RewardAnimation: FC<RewardAnimationProps> = ({ amount, texts, onAnimationEnd }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // SLOWED DOWN TIMING
        // Start exit animation after 4 seconds (was 2.2s)
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 4000);

        // Actual unmount callback after 4.5 seconds (was 2.6s)
        const endTimer = setTimeout(() => {
            onAnimationEnd();
        }, 4500);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(endTimer);
        };
    }, [onAnimationEnd]);

    // Lightweight CSS particles for the burst effect
    // Colors: Gold, Violet, Pink (App Theme)
    const particleColors = ['#FBBF24', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    const particles = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        return {
            id: i,
            color: particleColors[i % particleColors.length],
            style: {
                '--angle': `${angle}deg`,
                '--color': particleColors[i % particleColors.length],
                animationDelay: '0.2s' // Delayed start for particles
            } as React.CSSProperties
        };
    });

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ease-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            
            {/* Screen Edge Light Effect - Hardware Accelerated */}
            <div 
                className="absolute inset-0 pointer-events-none z-[101] edge-lighting"
                style={{ transform: 'translateZ(0)' }} 
            ></div>

            {/* Dark Backdrop with Blur */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>

            <style>{`
                @keyframes scaleUpElasticSlow {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes checkDrawSlow {
                    0% { stroke-dashoffset: 50; }
                    100% { stroke-dashoffset: 0; }
                }

                @keyframes glowPulseSlow {
                    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
                    50% { box-shadow: 0 0 0 25px rgba(245, 158, 11, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }

                @keyframes slideUpFadeSlow {
                    0% { transform: translateY(30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }

                @keyframes particleBurstSlow {
                    0% { transform: rotate(var(--angle)) translateY(0px) scale(1); opacity: 1; background-color: var(--color); }
                    100% { transform: rotate(var(--angle)) translateY(120px) scale(0); opacity: 0; background-color: var(--color); }
                }

                @keyframes edgePulse {
                    0% { box-shadow: inset 0 0 0px 0px rgba(245, 158, 11, 0); opacity: 0; }
                    20% { box-shadow: inset 0 0 60px 10px rgba(245, 158, 11, 0.5); opacity: 1; }
                    80% { box-shadow: inset 0 0 60px 10px rgba(139, 92, 246, 0.4); opacity: 1; }
                    100% { box-shadow: inset 0 0 0px 0px rgba(245, 158, 11, 0); opacity: 0; }
                }

                .edge-lighting {
                    animation: edgePulse 4s ease-in-out forwards;
                    border-radius: 0px; 
                    will-change: box-shadow, opacity; /* Optimization for mobile */
                }

                .success-circle {
                    width: 100px;
                    height: 100px;
                    /* Premium Gold Gradient */
                    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 40px -5px rgba(245, 158, 11, 0.6);
                    position: relative;
                    z-index: 10;
                    border: 4px solid rgba(255,255,255,0.15);
                    will-change: transform;
                }

                .success-circle::before {
                    content: '';
                    position: absolute;
                    inset: -5px;
                    border-radius: 50%;
                    background: rgba(245, 158, 11, 0.2);
                    z-index: -1;
                    animation: glowPulseSlow 3s infinite ease-out;
                    will-change: box-shadow;
                }

                .particle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    transform-origin: center;
                    animation: particleBurstSlow 1.2s ease-out forwards;
                    will-change: transform, opacity;
                }
            `}</style>

            <div className="relative z-10 flex flex-col items-center animate-[scaleUpElasticSlow_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                
                {/* Particle Burst Container */}
                <div className="absolute inset-0 pointer-events-none">
                    {particles.map(p => (
                        <div key={p.id} className="particle" style={p.style}></div>
                    ))}
                </div>

                {/* Main Icon */}
                <div className="success-circle mb-8">
                    <svg className="w-14 h-14 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7" 
                            style={{ 
                                strokeDasharray: 50, 
                                strokeDashoffset: 50,
                                animation: 'checkDrawSlow 0.8s 0.3s ease-out forwards'
                            }}
                        />
                    </svg>
                </div>

                {/* Text Content */}
                <div className="text-center animate-[slideUpFadeSlow_0.8s_0.4s_ease-out_forwards] opacity-0">
                    <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                        +{texts.currency}{amount}
                    </h2>
                    <div className="mt-6">
                        <div className="bg-gradient-to-r from-violet-600/90 to-pink-600/90 border border-white/20 rounded-full px-8 py-2.5 backdrop-blur-xl shadow-2xl inline-block">
                            <p className="text-sm font-bold text-white tracking-[0.25em] uppercase drop-shadow-sm">
                                {texts.rewardAdded || "ADDED TO WALLET"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardAnimation;