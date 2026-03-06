import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Building2, Target, Users, Shield, FileCheck, Phone, Mail, MapPin, ArrowUpRight, Menu, X, Sparkles, Building, Download } from 'lucide-react';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LandingCarousel from './components/LandingCarousel';
import AboutSection from './components/AboutSection';
import GallerySection from './components/GallerySection';
import MembersSection from './components/MembersSection';
import CarouselManager from './pages/admin/CarouselManager';
import GalleryManager from './pages/admin/GalleryManager';
import MemberManager from './pages/admin/MemberManager';
import UserManager from './pages/admin/UserManager';
import AdManager from './pages/admin/AdManager';
import SettingsManager from './pages/admin/SettingsManager';
import CompanyMarquee from './components/CompanyMarquee';
import AdSection from './components/AdSection';
import LeadModal from './components/LeadModal';
import RegistrationModal from './components/RegistrationModal';
import NewsTicker from './components/NewsTicker';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';
import { generateCertificate } from './utils/certificateUtils';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import { db } from './lib/firebase';
import FeedbackModal from './components/FeedbackModal';
import PolicyPage from './pages/PolicyPage';
import SplashScreen from './components/SplashScreen';
import { Language, translations } from './utils/translations';
import LanguageSwitcher from './components/LanguageSwitcher';

const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any } }
};

function LandingPage() {
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState({ isOpen: false, type: 'success' as 'success' | 'error' | 'warning', title: '', message: '' });
  const [configData, setConfigData] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ap_arda_lang');
    return (saved as Language) || 'te';
  });

  const t = translations[lang];

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('ap_arda_lang', newLang);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configSnap = await getDocs(query(collection(db, 'settings')));
        configSnap.forEach((doc) => {
          if (doc.id === 'config') {
            setConfigData(doc.data());
          }
        });
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    fetchConfig();

    const checkMember = () => {
      const stored = localStorage.getItem('ap_arda_member_data');
      if (stored) {
        setMemberData(JSON.parse(stored));
      } else {
        setMemberData(null);
      }
    };

    checkMember();
    window.addEventListener('ap_arda_member_update', checkMember);
    window.addEventListener('storage', checkMember);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('ap_arda_member_update', checkMember);
      window.removeEventListener('storage', checkMember);
      clearTimeout(timer);
    };
  }, []);

  const handleDownloadCertificate = async () => {
    if (!memberData) return;

    setDownloading(true);
    let mid = '';

    try {
      // 1. Try Cache first, if it's a real ID
      if (memberData.membershipId && !memberData.membershipId.includes('PENDING')) {
        mid = memberData.membershipId;
      }

      // 2. No real ID in cache? Fetch latest from Firestore
      if (!mid && memberData.mobile) {
        const cleanMobile = memberData.mobile.replace(/\D/g, '');
        // Try both original and clean mobile to be safe
        const qOriginal = query(collection(db, 'partners'), where('mobile', '==', memberData.mobile));
        const qClean = query(collection(db, 'partners'), where('mobile', '==', cleanMobile));

        let snap = await getDocs(qOriginal);
        if (snap.empty && cleanMobile !== memberData.mobile) {
          snap = await getDocs(qClean);
        }

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          mid = docData.membershipId || '';
          console.log('Found ID in Firestore:', mid);
        } else {
          console.warn('No partner found for mobile:', memberData.mobile, cleanMobile);
        }
      }

      // 3. No ID in DB? Try generating it (if they paid/registered)
      if (!mid && memberData.mobile) {
        await runTransaction(db, async (transaction) => {
          const q = query(collection(db, 'partners'), where('mobile', '==', memberData.mobile));
          const snap = await getDocs(q);
          const partnerDoc = snap.empty ? null : snap.docs[0];
          const partnerRef = partnerDoc ? doc(db, 'partners', partnerDoc.id) : null;

          if (partnerDoc) {
            const counterRef = doc(db, 'settings', 'counters');
            const counterSnap = await transaction.get(counterRef);
            let sequence = 1;
            if (counterSnap.exists()) {
              sequence = (counterSnap.data().membershipSequence || 0) + 1;
            }

            const today = new Date();
            const ddmmyyyy = today.getDate().toString().padStart(2, '0') +
              (today.getMonth() + 1).toString().padStart(2, '0') +
              today.getFullYear();

            mid = `${ddmmyyyy}${sequence.toString().padStart(4, '0')}`;

            transaction.set(counterRef, { membershipSequence: sequence }, { merge: true });
            if (partnerRef) {
              transaction.update(partnerRef, {
                membershipId: mid,
                isRegistered: true,
                paymentStatus: 'success'
              });
            }
          }
        });
      }

      // 4. Final Fallback: use PENDING-ID if nothing found
      if (!mid) {
        mid = 'PENDING-ID';
      }

      // Update local storage for cache/visibility
      const updatedData = { ...memberData, membershipId: mid };
      localStorage.setItem('ap_arda_member_data', JSON.stringify(updatedData));
      setMemberData(updatedData);

      await generateCertificate({
        name: memberData.name,
        companyName: memberData.companyName,
        designation: memberData.designation || '',
        district: memberData.district || '',
        membershipId: mid,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      });

      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Download Successful',
        message: 'Your membership certificate has been generated and downloaded.'
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Download Failed',
        message: 'Unable to generate your certificate. Please contact support.'
      });
    } finally {
      setDownloading(false);
    }
  };



  return (
    <div className={cn(
      "relative min-h-screen bg-white font-inter selection:bg-blue-600 selection:text-white",
      showSplash ? "overflow-hidden h-screen" : ""
    )}>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      <LeadModal isRegistrationOpen={isRegOpen} />
      <RegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} />
      <FeedbackModal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />

      {/* Premium Glass Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[150] transition-all duration-500 px-3 md:px-6 py-3 md:py-4",
          isScrolled ? "py-1.5 md:py-2" : "py-4 md:py-6"
        )}
      >
        <div className={cn(
          "container mx-auto max-w-7xl rounded-xl md:rounded-[2rem] transition-all duration-500 px-3 md:px-8 py-2 md:py-3 flex items-center justify-between border border-white/10",
          isScrolled ? "glass-dark shadow-2xl" : "bg-black/20 backdrop-blur-md"
        )}>
          <div className="flex items-center gap-3 md:gap-4 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center p-2 backdrop-blur-md"
            >
              <img src="/image.png" alt="AP-ARDA Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className={cn(
                "text-base md:text-xl font-black tracking-tighter leading-none uppercase transition-colors whitespace-nowrap",
                isScrolled ? "text-gradient" : "text-white drop-shadow-lg"
              )}>AP-ARDA</h1>
              <p className={cn(
                "text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 transition-colors",
                isScrolled ? "text-accent" : "text-yellow-400 drop-shadow-md"
              )}>{t.header.subtitle}</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {[
              { label: t.nav.home, id: 'home' },
              { label: t.nav.activities, id: 'activities' },
              { label: t.nav.partners, id: 'partners' },
              { label: t.nav.team, id: 'team' },
              { label: t.nav.gallery, id: 'gallery' },
              { label: t.nav.contact, id: 'contact' }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "text-[12px] font-black uppercase tracking-[0.1em] transition-all relative group flex items-center",
                  lang === 'te' ? "font-telugu" : "",
                  isScrolled ? "text-blue-100 hover:text-yellow-400" : "text-white hover:text-yellow-400 drop-shadow-md"
                )}
              >
                <span className={lang === 'te' ? "telugu-nudge-down" : ""}>
                  {item.label}
                </span>
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-yellow-400 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher
                currentLang={lang}
                onLanguageChange={handleLanguageChange}
                isScrolled={isScrolled}
              />
            </div>
            {memberData ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadCertificate}
                className="bg-green-600 hover:bg-green-500 text-white font-black px-4 md:px-6 xl:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-600/20 flex items-center gap-2"
              >
                <span className="hidden sm:inline">{t.header.certificate}</span>
                <span className="sm:hidden">{lang === 'te' ? 'Certificate' : 'Certificate'}</span>
                <Download size={14} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRegOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-black px-4 md:px-6 xl:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-yellow-600/20 flex items-center gap-2"
              >
                <span className="hidden sm:inline">{t.header.join}</span>
                <span className="sm:hidden">Join</span>
                <ArrowUpRight size={14} />
              </motion.button>
            )}
            <button
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-4 right-4 mt-2 lg:hidden bg-blue-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-[200]"
            >
              <div className="mb-6 pb-6 border-b border-white/10 flex justify-center">
                <LanguageSwitcher
                  currentLang={lang}
                  onLanguageChange={handleLanguageChange}
                  isScrolled={true}
                />
              </div>
              <nav className="flex flex-col gap-6">
                {[
                  { label: t.nav.home, id: 'home' },
                  { label: t.nav.activities, id: 'activities' },
                  { label: t.nav.partners, id: 'partners' },
                  { label: t.nav.team, id: 'team' },
                  { label: t.nav.gallery, id: 'gallery' },
                  { label: t.nav.contact, id: 'contact' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-white text-sm font-black uppercase tracking-[0.2em] hover:text-yellow-500 transition-colors flex items-center",
                      lang === 'te' ? "font-telugu" : ""
                    )}
                  >
                    <span className={lang === 'te' ? "telugu-nudge-down" : ""}>
                      {item.label}
                    </span>
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative">
        <LandingCarousel currentLang={lang} />
      </section>

      <AboutSection currentLang={lang} />

      {/* Intro Section - Telugu Content with Premium Look */}
      <motion.section
        id="activities"
        {...fadeInUp}
        className="relative py-12 md:py-24 bg-slate-50 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-blue-600/5 blur-[80px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/5 blur-[80px] md:blur-[120px] rounded-full" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2 bg-blue-600/10 rounded-full text-blue-600 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] mb-8 md:mb-12 shadow-sm",
                lang === 'te' ? "font-telugu" : ""
              )}
            >
              <Sparkles size={14} />
              <span className={lang === 'te' ? "telugu-nudge-down" : ""}>
                {t.intro.badge}
              </span>
            </motion.div>
            <h2 className={cn(
              "text-3xl md:text-7xl font-black text-gray-900 mb-6 md:mb-10 leading-[1.2] md:leading-[1.1] tracking-tighter",
              lang === 'te' ? "font-telugu" : ""
            )}>
              {t.intro.title}
            </h2>
            <p className={cn(
              "text-base md:text-2xl text-gray-500 font-medium leading-relaxed mb-10 md:mb-16 max-w-4xl mx-auto px-4 md:px-0",
              lang === 'te' ? "font-telugu" : ""
            )}>
              {t.intro.description}
            </p>
            {memberData ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={handleDownloadCertificate}
                className={cn(
                  "bg-green-600 text-white font-black px-10 md:px-12 py-5 md:py-6 rounded-[2rem] md:rounded-[2.5rem] text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-green-700 transition-all shadow-2xl shadow-green-600/30 flex items-center justify-center gap-4 mx-auto",
                  lang === 'te' ? "font-telugu" : ""
                )}
              >
                <span className={lang === 'te' ? "telugu-nudge-down" : ""}>
                  {t.intro.downloadCert}
                </span>
                <Download size={20} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setIsRegOpen(true)}
                className={cn(
                  "bg-blue-600 text-white font-black px-10 md:px-12 py-5 md:py-6 rounded-[2rem] md:rounded-[2.5rem] text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 mx-auto",
                  lang === 'te' ? "font-telugu" : ""
                )}
              >
                <span className={lang === 'te' ? "telugu-nudge-down" : ""}>
                  {t.intro.startReg}
                </span>
                <Building size={20} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Vision & Mission - Glass Cards */}
      <section className="py-12 md:py-16 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            <motion.div
              variants={staggerItem}
              className="group p-8 md:p-12 premium-card relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors duration-700" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl shadow-blue-600/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
                <Target size={32} />
              </div>
              <h3 className={cn(
                "text-3xl md:text-5xl font-black text-blue-950 mb-4 md:mb-6 tracking-tight relative z-10",
                lang === 'te' ? "font-telugu" : ""
              )}>
                {t.missionVision.vision.title}
              </h3>
              <p className={cn(
                "text-xl md:text-2xl text-gray-800 font-medium leading-relaxed relative z-10 max-w-2xl",
                lang === 'te' ? "font-telugu" : ""
              )}>
                {t.missionVision.vision.text}
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="group p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-blue-950 text-white shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/60 transition-all duration-700 relative overflow-hidden hover:-translate-y-2 border border-blue-800/50 flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full group-hover:bg-yellow-500/20 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-blue-950 mb-8 md:mb-10 shadow-[0_0_30px_rgba(234,179,8,0.3)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative z-10">
                <Shield size={32} />
              </div>
              <h3 className={cn(
                "text-3xl md:text-5xl font-black mb-6 md:mb-8 tracking-tight relative z-10 text-yellow-500",
                lang === 'te' ? "font-telugu" : ""
              )}>
                {t.missionVision.mission.title}
              </h3>
              <ul className="space-y-4 md:space-y-6 relative z-10 flex flex-col items-center">
                {t.missionVision.mission.items.map((text, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                    <span className={cn(
                      "text-base md:text-lg font-medium text-white",
                      lang === 'te' ? "font-telugu" : ""
                    )}>{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <motion.section
        {...fadeInUp}
        className="py-12 md:py-20 bg-slate-50"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className={cn(
              "text-blue-600 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] mb-4 block",
              lang === 'te' ? "font-telugu" : ""
            )}>{t.initiatives.badge}</span>
            <h3 className={cn(
              "text-3xl md:text-6xl font-black text-gray-900 tracking-tight",
              lang === 'te' ? "font-telugu" : ""
            )}>{t.initiatives.title}</h3>
            <div className="h-1.5 w-24 bg-yellow-500 mx-auto mt-6 md:mt-8 rounded-full"></div>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto"
          >
            {t.initiatives.items.map((item, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="premium-card p-8 md:p-10 text-center flex flex-col items-center group/card relative overflow-hidden"
              >
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} />
                <div className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-3",
                  idx === 0 ? "bg-blue-100 text-blue-600" :
                    idx === 1 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
                )}>
                  {[Users, Building2, FileCheck][idx] && React.createElement([Users, Building2, FileCheck][idx], { size: 32 })}
                </div>
                <h4 className={cn(
                  "text-xl md:text-2xl font-black text-gray-900 mb-4 group-hover/card:text-blue-900 transition-colors",
                  lang === 'te' ? "font-telugu" : ""
                )}>{item.title}</h4>
                <p className={cn(
                  "text-gray-500 font-medium leading-relaxed",
                  lang === 'te' ? "font-telugu" : ""
                )}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <div id="partners"><CompanyMarquee currentLang={lang} /></div>
      <div id="team"><MembersSection currentLang={lang} /></div>
      <div>
        <NewsTicker currentLang={lang} />
        <AdSection currentLang={lang} />
      </div>
      <div id="gallery"><GallerySection currentLang={lang} /></div>

      {/* Premium Footer */}
      <footer id="contact" className="bg-blue-950 text-white pt-16 md:pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12 md:gap-16 mb-20 md:mb-24 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <img src="/image.png" alt="AP-ARDA" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-2xl" />
                <div className="tracking-tighter">
                  <h4 className="text-2xl md:text-3xl font-black">AP-ARDA</h4>
                  <p className={cn(
                    "text-[10px] md:text-sm text-blue-400 font-bold uppercase tracking-widest",
                    lang === 'te' ? "font-telugu" : ""
                  )}>{t.footer.subtitle}</p>
                </div>
              </div>
              <p className={cn(
                "text-lg md:text-xl text-blue-100/60 leading-relaxed font-medium mb-10 max-w-md",
                lang === 'te' ? "font-telugu" : ""
              )}>
                {t.footer.description}
              </p>
              <div className="flex gap-4">
                {/* Social icons would go here */}
              </div>
            </div>

            <div>
              <h4 className={cn(
                "text-lg font-black mb-6 md:mb-8 text-yellow-500 uppercase tracking-widest",
                lang === 'te' ? "font-telugu" : ""
              )}>{t.footer.connect}</h4>
              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: MapPin, text: 'Amaravati, Andhra Pradesh' },
                  { icon: Phone, text: '+91 9177142464' },
                  { icon: Mail, text: 'support@aparda.com' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="p-3 bg-white/5 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-blue-950 transition-all">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm md:text-blue-100/80 font-medium group-hover:text-white transition-colors">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className={cn(
                "text-lg font-black mb-6 md:mb-8 text-yellow-500 uppercase tracking-widest",
                lang === 'te' ? "font-telugu" : ""
              )}>{t.footer.legacy.title}</h4>
              <p className={cn(
                "text-sm md:text-blue-100/60 font-medium leading-relaxed",
                lang === 'te' ? "font-telugu" : ""
              )}>
                {t.footer.legacy.text}
              </p>
            </div>

            {/* Legal / Policy Links */}
            <div>
              <h4 className={cn(
                "text-lg font-black mb-6 md:mb-8 text-yellow-500 uppercase tracking-widest",
                lang === 'te' ? "font-telugu" : ""
              )}>{t.footer.legal}</h4>
              <div className="space-y-3">
                {configData?.privacyPolicyContent && (
                  <Link to="/policy/privacy" className={cn(
                    "block text-sm text-blue-100/80 font-medium hover:text-white transition-colors",
                    lang === 'te' ? "font-telugu" : ""
                  )}>
                    {t.footer.policies.privacy}
                  </Link>
                )}
                {configData?.termsAndConditionsContent && (
                  <Link to="/policy/terms" className={cn(
                    "block text-sm text-blue-100/80 font-medium hover:text-white transition-colors",
                    lang === 'te' ? "font-telugu" : ""
                  )}>
                    {t.footer.policies.terms}
                  </Link>
                )}
                {configData?.cancellationRefundContent && (
                  <Link to="/policy/cancellation" className={cn(
                    "block text-sm text-blue-100/80 font-medium hover:text-white transition-colors",
                    lang === 'te' ? "font-telugu" : ""
                  )}>
                    {t.footer.policies.cancellation}
                  </Link>
                )}
                {configData?.shippingDeliveryContent && (
                  <Link to="/policy/shipping" className={cn(
                    "block text-sm text-blue-100/80 font-medium hover:text-white transition-colors",
                    lang === 'te' ? "font-telugu" : ""
                  )}>
                    {t.footer.policies.shipping}
                  </Link>
                )}
                {/* Fallback if no links are configured */}
                {!configData?.privacyPolicyContent && !configData?.termsAndConditionsContent && !configData?.cancellationRefundContent && !configData?.shippingDeliveryContent && (
                  <p className={cn(
                    "text-sm text-blue-100/40 italic",
                    lang === 'te' ? "font-telugu" : ""
                  )}>{t.footer.policies.fallback}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12 text-center">
            <p className={cn(
              "text-blue-100/30 text-[10px] font-black uppercase tracking-[0.4em]",
              lang === 'te' ? "font-telugu" : ""
            )}>
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/policy/:type" element={<PolicyPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="carousel" element={<CarouselManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="members" element={<MemberManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="ads" element={<AdManager />} />
          <Route path="settings" element={<SettingsManager />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
