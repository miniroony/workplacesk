window.SK = {
  org: "УК «Северная»",
  user: { name: "Ирина Смирнова", role: "Диспетчер УК", initial: "И", login: "uk_severnaya" },
  months: ["Июн", "Июл", "Авг", "Сен", "Окт", "Ноя"],
  trend: [52, 61, 58, 70, 78, 87],
  zones: [
    { id: "z1", street: "ул. Советская", count: 14, topCat: "Дороги", priority: "high" },
    { id: "z2", street: "пр. Ленина", count: 11, topCat: "Освещение", priority: "high" },
    { id: "z3", street: "ул. Кирова", count: 9, topCat: "Мусор", priority: "mid" },
    { id: "z4", street: "ул. Шахтёров", count: 8, topCat: "ЖКХ", priority: "high" },
    { id: "z5", street: "ул. Весенняя", count: 7, topCat: "Благоустройство", priority: "mid" },
    { id: "z6", street: "ул. Дзержинского", count: 6, topCat: "Благоустройство", priority: "mid" },
    { id: "z7", street: "пр. Металлургов", count: 5, topCat: "Транспорт", priority: "low" },
    { id: "z8", street: "ул. Кузнецкая", count: 4, topCat: "Транспорт", priority: "mid" },
    { id: "z9", street: "ул. Тухачевского", count: 3, topCat: "Другое", priority: "low" },
    { id: "z10", street: "ул. Мира", count: 10, topCat: "ЖКХ", priority: "high" },
    { id: "z11", street: "ул. Строителей", count: 2, topCat: "Освещение", priority: "low" },
    { id: "z12", street: "ул. Базовая", count: 8, topCat: "Дороги", priority: "mid" }
  ],
  appeals: [
    { id: 1042, title: "Большая яма на проезжей части", category: "Дороги", address: "ул. Советская, 45", description: "Глубокая яма у перекрёстка. Несколько автомобилей повредили подвеску.", status: "new", stars: 28, comments: 5, date: "2026-11-22T09:14:00", author: "Алексей П.", channel: "Приложение", assignee: null, replies: [] },
    { id: 1041, title: "Не работает освещение во дворе", category: "Освещение", address: "пр. Ленина, 12к2", description: "Три фонаря не горят больше месяца. Во дворе темно вечером.", status: "work", stars: 15, comments: 3, date: "2026-11-21T18:02:00", author: "Мария К.", channel: "Telegram", assignee: "Сергей М.", replies: [{ who: "УК", text: "Мастер выезжает.", time: "2026-11-21T19:10:00" }] },
    { id: 1039, title: "Переполненные мусорные контейнеры", category: "Мусор", address: "ул. Кирова, 78", description: "Контейнеры не вывозят 5 дней. Мусор разлетается по двору.", status: "work", stars: 42, comments: 8, date: "2026-11-20T11:30:00", author: "Игорь Н.", channel: "VK", assignee: "Ольга В.", replies: [{ who: "УК", text: "Передано подрядчику ТКО.", time: "2026-11-20T13:00:00" }] },
    { id: 1038, title: "Сломанная детская площадка", category: "Благоустройство", address: "ул. Весенняя, 5", description: "Качели сломаны, у горки острые края. Риск травм у детей.", status: "new", stars: 19, comments: 2, date: "2026-11-22T07:45:00", author: "Елена С.", channel: "Приложение", assignee: null, replies: [] },
    { id: 1035, title: "Проблемы с отоплением в подъезде", category: "ЖКХ", address: "ул. Шахтёров, 33", description: "В подъезде холодно, батареи едва тёплые.", status: "new", stars: 33, comments: 4, date: "2026-11-19T14:20:00", author: "Наталья Р.", channel: "Max", assignee: null, replies: [] },
    { id: 1030, title: "Остановка без павильона", category: "Транспорт", address: "пр. Металлургов, 25", description: "Нет навеса. В дождь пассажирам негде укрыться.", status: "done", stars: 11, comments: 1, date: "2026-11-15T10:00:00", author: "Дмитрий Л.", channel: "Приложение", assignee: "Сергей М.", replies: [{ who: "УК", text: "Павильон установлен.", time: "2026-11-18T12:00:00" }] },
    { id: 1028, title: "Разбитый тротуар у школы", category: "Благоустройство", address: "ул. Дзержинского, 8", description: "Плитка разбита, лужи, скользко.", status: "new", stars: 22, comments: 3, date: "2026-11-18T16:40:00", author: "Анна В.", channel: "Приложение", assignee: null, replies: [] },
    { id: 1025, title: "Нет разметки на пешеходном переходе", category: "Транспорт", address: "ул. Кузнецкая, 3", description: "Разметка стёрлась. Водители не замечают переход.", status: "new", stars: 17, comments: 2, date: "2026-11-17T09:00:00", author: "Павел Г.", channel: "Telegram", assignee: null, replies: [] },
    { id: 1020, title: "Шум от стройки по ночам", category: "Другое", address: "ул. Тухачевского, 14", description: "Работы после 23:00. Жильцы не могут спать.", status: "reject", stars: 8, comments: 1, date: "2026-11-10T21:00:00", author: "Олег Т.", channel: "VK", assignee: "Ирина Смирнова", replies: [{ who: "УК", text: "Режим работ согласован до 22:00.", time: "2026-11-11T10:00:00" }] },
    { id: 1015, title: "Сломанный лифт", category: "ЖКХ", address: "ул. Весенняя, 12", description: "Лифт не работает вторые сутки. В доме есть пожилые жильцы.", status: "work", stars: 36, comments: 6, date: "2026-11-21T08:30:00", author: "Светлана М.", channel: "Приложение", assignee: "Сергей М.", replies: [{ who: "УК", text: "Подрядчик уведомлён.", time: "2026-11-21T09:15:00" }] }
  ]
};
