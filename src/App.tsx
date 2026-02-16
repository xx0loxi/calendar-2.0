import { useState, useEffect } from 'react'
import { scheduleData, type Lesson } from './data/schedule'
import { CheckCircle2, XCircle, Calendar, User, MapPin, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react'

function App() {
  const canUseStorage = typeof window !== 'undefined' && 'localStorage' in window;
  const [missedLessons, setMissedLessons] = useState<Set<string>>(() => {
    if (!canUseStorage) {
      return new Set();
    }
    try {
      const saved = localStorage.getItem('missedLessons');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!canUseStorage) {
      return;
    }
    try {
      localStorage.setItem('missedLessons', JSON.stringify([...missedLessons]));
    } catch {
      return;
    }
  }, [missedLessons, canUseStorage]);

  const [customLessons, setCustomLessons] = useState<Record<string, Lesson[]>>(() => {
    if (!canUseStorage) {
      return {};
    }
    try {
      const saved = localStorage.getItem('customLessons');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!canUseStorage) {
      return;
    }
    try {
      localStorage.setItem('customLessons', JSON.stringify(customLessons));
    } catch {
      return;
    }
  }, [customLessons, canUseStorage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark: boolean) => {
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme(media.matches);
    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const root = document.documentElement;
    const deviceClasses = ['device-iphone-11', 'device-a56'];
    const applyDeviceClass = () => {
      const width = Math.min(window.innerWidth, window.innerHeight);
      const height = Math.max(window.innerWidth, window.innerHeight);
      const dpr = window.devicePixelRatio || 1;
      let nextClass = '';
      if (width === 414 && height === 896 && dpr >= 2) {
        nextClass = 'device-iphone-11';
      } else if (width === 390 && height === 844 && dpr >= 3) {
        nextClass = 'device-iphone-11';
      } else if (width === 360 && height >= 760 && height <= 820) {
        nextClass = 'device-a56';
      }
      deviceClasses.forEach(item => root.classList.remove(item));
      if (nextClass) {
        root.classList.add(nextClass);
      }
    };
    applyDeviceClass();
    window.addEventListener('resize', applyDeviceClass);
    return () => window.removeEventListener('resize', applyDeviceClass);
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();
  const monthLabel = currentMonth.toLocaleString('uk-UA', { month: 'long', year: 'numeric' });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const goPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const [formDayId, setFormDayId] = useState(scheduleData[0]?.id ?? '');
  const [formSubject, setFormSubject] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formIndex, setFormIndex] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(true);

  const getNextIndex = (dayId: string) => {
    const base = scheduleData.find(day => day.id === dayId)?.lessons ?? [];
    const extra = customLessons[dayId] ?? [];
    const maxIndex = Math.max(0, ...base.map(item => item.index), ...extra.map(item => item.index));
    return maxIndex + 1;
  };

  const addCustomLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formDayId || !formSubject.trim()) {
      return;
    }
    const indexValue = Number(formIndex);
    const nextIndex = Number.isFinite(indexValue) && indexValue > 0 ? Math.floor(indexValue) : getNextIndex(formDayId);
    const newLesson: Lesson = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      index: nextIndex,
      subject: formSubject.trim(),
      room: formRoom.trim() || '—',
      teacher: formTeacher.trim() || '—',
    };
    setCustomLessons(prev => {
      const list = prev[formDayId] ?? [];
      return {
        ...prev,
        [formDayId]: [...list, newLesson],
      };
    });
    setFormSubject('');
    setFormRoom('');
    setFormTeacher('');
    setFormIndex('');
  };

  const toggleMissed = (id: string) => {
    setMissedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalMissed = missedLessons.size;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-12 font-sans transition-colors duration-300">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Розклад</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Група БН-ІІІ-2</p>
            </div>
            <div className="flex items-center gap-2 bg-red-50/90 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/60 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider">Пропуски</span>
              <span className="font-bold text-lg leading-none">{totalMissed}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/70 px-3 py-2 transition-colors duration-300">
            <button
              onClick={goPrevMonth}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
              aria-label="Попередній місяць"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{monthTitle}</span>
              {isCurrentMonth && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 glow-soft">Поточний місяць</span>
              )}
            </div>
            <button
              onClick={goNextMonth}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
              aria-label="Наступний місяць"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <form onSubmit={addCustomLesson} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3 fade-in-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Додати свою пару</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Наприклад, непланова пара</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
              aria-expanded={isFormOpen}
            >
              <span>{isFormOpen ? 'Згорнути' : 'Розгорнути'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>

          <div className={`collapsible-panel ${isFormOpen ? 'is-open' : ''}`}>
            <div className="space-y-3 pt-1">
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">День тижня</span>
                <div className="grid grid-cols-3 gap-2">
                  {scheduleData.map(day => {
                    const isActive = formDayId === day.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => setFormDayId(day.id)}
                        className={`rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 border ${
                          isActive
                            ? 'bg-emerald-50/90 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {day.dayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                № Пари
                <input
                  value={formIndex}
                  onChange={(event) => setFormIndex(event.target.value)}
                  inputMode="numeric"
                  placeholder={`Напр. ${getNextIndex(formDayId)}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                Назва пари
                <input
                  value={formSubject}
                  onChange={(event) => setFormSubject(event.target.value)}
                  placeholder="Введи предмет"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Аудиторія
                  <input
                    value={formRoom}
                    onChange={(event) => setFormRoom(event.target.value)}
                    placeholder="Напр. 204"
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Викладач
                  <input
                    value={formTeacher}
                    onChange={(event) => setFormTeacher(event.target.value)}
                    placeholder="Прізвище"
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!formSubject.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Додати
              </button>
            </div>
          </div>
        </form>

        {scheduleData.map((day) => (
          <div key={day.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden fade-in-soft">
            <div className="bg-slate-50/90 dark:bg-slate-800/70 backdrop-blur px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 sticky top-0">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{day.dayName}</h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...day.lessons, ...(customLessons[day.id] ?? [])]
                .slice()
                .sort((a, b) => a.index - b.index)
                .map((lesson) => {
                const isMissed = missedLessons.has(lesson.id);
                const isCustom = lesson.id.startsWith('custom-');
                return (
                  <div 
                    key={lesson.id} 
                    className={`p-4 transition-all duration-200 slide-in ${
                      isMissed ? 'bg-red-50/40 dark:bg-red-950/30' : 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0 flex gap-3">
                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold text-sm flex-shrink-0 mt-0.5">
                          {lesson.index}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className={`font-semibold text-base leading-snug ${
                              isMissed ? 'text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-red-200 dark:decoration-red-800/70' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {lesson.subject}
                            </h3>
                            {isCustom && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 font-semibold">
                                Своя пара
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-y-1 gap-x-3 text-sm text-slate-500 dark:text-slate-300">
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-400" />
                              <span>{lesson.room}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                              <User className="w-3 h-3 text-slate-400 dark:text-slate-400" />
                              <span>{lesson.teacher}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleMissed(lesson.id)}
                        className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 active:scale-95 ${
                          isMissed 
                            ? 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 shadow-inner' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-100'
                        }`}
                        aria-label={isMissed ? "Скасувати пропуск" : "Відмітити пропуск"}
                      >
                        {isMissed ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {day.lessons.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm italic">
                  Пар немає
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default App
