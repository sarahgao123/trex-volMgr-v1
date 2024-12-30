import L from 'leaflet';

const COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
];

export function getMarkerIcon(index: number) {
  const color = COLORS[index % COLORS.length];
  
  return L.divIcon({
    html: `
      <div style="
        width: 25px;
        height: 25px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">${index + 1}</div>
    `,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}