import React, { FC, useEffect, useState } from 'react';
import type { Notification } from '../types';

// Icons
const BellIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

const GiftIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
);

const TagIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);

const InfoIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const ClockIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

interface NotificationScreenProps {
  texts: any;
  notifications: Notification[];
  onRead: () => void;
}

const NotificationItem: FC<{ notification: Notification, isNew: boolean, index: number }> = ({ notification, isNew, index }) => {
    
    let Icon = InfoIcon;
    let lightColorClass = "bg-blue-50 dark:bg-blue-900/20";
    let textColorClass = "text-blue-600 dark:text-blue-400";
    let accentBorderClass = "bg-blue-500";

    if (notification.type === 'bonus') {
        Icon = GiftIcon;
        lightColorClass = "bg-amber-50 dark:bg-amber-900/20";
        textColorClass = "text-amber-600 dark:text-amber-400";
        accentBorderClass = "bg-amber-500";
    } else if (notification.type === 'offer') {
        Icon = TagIcon;
        lightColorClass = "bg-purple-50 dark:bg-purple-900/20";
        textColorClass = "text-purple-600 dark:text-purple-400";
        accentBorderClass = "bg-purple-500";
    } else if (notification.type === 'system') {
        Icon = InfoIcon;
        lightColorClass = "bg-gray-100 dark:bg-gray-800";
        textColorClass = "text-gray-600 dark:text-gray-400";
        accentBorderClass = "bg-gray-500";
    }

    return (
        <div 
            className={`
                group relative flex gap-4 p-5 rounded-2xl transition-all duration-300
                bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800
                hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5
                opacity-0 animate-smart-slide-up overflow-hidden
            `}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {isNew && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBorderClass}`}></div>
            )}

            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${lightColorClass} ${textColorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-3 mb-1.5">
                    <h3 className={`text-base font-bold truncate ${isNew ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                    </h3>
                    {isNew && (
                        <span className="shrink-0 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/50 tracking-wide uppercase shadow-sm">
                            NEW
                        </span>
                    )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {notification.message}
                </p>
                
                <div className="flex items-center">
                    <div className="flex items-center text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-md">
                        <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                            {new Date(notification.timestamp).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationScreen: FC<NotificationScreenProps> = ({ texts, notifications, onRead }) => {
    const [lastReadTime] = useState<number>(() => {
        return Number(localStorage.getItem('lastReadTimestamp') || 0);
    });

    useEffect(() => {
        return () => {
            onRead();
        };
    }, []);

    return (
        <div className="p-4 pb-24 min-h-screen bg-gray-50/50 dark:bg-transparent animate-smart-fade-in">
            <div className="max-w-md mx-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-smart-pop-in">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                             <BellIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{texts.noNotifications}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                            We'll notify you when we have something for you.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 mt-2">
                        {notifications.map((notif, index) => (
                            <NotificationItem 
                                key={notif.id} 
                                notification={notif} 
                                isNew={notif.timestamp > lastReadTime}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationScreen;