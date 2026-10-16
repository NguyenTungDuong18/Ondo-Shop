export function cropGeometry(width: number, height: number, zoom: number, x: number, y: number) {
  const side = Math.min(width, height);
  const scale = Math.max(1, zoom);
  const displayWidth = width / side * scale;
  const displayHeight = height / side * scale;
  const offsetX = Math.max(-(displayWidth - 1) / 2, Math.min((displayWidth - 1) / 2, x));
  const offsetY = Math.max(-(displayHeight - 1) / 2, Math.min((displayHeight - 1) / 2, y));
  return {
    displayWidth, displayHeight, offsetX, offsetY,
    sourceX: ((displayWidth - 1) / 2 - offsetX) * side / scale,
    sourceY: ((displayHeight - 1) / 2 - offsetY) * side / scale,
    sourceSize: side / scale,
  };
}
