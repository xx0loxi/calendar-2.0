export interface Lesson {
  id: string;
  subject: string;
  room: string;
  teacher: string;
  index: number; // Order in the day (1, 2, 3...)
}

export interface DaySchedule {
  id: string;
  dayName: string;
  lessons: Lesson[];
}

export const scheduleData: DaySchedule[] = [
  {
    id: "day-1",
    dayName: "Понеділок",
    lessons: [
      { id: "d1-l1", index: 1, subject: "Технічна механіка", room: "302", teacher: "Волинець" },
      { id: "d1-l2", index: 2, subject: "Іноземна мова (ЗПС)", room: "316", teacher: "Почтакова" },
      { id: "d1-l3", index: 3, subject: "Буріння свердловин", room: "103", teacher: "Агейчева" },
    ]
  },
  {
    id: "day-2",
    dayName: "Вівторок",
    lessons: [
      { id: "d2-l1", index: 1, subject: "Охорона праці", room: "317", teacher: "Шкіль" },
      { id: "d2-l2", index: 2, subject: "МОБ", room: "301", teacher: "Вирста" },
      { id: "d2-l3", index: 3, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
    ]
  },
  {
    id: "day-3",
    dayName: "Середа",
    lessons: [
      { id: "d3-l1", index: 1, subject: "МОБ", room: "301", teacher: "Вирста" },
      { id: "d3-l2", index: 2, subject: "Фізичне виховання", room: "с/з", teacher: "Кошель" },
      { id: "d3-l3", index: 3, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
    ]
  },
  {
    id: "day-4",
    dayName: "Четвер",
    lessons: [
      { id: "d4-l1", index: 1, subject: "Буріння свердловин", room: "103", teacher: "Агейчева" },
      { id: "d4-l2", index: 2, subject: "Технічна механіка", room: "302", teacher: "Волинець" },
      { id: "d4-l3", index: 3, subject: "Гідравлічні машини", room: "310", teacher: "Чмихун" },
      { id: "d4-l4", index: 4, subject: "Гідравлічні машини", room: "310", teacher: "Чмихун" },
    ]
  },
  {
    id: "day-5",
    dayName: "П'ятниця",
    lessons: [
      { id: "d5-l1", index: 1, subject: "Охорона праці", room: "317", teacher: "Шкіль" },
      { id: "d5-l2", index: 2, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
      { id: "d5-l3", index: 3, subject: "МОБ", room: "301", teacher: "Вирста" },
    ]
  }
];
