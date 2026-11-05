export const CROPS = [
  { id: 'wheat', name: 'Пшениця', group: 'Зернові', groupKey: 'grains' },
  { id: 'corn', name: 'Кукурудза', group: 'Зернові', groupKey: 'grains' },
  { id: 'sunflower', name: 'Соняшник', group: 'Олійні', groupKey: 'oilseeds' },
  { id: 'soy', name: 'Соя', group: 'Бобові', groupKey: 'legumes' },
  { id: 'rapeseed', name: 'Ріпак', group: 'Олійні', groupKey: 'oilseeds' },
  { id: 'barley', name: 'Ячмінь', group: 'Зернові', groupKey: 'grains' },
  { id: 'peas', name: 'Горох', group: 'Бобові', groupKey: 'legumes' },
  { id: 'buckwheat', name: 'Гречка', group: "Круп'яні", groupKey: 'cereals' },
];

export const getCropName = (id, t) => {
  const item = CROPS.find((c) => c.id === id);
  if (!item) return null;
  return t ? t(`crops.${item.id}`, item.name) : item.name;
};

export const getLocalizedCrops = (t) => {
  if (!t) return CROPS;
  return CROPS.map((c) => ({
    ...c,
    name: t(`crops.${c.id}`, c.name),
    group: t(`crops.groups.${c.groupKey}`, c.group),
  }));
};
