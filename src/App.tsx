/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy as TrophyIcon, 
  Users, 
  History, 
  Search, 
  Award, 
  Sliders, 
  BookOpen, 
  Activity, 
  RotateCcw, 
  X,
  ArrowRightLeft,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PLAYERS, MILESTONES, TROPHIES, MATCHES, CORE_STATS } from './data';
import { Player, Milestone, Trophy, MatchAnalysis } from './types';

// Custom robust Moroccan premium player avatar renderer
function renderPlayerAvatar(player: Player, size: 'sm' | 'md' | 'lg' | 'lineup') {
  if (player.imageUrl) {
    const imgSizeClass = 
      size === 'lg' ? 'w-full h-full object-cover transition-transform duration-300 scale-100 group-hover:scale-105 select-none' :
      size === 'md' ? 'w-full h-full object-cover select-none' :
      size === 'lineup' ? 'w-full h-full object-cover select-none' :
      'w-full h-full object-cover select-none';
    return (
      <img 
        src={player.imageUrl} 
        alt={player.arName} 
        className={imgSizeClass}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Stylish Moroccan procedural school badge sketch
  const initials = player.name.split(' ').map(n => n[0]).join('');
  const badgeSizeClass = 
    size === 'lg' ? 'text-2xl' : 
    size === 'md' ? 'text-sm' : 
    'text-xs';

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#80132B] via-[#aa1c3a] to-[#0F4A33] flex flex-col items-center justify-center border-2 border-[#2f2e2a]/20 shadow-inner select-none">
      {/* Hand-drawn Golden pentagram star vector graphic in background to signify Atlas Lions */}
      <svg viewBox="0 0 100 100" className="absolute w-[70%] h-[70%] fill-none stroke-yellow-400/25 stroke-[4] pointer-events-none">
        <polygon points="50,5 95,85 5,35 95,35 5,85" />
      </svg>
      {/* Centered Bold Initials */}
      <span className={`text-white font-black font-hand tracking-tighter ${badgeSizeClass} z-10 block translate-y-[-1px]`}>
        {initials}
      </span>
      {/* Squad Uniform Number */}
      <span className="absolute bottom-[8%] text-[8px] md:text-[9px] text-yellow-300 font-hand font-black tracking-wide z-10 uppercase scale-95">
        #{player.number}
      </span>
    </div>
  );
}

// Subtly synthesize sound using Web Audio API so it plays without external downloads/buffers
function playPaperSound(type: 'flip' | 'sketch', isEnabled: boolean) {
  if (!isEnabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'flip') {
      // White noise base representing a page slide/rattle
      const bufferSize = ctx.sampleRate * 0.35; // 350ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Seed randomized sample noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Classy bandpass filter to sound exactly like a paper flip friction whoosh
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05); // low elegant volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 0.35);
    } else if (type === 'sketch') {
      // Rapid dry pencil sketch graphite scratch double-stroke
      const now = ctx.currentTime;
      const playScratch = (startTime: number, duration: number, volume: number) => {
        const sz = ctx.sampleRate * duration;
        const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < sz; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buf;

        const filter = ctx.createBiquadFilter();
        // highpass/bandpass filters to isolate high-frequency brush texture
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, startTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(startTime);
        source.stop(startTime + duration);
      };

      playScratch(now, 0.10, 0.04);
      playScratch(now + 0.12, 0.07, 0.02);
    }
  } catch (error) {
    console.error('Paper audio synthesis error:', error);
  }
}

export default function App() {
  // Sound effects state
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('frmf_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('frmf_sound_enabled', String(next));
      } catch {}
      return next;
    });
  };

  // Navigation active tab State
  const [activeTab, setActiveTab] = useState<'history' | 'squad'>('history');

  // Selected items state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(MILESTONES[5]); // 2026 AFCON Drama by default
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(PLAYERS[0]); // Yassine Bounou
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy>(TROPHIES[1]); // 2022 World Cup 4th place
  const [selectedMatch, setSelectedMatch] = useState<MatchAnalysis>(MATCHES[0]); // Portugal 2022

  // Player search and filtered states
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPositionFilter, setPlayerPositionFilter] = useState<'all' | 'goalkeeper' | 'defender' | 'midfielder' | 'forward'>('all');

  // Player comparison states
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareWithPlayer, setCompareWithPlayer] = useState<Player | null>(null);

  // Lineup Builder state
  const [lineup, setLineup] = useState<Record<string, Player | null>>({
    GK: PLAYERS[0], // Bounou
    LB: PLAYERS[8], // Mazraoui / Attiyat Allah
    LCB: PLAYERS[4], // Aguerd
    RCB: PLAYERS[6], // Saiss
    RB: PLAYERS[3], // Hakimi
    CDM: PLAYERS[12], // Amrabat
    LCM: PLAYERS[13], // Ounahi
    RCM: PLAYERS[14], // El Khannouss
    LW: PLAYERS[23], // Boufal / Rahimi
    ST: PLAYERS[22], // En-Nesyri
    RW: PLAYERS[20], // Ziyech
  });
  const [activeLineupPosition, setActiveLineupPosition] = useState<string | null>(null);

  // Filtered players list in Side Panel
  const filteredPlayers = useMemo(() => {
    return PLAYERS.filter(p => {
      const matchesSearch = p.arName.includes(playerSearch) || 
                            p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                            p.club.includes(playerSearch);
      const matchesPosition = playerPositionFilter === 'all' ? true : p.position === playerPositionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [playerSearch, playerPositionFilter]);

  // Open line-up editor modal for a specific position
  const handleSelectLineupPlayer = (position: string) => {
    setActiveLineupPosition(position);
  };

  const assignPlayerToLineup = (player: Player) => {
    if (!activeLineupPosition) return;
    
    // Check if player is already assigned somewhere else, and remove
    const updatedLineup = { ...lineup };
    Object.keys(updatedLineup).forEach(pos => {
      if (updatedLineup[pos]?.id === player.id) {
        updatedLineup[pos] = null;
      }
    });

    updatedLineup[activeLineupPosition] = player;
    setLineup(updatedLineup);
    setActiveLineupPosition(null);
  };

  // Reset custom lineup to default
  const handleResetLineup = () => {
    setLineup({
      GK: PLAYERS[0],
      LB: PLAYERS[8],
      LCB: PLAYERS[4],
      RCB: PLAYERS[6],
      RB: PLAYERS[3],
      CDM: PLAYERS[12],
      LCM: PLAYERS[13],
      RCM: PLAYERS[14],
      LW: PLAYERS[23],
      ST: PLAYERS[22],
      RW: PLAYERS[20],
    });
  };

  // Calculate overall rating for standard performance score
  const calculateOverallRating = (player: Player) => {
    const s = player.stats;
    const statsSum = s.pace + s.shooting + s.passing + s.dribbling + s.defending + s.physicality;
    return Math.round(statsSum / 6);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e3] text-[#2f2e2a] selection:bg-amber-200 selection:text-neutral-900 antialiased font-sans pb-12">
      
      {/* HEADER SECTION - Styled like a student's textbook study register scrapbook! */}
      <header className="border-b border-[#d4ccb6] bg-[#fcfbf7] px-4 py-6 relative shadow-md">
        {/* Tape effect on the top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-40 h-8 bg-amber-100/60 shadow-sm border-l border-r border-amber-200/50 rotate-[-1deg] z-50 flex items-center justify-center text-[10px] font-hand text-amber-800/80 uppercase tracking-widest pointer-events-none">
          ★ SCHOOL ASSIGNMENT ★
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          
          {/* Student Dossier Information / Handcrafted ID Card */}
          <div className="text-right flex flex-col md:flex-row items-center gap-4 bg-[#fbf9f0] p-4 rounded-xl border-2 border-dashed border-[#b5ac94] self-start md:self-auto w-full md:w-auto relative rotate-[-0.5deg]">
            {/* Polaroid style badge or sketch of atlas lion */}
            <div className="w-12 h-12 bg-white border-2 border-[#2f2e2a] flex items-center justify-center shadow-sm shrink-0 rotate-[-3deg]">
              <span className="text-2xl">🦁</span>
            </div>
            <div className="w-full text-right">
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <button
                  onClick={toggleSound}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hand font-black border-2 transition-all cursor-pointer ${
                    isSoundEnabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 rotate-[1.2deg] hover:scale-105 shadow-sm'
                      : 'bg-neutral-100 text-neutral-400 border-neutral-300 hover:bg-neutral-200 rotate-[-1.2deg] hover:scale-105'
                  }`}
                  title={isSoundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                >
                  {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                  <span>{isSoundEnabled ? 'صوت مفعل' : 'صوت صامت'}</span>
                </button>
                <span className="font-mono text-[9px] text-[#2f2e2a]/60 font-bold uppercase">
                  FRMF HISTORY STUDY PROJECT
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#80132B] mt-0.5 font-tajawal tracking-tight">
                مشروع مدرسي: أرشيف أسود الأطلس 🇲🇦
              </h1>
            </div>
          </div>

          {/* School Colorful Binder Tab Navigation */}
          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 z-10 select-none">
            {[
              { id: 'history', label: 'التاريخ', icon: History, color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300', sound: 'flip' },
              { id: 'squad', label: 'الكتيبة', icon: Users, color: 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300', sound: 'sketch' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    if (tab.id !== activeTab) {
                      setActiveTab(tab.id as any);
                      playPaperSound(tab.sound as 'flip' | 'sketch', isSoundEnabled);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg transition-all border-2 ${
                    isActive
                      ? 'bg-[#fcfbf7] text-[#2f2e2a] font-bold border-b-0 translate-y-[2px] shadow-[0_-2px_4px_rgba(0,0,0,0.04)] scale-105 z-20'
                      : `${tab.color} border-[#d4ccb6] hover:scale-102 hover:shadow-sm translate-y-0`
                  }`}
                  style={{ fontFamily: 'Tajawal, sans-serif' }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* CORE STATS SUMMARY STRIP - Handcrafted Sticky Notes on Wood Desk Panel */}
      <section className="bg-[#f0ebd9] border-b-2 border-[#d4ccb6] py-3 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_STATS.map((stat, idx) => {
            const stickyColors = [
              'bg-amber-50 border-amber-200 hover:rotate-1 rotate-[-1deg]',
              'bg-emerald-50 border-emerald-200 hover:rotate-[-1deg] rotate-[1.5deg]',
              'bg-sky-50 border-sky-200 hover:rotate-1 rotate-[-1.5deg]',
              'bg-[#fff1f2] border-rose-200 hover:rotate-[-1deg] rotate-[0.5deg]'
            ];
            const color = stickyColors[idx % stickyColors.length];
            return (
              <div 
                key={idx} 
                id={`core-stat-${idx}`} 
                className={`${color} border-2 p-3.5 text-right flex flex-col justify-between shadow-[2px_3px_5px_-1px_rgba(0,0,0,0.08)] transition-all transform duration-200 relative`}
              >
                {/* Simulated Push Pin */}
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-sm z-10 leading-none filter drop-shadow">📌</span>
                <div className="pt-1">
                  <span className="text-[10px] text-neutral-500 font-bold block font-tajawal underline decoration-dashed decoration-neutral-300">
                    {stat.label}
                  </span>
                  <span className="text-base font-black text-neutral-800 mt-1 block font-hand">
                    {stat.value}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-[10px]">
                  <span className="text-[#80132B] font-bold font-hand text-xs">
                    {stat.change}
                  </span>
                  <span className="text-neutral-500 font-hand text-[11px] truncate ml-2 max-w-[130px]">{stat.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        <AnimatePresence mode="wait">
          
          {/* TAB 1: SENSATIONAL HISTORICAL TIMELINE */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Timeline sidebar picker */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#fcfbf7] border-2 border-[#d4ccb6] rounded-xl p-5 text-right flex flex-col gap-3 shadow-[2px_2px_0px_rgba(47,46,42,0.15)] relative">
                  {/* Spiral notebook line at the top to simulate binder */}
                  <div className="absolute -top-2 left-4 right-4 flex justify-between px-2 pointer-events-none">
                    {[1, 2, 3, 4, 5, 6].map(x => <div key={x} className="w-3 h-3 bg-[#e4ddcc] border-2 border-[#b5ac94] rounded-full shadow-inner" />)}
                  </div>
                  <div className="pt-2">
                    <h2 className="font-extrabold text-sm text-[#80132B] font-tajawal select-none">المحطات التاريخية العظمى</h2>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      اختر حقبة زمنية محددة لاستعراض الوثيقة الفنية المعتمدة دولياً.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2">
                    {MILESTONES.map((ms) => {
                      const isSelected = selectedMilestone.id === ms.id;
                      return (
                        <button
                          key={ms.id}
                          id={`milestone-btn-${ms.id}`}
                          onClick={() => setSelectedMilestone(ms)}
                          className={`flex items-center gap-3 text-right p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'bg-amber-50 border-amber-400 shadow-sm rotate-[0.5deg]'
                              : 'bg-white border-[#d4ccb6] hover:border-neutral-400 hover:rotate-[-0.5deg]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs font-hand shrink-0 border-2 transition-all ${
                            isSelected 
                              ? 'bg-amber-300 border-amber-500 text-[#2f2e2a]'
                              : 'bg-[#fcfbf7] border-[#d4ccb6] text-neutral-500'
                          }`}>
                            {ms.year}
                          </div>
                          <div className="flex-1 min-w-0 pr-1">
                            <h3 className={`text-xs font-black truncate font-tajawal ${isSelected ? 'text-[#80132B]' : 'text-neutral-700'}`}>
                              {ms.arabicTitle}
                            </h3>
                            <p className="text-[10px] text-neutral-500 mt-0.5 truncate font-hand font-bold">{ms.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Sticky-Note styled advisory box */}
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-4 rounded-xl text-neutral-750 text-right shadow-sm relative rotate-[-1deg] tape-effect">
                  <div className="flex items-center gap-1.5 justify-end font-bold text-[10px] text-amber-800 uppercase font-hand mb-1.5">
                    <span>نبذة تفصيلية ممتازة</span>
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-[12px] leading-relaxed text-[#2f2e2a]/80 font-hand font-bold">
                    امتازت مسيرة الكرة الوطنية المغربية دوماً بالنضج الكروي الرفيع والشجاعة الاستثنائية أمام كبار الكرة العالمية عبر مر العصور.
                  </p>
                </div>
              </div>

              {/* Main detailed text - Ruled notebook format */}
              <div className="lg:col-span-8 bg-[#fcfbf7] border-2 border-[#d4ccb6] rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-[3px_3px_0px_rgba(47,46,42,0.15)] relative">
                {/* Red ledger line on the right margin */}
                <div className="absolute top-0 bottom-0 right-10 w-0.5 bg-red-350/60 pointer-events-none" />
                
                <div className="text-right pr-6 relative z-10">
                  <div className="flex items-center justify-between border-b-2 border-dashed border-[#d4ccb6] pb-5 mb-6 gap-4">
                    <div>
                      <span className="text-[9px] font-hand font-black tracking-wider text-amber-800 border-2 border-amber-305 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                        Historical Record Notebook
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-[#80132B] mt-2 font-tajawal">
                        {selectedMilestone.arabicTitle}
                      </h2>
                      <p className="text-[11px] text-neutral-500 mt-1 font-hand font-bold">
                        {selectedMilestone.year} — {selectedMilestone.title}
                      </p>
                    </div>
                    <span className="text-4xl md:text-5xl font-black text-[#b5ac94]/35 select-none font-hand rotate-[-6deg]">
                      {selectedMilestone.year}
                    </span>
                  </div>

                  {/* Summary stick-note block */}
                  <div className="border-r-4 border-dashed border-[#80132B] bg-emerald-50/50 p-4 rounded-l-lg text-neutral-800 text-xs md:text-sm leading-relaxed mb-6 font-hand font-bold">
                    📢 {selectedMilestone.summary}
                  </div>

                  {selectedMilestone.imageUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border-2 border-[#2f2e2a] bg-white p-2 shadow-md relative rotate-[1deg] w-full aspect-[16/9] max-h-[380px]">
                      {/* Tape on top */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-amber-100/60 shadow z-20 rotate-[2deg] border-l border-r border-amber-200" />
                      <img 
                        src={selectedMilestone.imageUrl} 
                        alt={selectedMilestone.arabicTitle}
                        className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-300 shadow-inner"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Detailed paragraphs */}
                  <div className="space-y-4 text-xs md:text-sm text-neutral-750 leading-relaxed font-normal">
                    {selectedMilestone.detailedParagraphs.map((para, i) => (
                      <p key={i} className="font-hand font-bold text-base md:text-lg text-neutral-800/90 relative">
                        <span className="absolute right-[-14px] text-amber-500 text-xs">✍</span>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Key figures section with hand-drawn frames */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-[#d4ccb6] text-right pr-6 relative z-10">
                  <span className="text-xs font-hand font-black text-[#80132B] mb-3 block">✦ شخصيات كروية عظيمة خلّدها هذا الدرس:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedMilestone.keyFigures.map((fig, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-[#fbfaf5] border-2 border-[#d4ccb6] rounded-lg shadow-sm rotate-[0.5deg] hover:rotate-[-0.5deg] transition-transform">
                        <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs font-hand font-bold text-[#80132B]">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-800 truncate">{fig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DETAILED SQUAD PORTAL */}
          {activeTab === 'squad' && (
            <motion.div
              key="squad"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Squad Navigation Roster (4 columns) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#fcfbf7] border-2 border-[#d4ccb6] rounded-xl p-5 text-right flex flex-col gap-4 shadow-[2px_2px_0px_rgba(47,46,42,0.15)] relative">
                  {/* Spiral binder hole ornaments */}
                  <div className="absolute -top-2 left-4 right-4 flex justify-between px-2 pointer-events-none">
                    {[1, 2, 3, 4, 5].map(x => <div key={x} className="w-3 h-3 bg-[#e4ddcc] border-2 border-[#b5ac94] rounded-full shadow-inner" />)}
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#d4ccb6] pt-2">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users className="w-4 h-4 text-[#80132B]" />
                      <h2 className="font-extrabold text-[#80132B] text-xs md:text-sm font-tajawal">كتيبة أسود الأطلس الرسمية 2026 🦁</h2>
                    </div>
                    <span className="bg-amber-150 text-amber-900 text-[9px] font-hand font-bold px-2 py-0.5 rounded border border-amber-300">
                      قائمة موسم 2026 (30 لاعباً)
                    </span>
                  </div>

                  {/* Pencil-themed Search bar */}
                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#2f2e2a]/60" />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="ابحث بالقلم الرصاص..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white border-2 border-[#d4ccb6] focus:border-[#80132B] focus:outline-none rounded-lg text-xs text-neutral-800 placeholder-neutral-450 transition-colors font-hand font-bold"
                    />
                    {playerSearch && (
                      <button onClick={() => setPlayerSearch('')} className="absolute left-3 top-2.5 text-neutral-500 hover:text-black">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Position filters - Handdrawn labels */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'الجميع' },
                      { id: 'goalkeeper', label: 'حراس' },
                      { id: 'defender', label: 'دفاع' },
                      { id: 'midfielder', label: 'وسط' },
                      { id: 'forward', label: 'هجوم' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setPlayerPositionFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-full text-[10px] font-hand font-bold border-2 transition-all ${
                          playerPositionFilter === tab.id
                            ? 'bg-amber-300 text-[#2f2e2a] border-amber-500 scale-105 shadow-sm font-bold'
                            : 'bg-white text-neutral-500 border-[#d4ccb6] hover:text-neutral-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Player Notebook Directory List */}
                  <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map(p => {
                        const isSelected = selectedPlayer.id === p.id;
                        return (
                          <button
                            key={p.id}
                            id={`player-row-${p.id}`}
                            onClick={() => setSelectedPlayer(p)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 rotate-[0.5deg] shadow-sm'
                                : 'bg-white border-[#d4ccb6] hover:bg-amber-50/20 hover:border-neutral-400 hover:rotate-[-0.5deg]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-sm font-hand font-black text-xs flex items-center justify-center shrink-0 border-2 transition-colors ${
                                isSelected
                                  ? 'bg-amber-300 border-amber-500 text-neutral-800'
                                  : 'bg-[#fcfbf7] border-[#d4ccb6] text-neutral-500'
                              }`}>
                                {p.number}
                              </div>
                              <div className="truncate text-right">
                                <h3 className={`text-xs font-black truncate font-tajawal ${isSelected ? 'text-[#80132B]' : 'text-neutral-700'}`}>
                                  {p.arName}
                                </h3>
                                <p className="text-[10px] text-neutral-400 tracking-wide font-mono truncate">{p.name}</p>
                              </div>
                            </div>
                            <div className="text-left shrink-0">
                              <span className="text-[9px] font-hand font-bold text-[#80132B] bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded-full">
                                {p.arPosition.split(' ')[0]}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-500 text-xs font-hand font-bold">عفواً، لم يتطابق أي اسم مع المدخلات.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compare Trigger - Taped tag */}
                <button
                  onClick={() => {
                    setIsCompareOpen(true);
                    setCompareWithPlayer(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#fcfbf7] hover:bg-[#fbf9f0] border-2 border-dashed border-[#80132B] p-3 rounded-xl text-xs font-black text-[#80132B] font-tajawal transition-all shadow-sm rotate-[-0.5deg]"
                >
                  <ArrowRightLeft className="w-4 h-4 text-[#80132B]" />
                  <span>مقارنة أداء اللاعبين تكتيكياً</span>
                </button>
              </div>

              {/* Player Dossier Display (8 columns) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#fcfbf7] border-2 border-[#d4ccb6] rounded-xl p-6 shadow-[3px_3px_0px_rgba(47,46,42,0.15)] text-right relative overflow-hidden">
                  
                  {/* Tape overlay on top */}
                  <div className="absolute top-0 right-10 w-24 h-5 bg-amber-100/60 border-l border-r border-amber-200 z-10 rotate-[2deg]" />

                  {/* Big background outline number watermark */}
                  <div className="absolute top-0 left-0 text-[130px] font-black text-[#b5ac94]/10 select-none font-hand translate-y-[-21%] translate-x-[-8%] z-0">
                    #{selectedPlayer.number}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    
                    {/* Polaroid frame card body */}
                    <div className="md:col-span-4 flex flex-col items-center">
                      <div className="relative w-44 h-64 bg-white border-2 border-[#2f2e2a] rounded-lg p-3 flex flex-col items-center justify-between text-center shadow-lg rotate-[-1.5deg]">
                        {/* Photo slot background */}
                        <div className="w-full h-36 bg-[#f0ebd9] rounded border border-neutral-300 overflow-hidden relative">
                          {renderPlayerAvatar(selectedPlayer, 'lg')}
                          {/* Overall badge in a little marker-pen circle */}
                          <div className="absolute top-2 left-2 w-9 h-9 rounded-full bg-yellow-300 border-2 border-dashed border-neutral-800 flex items-center justify-center font-hand font-black text-sm text-[#80132B]">
                            {calculateOverallRating(selectedPlayer)}
                          </div>
                        </div>

                        {/* Polaroid lower caption (typical space for physical writing) */}
                        <div className="text-center w-full mt-2 font-hand font-bold">
                          <h4 className="text-sm font-black text-[#80132B] leading-tight truncate">{selectedPlayer.arName}</h4>
                          <span className="text-xs text-neutral-500 tracking-wide">{selectedPlayer.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Athlete Profile Metrics with cute ruled paper style lines */}
                    <div className="md:col-span-8 text-right">
                      <div className="flex justify-end">
                        <span className="text-[10px] font-hand font-black text-emerald-800 border-2 border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded-full select-none rotate-[-2deg]">
                          {selectedPlayer.arPosition}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-[#80132B] mt-2 font-tajawal">{selectedPlayer.arName}</h2>
                      <p className="text-xs text-neutral-500 mt-1 font-hand">
                        الرقم: <span className="font-mono text-neutral-800 font-bold">#{selectedPlayer.number}</span> | النادي الحالي: <span className="font-bold text-neutral-700">{selectedPlayer.club}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-[#fcfbf7] p-3 rounded-lg border-2 border-[#d4ccb6] shadow-sm">
                          <span className="text-[10px] text-neutral-550 block font-tajawal font-bold">الحضور والمباريات</span>
                          <span className="text-sm font-black text-neutral-800 mt-0.5 block font-hand">
                            {selectedPlayer.caps} <span className="text-[10px] text-neutral-500 font-tajawal">مباراة دولية</span>
                          </span>
                        </div>
                        <div className="bg-[#fcfbf7] p-3 rounded-lg border-2 border-[#d4ccb6] shadow-sm">
                          <span className="text-[10px] text-neutral-555 block font-tajawal font-bold">الأهداف الدولية</span>
                          <span className="text-sm font-black text-neutral-800 mt-0.5 block font-hand">
                            {selectedPlayer.goals} <span className="text-[10px] text-neutral-500 font-tajawal">هدف</span>
                          </span>
                        </div>
                        <div className="bg-[#fcfbf7] p-3 rounded-lg border-2 border-[#d4ccb6] shadow-sm">
                          <span className="text-[10px] text-neutral-555 block font-tajawal font-bold">السن</span>
                          <span className="text-sm font-black text-neutral-800 mt-0.5 block font-hand">
                            {selectedPlayer.age} <span className="text-[10px] text-neutral-500 font-tajawal">سنة</span>
                          </span>
                        </div>
                        <div className="bg-[#fcfbf7] p-3 rounded-lg border-2 border-[#d4ccb6] shadow-sm">
                          <span className="text-[10px] text-neutral-555 block font-tajawal font-bold">المعايير البدنية</span>
                          <span className="text-sm font-black text-neutral-800 mt-0.5 block font-hand">
                            {selectedPlayer.height} / {selectedPlayer.weight}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 bg-[#fbf9f0] border-r-4 border-[#80132B] p-3.5 rounded-l-lg text-xs md:text-sm leading-relaxed text-neutral-700 font-hand font-bold shadow-sm">
                        {selectedPlayer.bio}
                      </div>
                    </div>
                  </div>

                  {/* Deep bio context */}
                  <div className="mt-6 border-t-2 border-dashed border-[#d4ccb6] pt-5">
                    <h3 className="text-xs font-black text-[#80132B] mb-2 flex items-center justify-end gap-1.5 font-tajawal">
                      <span>الملف الفني والمنظور التكتيكي للمشروع</span>
                      <BookOpen className="w-3.5 h-3.5 text-[#80132B]" />
                    </h3>
                    <p className="text-xs md:text-sm leading-relaxed text-neutral-700 font-hand font-bold">
                      {selectedPlayer.detailedBio}
                    </p>
                  </div>

                  {/* Performance assessment drawing styled meters */}
                  <div className="mt-5 bg-[#fbf9f0] border-2 border-dashed border-[#d4ccb6] p-4 rounded-xl text-right">
                    <div className="flex items-center justify-between text-[10px] text-amber-800 font-bold mb-3 font-hand">
                      <span className="bg-[#80132B]/10 text-[#80132B] px-2 py-0.5 rounded border border-[#80132B]/20 font-sans font-extrabold animate-pulse">
                        إحصائيات موسم 2026 الرسمية 🦁
                      </span>
                      <span>التقييم الرياضي الفردي لموسم 2026 بالتنقيط المدرسي:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.pace} / 99</span>
                            <span className="text-neutral-750 font-bold">السرعة والاندفاع (PAC)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-[#80132B] h-full" style={{ width: `${selectedPlayer.stats.pace}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.shooting} / 99</span>
                            <span className="text-neutral-750 font-bold">التسديد والإنهاء (SHO)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-emerald-600 h-full" style={{ width: `${selectedPlayer.stats.shooting}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.passing} / 99</span>
                            <span className="text-neutral-750 font-bold">التمرير وصناعة الفرص (PAS)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-amber-500 h-full" style={{ width: `${selectedPlayer.stats.passing}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.dribbling} / 99</span>
                            <span className="text-neutral-750 font-bold">المراوغة والمناورة (DRI)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-sky-600 h-full" style={{ width: `${selectedPlayer.stats.dribbling}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.defending} / 99</span>
                            <span className="text-neutral-750 font-bold">الافتكاك والواجب الدفاعي (DEF)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-red-500 h-full" style={{ width: `${selectedPlayer.stats.defending}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-hand font-black text-[#80132B]">{selectedPlayer.stats.physicality} / 99</span>
                            <span className="text-neutral-750 font-bold">القوة والالتحام (PHY)</span>
                          </div>
                          <div className="bg-neutral-200 h-2 rounded-full overflow-hidden border border-[#d4ccb6]">
                            <div className="bg-neutral-800 h-full" style={{ width: `${selectedPlayer.stats.physicality}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>      {/* FOOTER SECTION */}
      <footer className="mt-auto border-t-2 border-dashed border-[#d4ccb6] bg-[#fcfbf7] py-8 px-4 text-center text-neutral-500 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-right font-hand font-bold">
            <span className="text-xs font-black text-[#80132B] block mb-1">تطبيق أرشيف أسود الأطلس التاريخي</span>
            <p className="text-xs text-neutral-650 leading-relaxed font-bold">ملف مدرسي تكتيكي موحد وموثق لمنتخب المملكة المغربية لكرة القدم.</p>
          </div>
          <div className="flex gap-2.5 font-hand font-black">
            <span className="text-[10px] text-amber-900 bg-amber-50 border-2 border-[#d4ccb6] px-2 py-0.5 rounded-lg font-mono">ARABIC RTL</span>
            <span className="text-[10px] text-amber-900 bg-amber-50 border-2 border-[#d4ccb6] px-2 py-0.5 rounded-lg font-mono">FRMF REGISTRY</span>
            <span className="text-[10px] text-[#80132B] bg-rose-50 border-2 border-red-200 px-2 py-0.5 rounded-lg font-mono">GRADE: A+</span>
          </div>
        </div>
      </footer>

      {/* FULL-SCREEN DIALOG INTERACTIVE PLAYER COMPARATOR */}
      <AnimatePresence>
        {isCompareOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2e2a]/55 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-[#fcfbf7] border-4 border-[#d4ccb6] rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-right overflow-hidden flex flex-col max-h-[90vh] relative"
            >
              {/* Binder rings overlay on top */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-none">
                {[1, 2, 3, 4].map(x => <div key={x} className="w-4 h-6 bg-[#b5ac94] border-2 border-white rounded-t-lg shadow" />)}
              </div>

              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#d4ccb6] mb-5 mt-4">
                <button 
                  onClick={() => setIsCompareOpen(false)}
                  className="p-1 rounded bg-[#80132B]/10 hover:bg-[#80132B]/20 text-[#80132B] h-8 w-8 flex items-center justify-center transition-colors border-2 border-[#80132B]/20"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#80132B]" />
                  <h3 className="text-sm font-black text-[#80132B] font-tajawal">مقارنة مهارات اللاعبين تكتيكياً (إحصائيات موسم 2026)</h3>
                </div>
              </div>

              {/* Selection cards side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
                
                {/* Player 1 Details */}
                <div className="bg-amber-50/20 p-4 rounded-xl border-2 border-[#d4ccb6] text-center flex flex-col justify-between relative shadow-sm">
                  {/* Tape effects */}
                  <div className="absolute -top-2 left-6 w-14 h-4 bg-yellow-200/60 border-2 border-dashed border-yellow-300 transform -rotate-[5deg]" />

                  <div>
                    <span className="text-[10px] font-hand font-black text-[#80132B] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">إحصائيات 2026 الرسمية</span>
                    <div className="mt-2 text-base font-black text-[#80132B] font-tajawal">{selectedPlayer.arName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{selectedPlayer.name}</div>
                    
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-[#d4ccb6] flex items-center justify-center relative overflow-hidden mx-auto mt-2.5">
                      {renderPlayerAvatar(selectedPlayer, 'md')}
                    </div>

                    <div className="text-lg font-hand font-black text-[#80132B] mt-2.5 bg-rose-50 border-2 border-rose-200 py-1 rounded-lg inline-block px-3.5 rotate-[-2deg]">
                      المستوى: {calculateOverallRating(selectedPlayer)}
                    </div>

                    {/* Progress bars resembling classroom blue ink pen score */}
                    <div className="mt-4 space-y-2 text-right font-hand font-bold">
                      {Object.entries(selectedPlayer.stats).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-[9px]">
                            <span className="font-mono text-neutral-500">{val} / 99</span>
                            <span className="text-[#80132B] uppercase tracking-wider font-hand text-[10px]">
                              {key === 'pace' ? 'السرعة' : key === 'shooting' ? 'التسديد' : key === 'passing' ? 'التمرير' : key === 'dribbling' ? 'المراوغة' : key === 'defending' ? 'الدفاع' : 'اللياقة'}
                            </span>
                          </div>
                          <div className="w-full bg-[#d4ccb6]/35 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#80132B] h-full rounded-full" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player 2 choosing / display */}
                <div className="bg-amber-50/20 p-4 rounded-xl border-2 border-[#d4ccb6] text-center flex flex-col justify-between relative shadow-sm">
                  {/* Tape effects */}
                  <div className="absolute -top-2 right-6 w-14 h-4 bg-yellow-200/60 border-2 border-dashed border-yellow-300 transform rotate-[4deg]" />

                  {compareWithPlayer ? (
                    <div>
                      <span className="text-[10px] font-hand font-black text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">إحصائيات 2026 الرسمية</span>
                      <div className="mt-2 text-base font-black text-blue-900 font-tajawal">{compareWithPlayer.arName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{compareWithPlayer.name}</div>
                      
                      <div className="w-14 h-14 rounded-full bg-white border-2 border-[#d4ccb6] flex items-center justify-center relative overflow-hidden mx-auto mt-2.5">
                        {renderPlayerAvatar(compareWithPlayer, 'md')}
                      </div>

                      <div className="text-lg font-hand font-black text-blue-900 mt-2.5 bg-blue-50 border-2 border-blue-250 py-1 rounded-lg inline-block px-3.5 rotate-[1.5deg]">
                        المستوى: {calculateOverallRating(compareWithPlayer)}
                      </div>

                      {/* Progress bars resembling classroom blue ink pen score */}
                      <div className="mt-4 space-y-2 text-right font-hand font-bold">
                        {Object.entries(compareWithPlayer.stats).map(([key, val]) => (
                          <div key={key}>
                            <div className="flex justify-between text-[9px]">
                              <span className="font-mono text-neutral-500">{val} / 99</span>
                              <span className="text-blue-900 uppercase tracking-wider font-hand text-[10px]">
                                {key === 'pace' ? 'السرعة' : key === 'shooting' ? 'التسديد' : key === 'passing' ? 'التمرير' : key === 'dribbling' ? 'المراوغة' : key === 'defending' ? 'الدفاع' : 'اللياقة'}
                              </span>
                            </div>
                            <div className="w-full bg-[#d4ccb6]/35 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCompareWithPlayer(null)}
                        className="mt-4 text-[10px] text-neutral-500 font-hand font-black underline block mx-auto hover:text-[#80132B]"
                      >
                        تبديل اختيار اللاعب المقارن
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center font-hand font-bold">
                      <span className="text-[11px] text-[#80132B] block mb-2 font-black">اختر لاعباً من كتيبة الأسود لمقارنته:</span>
                      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto border-2 border-[#d4ccb6] rounded-xl p-2 bg-white pr-1">
                        {PLAYERS.filter(p => p.id !== selectedPlayer.id).map(p => (
                          <button
                            key={p.id}
                            id={`compare-option-${p.id}`}
                            onClick={() => setCompareWithPlayer(p)}
                            className="text-right p-2 hover:bg-[#80132B]/5 rounded-lg text-xs text-neutral-800 transition-colors block border border-transparent hover:border-[#80132B]/30"
                          >
                            ⭐ {p.arName} ({p.name})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="mt-5 border-t-2 border-dashed border-[#d4ccb6] pt-4 text-center font-hand">
                <button
                  type="button"
                  onClick={() => setIsCompareOpen(false)}
                  className="bg-[#80132B] hover:bg-[#80132B]/90 text-white font-black px-6 py-2 rounded-xl text-xs transition-transform shadow-[2px_2px_0px_rgba(47,46,42,0.15)] hover:scale-105 pointer-events-auto"
                >
                  إغلاق نافذة المقارنة
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
