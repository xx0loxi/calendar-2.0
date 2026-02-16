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

export interface ScheduleGroup {
  id: string;
  label: string;
  days: DaySchedule[];
}

export const scheduleGroups: ScheduleGroup[] = [
  {
    id: "bn-3-2",
    label: "БН-3-2",
    days: [
      {
        id: "day-1",
        dayName: "Понеділок",
        lessons: [
          { id: "bn32-d1-l1", index: 1, subject: "Технічна механіка", room: "302", teacher: "Волинець" },
          { id: "bn32-d1-l2", index: 2, subject: "Іноземна мова (ЗПС)", room: "316", teacher: "Почтакова" },
          { id: "bn32-d1-l3", index: 3, subject: "Буріння свердловин", room: "103", teacher: "Агейчева" },
        ]
      },
      {
        id: "day-2",
        dayName: "Вівторок",
        lessons: [
          { id: "bn32-d2-l1", index: 1, subject: "Охорона праці", room: "317", teacher: "Шкіль" },
          { id: "bn32-d2-l2", index: 2, subject: "МОБ", room: "301", teacher: "Вирста" },
          { id: "bn32-d2-l3", index: 3, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
        ]
      },
      {
        id: "day-3",
        dayName: "Середа",
        lessons: [
          { id: "bn32-d3-l1", index: 1, subject: "МОБ", room: "301", teacher: "Вирста" },
          { id: "bn32-d3-l2", index: 2, subject: "Фізичне виховання", room: "с/з", teacher: "Кошель" },
          { id: "bn32-d3-l3", index: 3, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
        ]
      },
      {
        id: "day-4",
        dayName: "Четвер",
        lessons: [
          { id: "bn32-d4-l1", index: 1, subject: "Буріння свердловин", room: "103", teacher: "Агейчева" },
          { id: "bn32-d4-l2", index: 2, subject: "Технічна механіка", room: "302", teacher: "Волинець" },
          { id: "bn32-d4-l3", index: 3, subject: "Гідравлічні машини", room: "310", teacher: "Чмихун" },
          { id: "bn32-d4-l4", index: 4, subject: "Гідравлічні машини", room: "310", teacher: "Чмихун" },
        ]
      },
      {
        id: "day-5",
        dayName: "П'ятниця",
        lessons: [
          { id: "bn32-d5-l1", index: 1, subject: "Охорона праці", room: "317", teacher: "Шкіль" },
          { id: "bn32-d5-l2", index: 2, subject: "Економіка та організація виробництва", room: "408", teacher: "Марченко" },
          { id: "bn32-d5-l3", index: 3, subject: "МОБ", room: "301", teacher: "Вирста" },
        ]
      }
    ]
  },
  {
    id: "bn-2-1",
    label: "БН-2-1",
    days: [
      {
        id: "day-1",
        dayName: "Понеділок",
        lessons: [
          { id: "bn21-d1-l1", index: 1, subject: "Фізика і астрономія", room: "410", teacher: "Руденко" },
          { id: "bn21-d1-l2", index: 2, subject: "Хімія", room: "412", teacher: "Андрушкевич" },
          { id: "bn21-d1-l3", index: 3, subject: "Захист України", room: "227", teacher: "Воронянський" },
        ]
      },
      {
        id: "day-2",
        dayName: "Вівторок",
        lessons: [
          { id: "bn21-d2-l1", index: 1, subject: "Фізична культура", room: "с/з", teacher: "Кошель" },
          { id: "bn21-d2-l2", index: 2, subject: "Українська мова", room: "407", teacher: "Марченко" },
          { id: "bn21-d2-l3", index: 3, subject: "Географія", room: "203", teacher: "Тенькова" },
        ]
      },
      {
        id: "day-3",
        dayName: "Середа",
        lessons: [
          { id: "bn21-d3-l1", index: 1, subject: "Фізика і астрономія", room: "410", teacher: "Руденко" },
          { id: "bn21-d3-l2", index: 2, subject: "Біологія і екологія", room: "409", teacher: "Сахненко" },
          { id: "bn21-d3-l3", index: 3, subject: "Інженерна та комп. графіка", room: "417", teacher: "Бадула" },
          { id: "bn21-d3-l4", index: 4, subject: "Матеріалознавство", room: "302", teacher: "Волинець" },
        ]
      },
      {
        id: "day-4",
        dayName: "Четвер",
        lessons: [
          { id: "bn21-d4-l1", index: 1, subject: "Українська література", room: "407", teacher: "Марченко" },
          { id: "bn21-d4-l2", index: 2, subject: "Вища математика", room: "408", teacher: "Марченко" },
          { id: "bn21-d4-l3", index: 3, subject: "Фізика", room: "305", teacher: "Яковенко" },
          { id: "bn21-d4-l4", index: 4, subject: "Технології", room: "402", teacher: "Яковенко" },
        ]
      },
      {
        id: "day-5",
        dayName: "П'ятниця",
        lessons: [
          { id: "bn21-d5-l1", index: 1, subject: "Іноземна мова", room: "316А", teacher: "Бовсунівський" },
          { id: "bn21-d5-l2", index: 2, subject: "Географія", room: "203", teacher: "Тенькова" },
          { id: "bn21-d5-l3", index: 3, subject: "Фізична культура", room: "с/з", teacher: "Кошель" },
          { id: "bn21-d5-l4", index: 4, subject: "Історія України", room: "225", teacher: "Коваленко" },
          { id: "bn21-d5-l5", index: 5, subject: "Екологічні теорії", room: "408", teacher: "Марченко" },
        ]
      }
    ]
  }
];
