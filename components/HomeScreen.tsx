import React, { useState, useRef, useEffect, FC } from 'react';
import type { User, DiamondOffer, LevelUpPackage, Membership, GenericOffer, PremiumApp, Screen, AppVisibility, AdUnit } from '../types';
import PurchaseModal from './PurchaseModal';
import { db } from '../firebase';
import { ref, push, update, get } from 'firebase/database';
import AdRenderer from './AdRenderer';

interface HomeScreenProps {
  user: User;
  texts: any;
  onPurchase: (price: number) => void;
  diamondOffers: DiamondOffer[];
  levelUpPackages: LevelUpPackage[];
  memberships: Membership[];
  premiumApps: PremiumApp[];
  onNavigate: (screen: Screen) => void;
  bannerImages: string[];
  visibility?: AppVisibility;
  adUnits?: AdUnit[];
}

const DiamondIcon: FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2z" />
    </svg>
);
const StarIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const IdCardIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="9" x2="10" y2="9"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="9" x2="18" y2="9"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="14" y1="15" x2="18" y2="15"/></svg>);
const CrownIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>);


const BannerCarousel: FC<{ images: string[] }> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = window.setTimeout(
            () =>
                setCurrentIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                ),
            3000 // Change slide every 3 seconds
        );

        return () => {
            resetTimeout();
        };
    }, [currentIndex, images.length]);

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    if (images.length === 0) return null;

    return (
        <div className="relative h-40 w-full overflow-hidden rounded-2xl shadow-lg mb-4">
            {images.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    alt={`Banner ${index + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                        currentIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};


const PackageCard: FC<{ name: string; price: number; texts: any; onBuy: () => void; icon: FC<{className?: string}>; description?: string; isPremium?: boolean }> = ({ name, price, texts, onBuy, icon: Icon, description, isPremium }) => (
    <div className={`bg-light-card dark:bg-dark-card rounded-2xl shadow-md p-3 flex flex-col items-center justify-between transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 border border-transparent dark:border-gray-800 text-center relative overflow-hidden ${isPremium ? 'border-primary/30 shadow-lg shadow-primary/10' : 'hover:border-primary/50'}`}>
        
        {isPremium && (
            <div className="absolute -right-5 top-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold px-6 py-1 rotate-45 shadow-sm">
                PREMIUM
            </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[8rem]">
            <Icon className={`w-14 h-14 mb-1 ${isPremium ? 'text-yellow-500 drop-shadow-sm' : 'text-primary'}`}/>
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text tracking-tight mt-2 leading-tight">
                {name}
            </h3>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{description}</p>}
        </div>
        
        <div className="w-full mt-3 flex flex-col items-center">
             <p className="text-lg font-bold text-primary mb-2">{texts.currency}{price}</p>
            <button
              onClick={onBuy}
              className={`w-full text-white font-bold py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg ${isPremium ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/30' : 'bg-gradient-to-r from-primary to-secondary shadow-primary/30'}`}
            >
              {texts.buyNow}
            </button>
        </div>
  </div>
);

const HomeScreen: FC<HomeScreenProps> = ({ user, texts, onPurchase, diamondOffers, levelUpPackages, memberships, premiumApps, onNavigate, bannerImages, visibility, adUnits }) => {
  const [selectedOffer, setSelectedOffer] = useState<GenericOffer | null>(null);
  const [activeTab, setActiveTab] = useState('');

  // Default to true if not provided (backward compatibility)
  const showDiamond = visibility?.diamonds ?? true;
  const showLevelUp = visibility?.levelUp ?? true;
  const showMembership = visibility?.membership ?? true;
  const showPremium = visibility?.premium ?? true;

  const visibleTabs = [
      { id: 'diamonds', label: texts.diamondOffers, visible: showDiamond },
      { id: 'level-up', label: texts.levelUpPackages, visible: showLevelUp },
      { id: 'memberships', label: texts.memberships, visible: showMembership },
      { id: 'premium-apps', label: texts.premiumApps, visible: showPremium && premiumApps && premiumApps.length > 0 },
  ].filter(t => t.visible);

  // Filter Active Ads
  const activeAd = adUnits && adUnits.length > 0 ? adUnits.find(ad => ad.active) : null;

  // Set initial active tab based on visibility
  useEffect(() => {
      if (visibleTabs.length > 0) {
          // If current active tab is not in visible list, switch to first visible
          const isActiveVisible = visibleTabs.find(t => t.id === activeTab);
          if (!isActiveVisible) {
              setActiveTab(visibleTabs[0].id);
          }
      } else {
          setActiveTab('');
      }
  }, [visibleTabs.length, activeTab, visibility]); // Re-run when visibility changes

  const handleBuyClick = (offer: GenericOffer) => {
    setSelectedOffer(offer);
  };

  const handleCloseModal = () => {
    setSelectedOffer(null);
  };
  
  const handleConfirmPurchase = async (identifier: string) => {
    if (!selectedOffer || !user.uid) return;
    
    const userRef = ref(db, 'users/' + user.uid);
    const orderRef = ref(db, 'orders/' + user.uid);

    try {
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        
        if (userData && userData.balance >= selectedOffer.price) {
             const newBalance = userData.balance - selectedOffer.price;

             // 1. Update Balance
             await update(userRef, { balance: newBalance });

             const orderId = Math.floor(10000000 + Math.random() * 90000000).toString();

             // 2. Prepare a clean offer object for Firebase
             const offerForDB = {
                 id: selectedOffer.id,
                 name: selectedOffer.name,
                 price: selectedOffer.price,
                 diamonds: selectedOffer.diamonds || 0,
             };

             // 3. Save Order
             await push(orderRef, {
                 uid: identifier, 
                 offer: offerForDB,
                 price: selectedOffer.price,
                 status: 'Pending',
                 date: new Date().toISOString(),
                 id: orderId 
             });

             onPurchase(selectedOffer.price);
        } else {
            console.error("Insufficient balance");
        }
    } catch (error) {
        console.error("Purchase failed", error);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'diamonds':
            return diamondOffers.map((offer, index) => (
              <div
                key={offer.id}
                className="opacity-0 animate-smart-slide-down"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                  <PackageCard 
                    name={`${offer.diamonds}`}
                    description="Diamonds"
                    price={offer.price}
                    texts={texts}
                    icon={DiamondIcon}
                    onBuy={() => handleBuyClick({id: offer.id, name: `${offer.diamonds} Diamonds`, price: offer.price, icon: DiamondIcon, diamonds: offer.diamonds, inputType: 'uid'})} 
                  />
              </div>
            ));
        case 'level-up':
            return levelUpPackages.map((pkg, index) => (
                 <div
                    key={pkg.id}
                    className="opacity-0 animate-smart-slide-down"
                    style={{ animationDelay: `${index * 120}ms` }}
                >
                    <PackageCard 
                        name={texts[pkg.name] || pkg.name}
                        price={pkg.price}
                        texts={texts}
                        icon={StarIcon}
                        onBuy={() => handleBuyClick({id: pkg.id, name: texts[pkg.name] || pkg.name, price: pkg.price, icon: StarIcon, inputType: 'uid'})} 
                    />
                </div>
            ));
        case 'memberships':
            return memberships.map((mem, index) => (
                <div
                    key={mem.id}
                    className="opacity-0 animate-smart-slide-down"
                    style={{ animationDelay: `${index * 120}ms` }}
                >
                    <PackageCard 
                        name={texts[mem.name] || mem.name}
                        price={mem.price}
                        texts={texts}
                        icon={IdCardIcon}
                        onBuy={() => handleBuyClick({id: mem.id, name: texts[mem.name] || mem.name, price: mem.price, icon: IdCardIcon, inputType: 'uid'})} 
                    />
                </div>
            ));
        case 'premium-apps':
            return premiumApps.map((app, index) => (
                <div
                    key={app.id}
                    className="opacity-0 animate-smart-slide-down"
                    style={{ animationDelay: `${index * 120}ms` }}
                >
                    <PackageCard 
                        name={app.name}
                        description={app.description}
                        price={app.price}
                        texts={texts}
                        icon={CrownIcon}
                        isPremium={true}
                        onBuy={() => handleBuyClick({id: app.id, name: app.name, price: app.price, icon: CrownIcon, inputType: 'email'})} 
                    />
                </div>
            ));
        default:
            return null;
    }
  };


  return (
    <div>
      <main className="p-4">
        <div className="opacity-0 animate-smart-slide-down" style={{ animationDelay: '100ms' }}>
            <BannerCarousel images={bannerImages} />
        </div>

        {/* --- AD DISPLAY SECTION --- */}
        {activeAd && (
            <div className="animate-fade-in mb-4 flex justify-center">
                <AdRenderer code={activeAd.code} />
            </div>
        )}
        
        {visibleTabs.length > 0 ? (
            <>
                <div className="my-4 opacity-0 animate-smart-slide-down" style={{ animationDelay: '200ms' }}>
                    <div className={`${visibleTabs.length > 3 
                            ? 'flex gap-2 overflow-x-auto scrollbar-hide snap-x py-1' 
                            : 'flex gap-2 justify-between py-1'
                        }`}>
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={visibleTabs.length > 3 ? { minWidth: 'calc((100% - 1rem) / 3)', width: 'calc((100% - 1rem) / 3)' } : {}}
                                className={`
                                    ${visibleTabs.length <= 3 ? 'flex-1' : 'snap-start'}
                                    px-1 py-3 rounded-xl font-bold uppercase text-[10px] sm:text-xs transition-all duration-300 border-2 shadow-sm
                                    whitespace-nowrap overflow-hidden text-ellipsis
                                    ${activeTab === tab.id 
                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' 
                                        : 'bg-light-card dark:bg-dark-card text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary dark:hover:text-primary'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="animate-smart-fade-in" style={{ animationDelay: '300ms' }}>
                    {renderContent() ? (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 items-start">
                            {renderContent()}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">{texts.noOffersFound}</p>
                    )}
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center py-10 animate-smart-fade-in">
                <p className="text-center text-gray-500 dark:text-gray-400">{texts.noOffersFound}</p>
            </div>
        )}
      </main>
      {selectedOffer && (
        <PurchaseModal 
          offer={selectedOffer} 
          onClose={handleCloseModal} 
          onConfirm={handleConfirmPurchase}
          onSuccess={() => {
              handleCloseModal();
              onNavigate('myOrders');
          }}
          texts={texts}
          userBalance={user.balance}
          defaultUid={user.playerUid}
        />
      )}
    </div>
  );
};

export default HomeScreen;