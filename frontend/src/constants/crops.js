export const CROPS = [
  { id: 'wheat', name: 'Пшениця', group: 'Зернові' },
  { id: 'corn', name: 'Кукурудза', group: 'Зернові' },
  { id: 'sunflower', name: 'Соняшник', group: 'Олійні' },
  { id: 'soy', name: 'Соя', group: 'Бобові' },
  { id: 'rapeseed', name: 'Ріпак', group: 'Олійні' },
  { id: 'barley', name: 'Ячмінь', group: 'Зернові' },
  { id: 'peas', name: 'Горох', group: 'Бобові' },
  { id: 'buckwheat', name: 'Гречка', group: "Круп'яні" },
];

export const getCropName = (id) => CROPS.find((c) => c.id === id)?.name ?? null;
