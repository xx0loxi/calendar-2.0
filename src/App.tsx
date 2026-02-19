import { useState, useEffect } from 'react'
import { scheduleGroups, type Lesson, type DaySchedule } from './data/schedule'
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

  const [customLessonsByGroup, setCustomLessonsByGroup] = useState<Record<string, Record<string, Lesson[]>>>(() => {
    if (!canUseStorage) {
      return {};
    }
    try {
      const saved = localStorage.getItem('customLessons');
      const parsed = saved ? JSON.parse(saved) : {};
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }
      const groupIds = scheduleGroups.map(group => group.id);
      const hasGroupKey = Object.keys(parsed).some(key => groupIds.includes(key));
      if (hasGroupKey) {
        return parsed;
      }
      const fallbackGroup = scheduleGroups[0]?.id ?? 'bn-3-2';
      return { [fallbackGroup]: parsed };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!canUseStorage) {
      return;
    }
    try {
      localStorage.setItem('customLessons', JSON.stringify(customLessonsByGroup));
    } catch {
      return;
    }
  }, [customLessonsByGroup, canUseStorage]);

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
    const deviceClasses = ['device-iphone-11', 'device-iphone-12', 'device-iphone-14', 'device-iphone-16', 'device-a56'];
    const applyDeviceClass = () => {
      const width = Math.min(window.innerWidth, window.innerHeight);
      const height = Math.max(window.innerWidth, window.innerHeight);
      const dpr = window.devicePixelRatio || 1;
      let nextClasses: string[] = [];
      if (width === 414 && height === 896 && dpr >= 2) {
        nextClasses = ['device-iphone-11'];
      } else if (width === 390 && height === 844 && dpr >= 3) {
        nextClasses = ['device-iphone-12', 'device-iphone-14'];
      } else if (width === 393 && height === 852 && dpr >= 3) {
        nextClasses = ['device-iphone-16'];
      } else if (width === 360 && height >= 760 && height <= 820) {
        nextClasses = ['device-a56'];
      }
      deviceClasses.forEach(item => root.classList.remove(item));
      nextClasses.forEach(item => root.classList.add(item));
    };
    applyDeviceClass();
    window.addEventListener('resize', applyDeviceClass);
    return () => window.removeEventListener('resize', applyDeviceClass);
  }, []);

  const scheduleGroupsById = scheduleGroups.reduce<Record<string, { id: string; label: string; days: DaySchedule[] }>>((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {});
  const [activeGroupId, setActiveGroupId] = useState(() => {
    if (!canUseStorage) {
      return scheduleGroups[0]?.id ?? 'bn-3-2';
    }
    try {
      const saved = localStorage.getItem('activeGroupId');
      return saved && scheduleGroupsById[saved] ? saved : (scheduleGroups[0]?.id ?? 'bn-3-2');
    } catch {
      return scheduleGroups[0]?.id ?? 'bn-3-2';
    }
  });
  useEffect(() => {
    if (!canUseStorage) {
      return;
    }
    try {
      localStorage.setItem('activeGroupId', activeGroupId);
    } catch {
      return;
    }
  }, [activeGroupId, canUseStorage]);
  const activeGroup = scheduleGroupsById[activeGroupId] ?? scheduleGroups[0];
  const customLessons = activeGroup ? (customLessonsByGroup[activeGroup.id] ?? {}) : {};
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [monthDirection, setMonthDirection] = useState<'prev' | 'next'>('next');
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();
  const monthLabel = currentMonth.toLocaleString('uk-UA', { month: 'long', year: 'numeric' });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const scheduleById = (activeGroup?.days ?? []).reduce<Record<string, DaySchedule>>((acc, day) => {
    acc[day.id] = day;
    return acc;
  }, {});
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayKey = getDateKey(today);

  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date; dateKey: string; dayId: string; dayName: string; lessons: Lesson[] }> = [];
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      const date = new Date(year, month, dayNumber);
      const weekday = date.getDay();
      if (weekday === 0 || weekday === 6) {
        continue;
      }
      const dayId = `day-${weekday}`;
      const dayInfo = scheduleById[dayId];
      if (!dayInfo) {
        continue;
      }
      days.push({
        date,
        dateKey: getDateKey(date),
        dayId,
        dayName: dayInfo.dayName,
        lessons: dayInfo.lessons,
      });
    }
    return days;
  };

  const goPrevMonth = () => {
    setMonthDirection('prev');
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setMonthDirection('next');
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const [formSubject, setFormSubject] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formIndex, setFormIndex] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openDays, setOpenDays] = useState<Set<string>>(() => new Set());
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const initialDays = getMonthDays(currentMonth);
    return initialDays[0] ? [initialDays[0].dateKey] : [];
  });

  const monthDays = getMonthDays(currentMonth);
  const dayByDateKey = monthDays.reduce<Record<string, { dayId: string; lessons: Lesson[] }>>((acc, day) => {
    acc[day.dateKey] = { dayId: day.dayId, lessons: day.lessons };
    return acc;
  }, {});
  const getNextIndex = (dateKeys: string[]) => {
    let maxIndex = 0;
    dateKeys.forEach(dateKey => {
      const dayInfo = dayByDateKey[dateKey];
      if (!dayInfo) {
        return;
      }
      const base = dayInfo.lessons ?? [];
      const dateExtra = customLessons[dateKey] ?? [];
      const legacyExtra = customLessons[dayInfo.dayId] ?? [];
      maxIndex = Math.max(
        maxIndex,
        ...base.map(item => item.index),
        ...dateExtra.map(item => item.index),
        ...legacyExtra.map(item => item.index),
      );
    });
    return maxIndex + 1;
  };

  const addCustomLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedDates.length === 0 || !formSubject.trim() || !activeGroup) {
      return;
    }
    const indexValue = Number(formIndex);
    setCustomLessonsByGroup(prev => {
      const groupLessons = prev[activeGroup.id] ?? {};
      const nextGroup = { ...groupLessons };
      selectedDates.forEach(dateKey => {
        const dayInfo = dayByDateKey[dateKey];
        if (!dayInfo) {
          return;
        }
        const nextIndex = Number.isFinite(indexValue) && indexValue > 0 ? Math.floor(indexValue) : getNextIndex([dateKey]);
        const newLesson: Lesson = {
          id: `custom-${activeGroup.id}-${dateKey}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          index: nextIndex,
          subject: formSubject.trim(),
          room: formRoom.trim() || '—',
          teacher: formTeacher.trim() || '—',
        };
        const list = nextGroup[dateKey] ?? [];
        nextGroup[dateKey] = [...list, newLesson];
      });
      return {
        ...prev,
        [activeGroup.id]: nextGroup,
      };
    });
    setFormSubject('');
    setFormRoom('');
    setFormTeacher('');
    setFormIndex('');
  };

  const toggleMissed = (id: string, legacyId?: string) => {
    setMissedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id) || (legacyId && next.has(legacyId))) {
        next.delete(id);
        if (legacyId) {
          next.delete(legacyId);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleDayOpen = (dayKey: string) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  };

  useEffect(() => {
    const dateKeys = getMonthDays(currentMonth).map(day => day.dateKey);
    setSelectedDates(prev => {
      const kept = prev.filter(key => dateKeys.includes(key));
      return kept.length ? kept : (dateKeys[0] ? [dateKeys[0]] : []);
    });
  }, [currentMonth, activeGroupId]);
  useEffect(() => {
    setOpenDays(new Set());
  }, [currentMonth, activeGroupId]);

  const toggleSelectedDate = (dateKey: string) => {
    setSelectedDates(prev => (
      prev.includes(dateKey) ? prev.filter(key => key !== dateKey) : [...prev, dateKey]
    ));
  };
  const removeCustomLesson = (sourceKey: string, lessonId: string) => {
    if (!activeGroup) {
      return;
    }
    setCustomLessonsByGroup(prev => {
      const groupLessons = prev[activeGroup.id] ?? {};
      const list = groupLessons[sourceKey] ?? [];
      const nextList = list.filter(item => item.id !== lessonId);
      if (nextList.length === list.length) {
        return prev;
      }
      const nextGroup = { ...groupLessons };
      if (nextList.length) {
        nextGroup[sourceKey] = nextList;
      } else {
        delete nextGroup[sourceKey];
      }
      const next = {
        ...prev,
        [activeGroup.id]: nextGroup,
      };
      return next;
    });
    setMissedLessons(prev => {
      const next = new Set(prev);
      [...next].forEach(key => {
        if (key.endsWith(`:${lessonId}`)) {
          next.delete(key);
        }
      });
      return next;
    });
  };
  const monthMissedCount = monthDays.reduce((acc, day) => {
    const dateExtra = customLessons[day.dateKey] ?? [];
    const legacyExtra = customLessons[day.dayId] ?? [];
    const allLessons = [...day.lessons, ...dateExtra, ...legacyExtra];
    const dayKey = `${activeGroup?.id ?? 'group'}:${day.dateKey}`;
    const legacyDayKey = day.dateKey;
    return acc + allLessons.reduce((innerAcc, lesson) => {
      const lessonKey = `${dayKey}:${lesson.id}`;
      const legacyLessonKey = `${legacyDayKey}:${lesson.id}`;
      return missedLessons.has(lessonKey) || missedLessons.has(legacyLessonKey) ? innerAcc + 1 : innerAcc;
    }, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-12 font-sans transition-colors duration-300">
      <header className="sticky top-0 z-10">
        <div className="bg-gradient-to-b from-white via-white/95 to-slate-100/80 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur">
          <div className="max-w-md mx-auto px-4 pt-3 pb-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Розклад</h1>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm">
                  <span className="uppercase tracking-widest text-[9px] text-slate-400 dark:text-slate-500">Група</span>
                  <span className="text-slate-800 dark:text-slate-100">{activeGroup?.label ?? '—'}</span>
                </div>
              </div>
              <div className={`mt-1 min-w-[92px] rounded-2xl border px-2.5 py-1 shadow-sm transition-all ${
                monthMissedCount > 0
                  ? 'bg-red-200/90 dark:bg-red-800/60 text-red-800 dark:text-red-100 border-red-300/80 dark:border-red-700/80 shadow-red-200/70 dark:shadow-red-950/60 glow-red'
                  : 'bg-slate-100/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-widest">Пропуски</span>
                  <span className="text-base font-bold leading-none">{monthMissedCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-1.5 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                {scheduleGroups.map(group => {
                  const isActive = group.id === activeGroup?.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroupId(group.id)}
                      className={`rounded-xl px-3 py-2 text-[11px] font-semibold border transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 px-3 py-2.5 shadow-sm">
              <button
                onClick={goPrevMonth}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
                aria-label="Попередній місяць"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center gap-1">
                <span
                  key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
                  className={`month-title text-sm font-semibold text-slate-900 dark:text-slate-100 ${monthDirection === 'next' ? 'is-next' : 'is-prev'}`}
                >
                  {monthTitle}
                </span>
                {isCurrentMonth && (
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-900/40 border border-emerald-200/70 dark:border-emerald-900/60 px-2 py-0.5 rounded-full shadow-sm glow-soft badge-enter uppercase tracking-widest">
                    Поточний місяць
                  </span>
                )}
              </div>
              <button
                onClick={goNextMonth}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
                aria-label="Наступний місяць"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-3 relative">
        <div className="flex justify-center -my-0.5">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 px-2.5 py-0.5 rounded-full shadow-sm shadow-slate-200/70 dark:shadow-slate-950/40 tracking-wide">Версія 3.1.5</span>
        </div>
        <form onSubmit={addCustomLesson} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3 fade-in-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Додати свою пару</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 mt-1"
              aria-expanded={isFormOpen}
            >
              <span>{isFormOpen ? 'Згорнути' : 'Розгорнути'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>

          <div className={`collapsible-panel ${isFormOpen ? 'is-open' : ''}`}>
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/80 p-3 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Дні місяця</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Вибрано: {selectedDates.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {monthDays.map(day => {
                    const isActive = selectedDates.includes(day.dateKey);
                    const shortLabel = day.date.toLocaleDateString('uk-UA', { day: 'numeric', weekday: 'short' });
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => toggleSelectedDate(day.dateKey)}
                        className={`rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 border ${
                          isActive
                            ? 'bg-emerald-50/90 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{shortLabel}</span>
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
                  placeholder={`Напр. ${getNextIndex(selectedDates)}`}
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

        <div
          key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
          className={`month-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${monthDirection === 'next' ? 'is-next' : 'is-prev'}`}
        >
        {monthDays.map((day) => {
          const dateLabel = day.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
          const isToday = day.dateKey === todayKey;
          const dateExtra = customLessons[day.dateKey] ?? [];
          const legacyExtra = customLessons[day.dayId] ?? [];
          const customSourceById = new Map<string, string>();
          dateExtra.forEach(lesson => customSourceById.set(lesson.id, day.dateKey));
          legacyExtra.forEach(lesson => {
            if (!customSourceById.has(lesson.id)) {
              customSourceById.set(lesson.id, day.dayId);
            }
          });
          const allLessons = [...day.lessons, ...dateExtra, ...legacyExtra].slice().sort((a, b) => a.index - b.index);
          const dayKey = `${activeGroup?.id ?? 'group'}:${day.dateKey}`;
          const legacyDayKey = day.dateKey;
          const isOpen = openDays.has(dayKey);
          const lessonCount = allLessons.length;
          const previewSubjects = allLessons.slice(0, 2).map(lesson => lesson.subject).join(', ');
          const moreCount = lessonCount > 2 ? lessonCount - 2 : 0;
          const missedCount = allLessons.reduce((acc, lesson) => {
            const lessonKey = `${dayKey}:${lesson.id}`;
            const legacyLessonKey = `${legacyDayKey}:${lesson.id}`;
            return missedLessons.has(lessonKey) || missedLessons.has(legacyLessonKey) ? acc + 1 : acc;
          }, 0);
          return (
          <div key={dayKey} className={`day-card bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden fade-in-soft transform-gpu transition-transform duration-200 hover:-translate-y-0.5 ${isToday ? 'ring-1 ring-emerald-200/80 dark:ring-emerald-800/80' : ''}`}>
            <button
              type="button"
              onClick={() => toggleDayOpen(dayKey)}
              className={`day-toggle w-full text-left bg-white/95 dark:bg-slate-900/80 backdrop-blur px-3.5 py-3 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 transition-all duration-300 shadow-[0_1px_6px_rgba(15,23,42,0.06)] ${
                isOpen
                  ? 'rounded-t-2xl'
                  : 'rounded-2xl hover:bg-slate-50/90 dark:hover:bg-slate-800/80 hover:shadow-sm border border-slate-200/80 dark:border-slate-800/80'
              }`}
              style={{ transitionDelay: isOpen ? '0ms' : '160ms' }}
              aria-expanded={isOpen}
            >
              <div className="p-2 bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-xl shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{day.dayName}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">{dateLabel}</span>
                  {isToday && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60">
                      Сьогодні
                    </span>
                  )}
                </div>
                <div className={`day-preview text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 ${isOpen ? 'is-hidden' : ''}`}>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Пар: {lessonCount}</span>
                  {previewSubjects && (
                    <span className="truncate max-w-[160px]">{previewSubjects}{moreCount > 0 ? ` +${moreCount}` : ''}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isOpen && missedCount > 0 && (
                  <span className="min-w-[24px] h-6 px-1 rounded-full bg-red-200 dark:bg-red-800/70 text-red-800 dark:text-red-100 text-xs font-bold flex items-center justify-center border border-red-300 dark:border-red-700 shadow-sm shadow-red-200/80 dark:shadow-red-950/60">
                    {missedCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
              </div>
            </button>

            <div className={`collapsible-panel ${isOpen ? 'is-open' : ''}`}>
              <div className="collapsible-content">
                {allLessons.map((lesson) => {
                const lessonKey = `${dayKey}:${lesson.id}`;
                const legacyLessonKey = `${legacyDayKey}:${lesson.id}`;
                const isMissed = missedLessons.has(lessonKey) || missedLessons.has(legacyLessonKey);
                const customSourceKey = customSourceById.get(lesson.id);
                const isCustom = Boolean(customSourceKey);
                return (
                  <div 
                    key={lessonKey} 
                    className={`p-4 last:pb-3 last:rounded-b-2xl transition-all duration-250 slide-in ${
                      isMissed ? 'bg-red-50/80 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/60 shadow-sm shadow-red-100/60 dark:shadow-red-950/40' : 'bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50/90 dark:hover:bg-slate-800/70 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0 flex gap-3">
                        <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 mt-0.5 ${
                          isMissed ? 'bg-red-100/80 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                        }`}>
                          {lesson.index}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className={`font-semibold text-base leading-snug ${
                              isMissed ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {lesson.subject}
                            </h3>
                            {isCustom && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 font-semibold">
                                Своя пара
                              </span>
                            )}
                          </div>
                          
                          <div className={`flex flex-wrap gap-y-1 gap-x-3 text-sm ${
                            isMissed ? 'text-red-600 dark:text-red-200' : 'text-slate-500 dark:text-slate-300'
                          }`}>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                              isMissed
                                ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200/70 dark:border-red-900/60'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                            }`}>
                              <MapPin className={`w-3 h-3 ${isMissed ? 'text-red-400 dark:text-red-300' : 'text-slate-400 dark:text-slate-400'}`} />
                              <span>{lesson.room}</span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                              isMissed
                                ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200/70 dark:border-red-900/60'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                            }`}>
                              <User className={`w-3 h-3 ${isMissed ? 'text-red-400 dark:text-red-300' : 'text-slate-400 dark:text-slate-400'}`} />
                              <span>{lesson.teacher}</span>
                            </div>
                          </div>
                          {isCustom && customSourceKey && (
                            <button
                              onClick={() => removeCustomLesson(customSourceKey, lesson.id)}
                              className="mt-2 text-[11px] font-semibold px-2 py-1 rounded-lg border border-red-200/70 dark:border-red-900/70 text-red-600 dark:text-red-300 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100/80 dark:hover:bg-red-900/40 transition-all"
                            >
                              Видалити
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => toggleMissed(lessonKey, legacyLessonKey)}
                          className={`missed-toggle flex-shrink-0 p-2 rounded-xl transition-all duration-300 ${
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
                  </div>
                );
              })}
                {allLessons.length === 0 && (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm italic">
                    Пар немає
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}
        </div>
      </main>
    </div>
  )
}

export default App
