const PREFIX = "curio.";

/** Everything CURIO keeps on this device, as one JSON document. */
export function collectDeviceData(storage: Storage = window.localStorage, now = new Date()): { app: "curio"; exportedAt: string; data: Record<string, unknown> } {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw) as unknown;
    } catch {
      data[key] = raw;
    }
  }
  return { app: "curio", exportedAt: now.toISOString(), data };
}

/** Save the device data as curio-data-YYYY-MM-DD.json. Returns false if storage is unavailable. */
export function downloadDeviceData(): boolean {
  let doc: ReturnType<typeof collectDeviceData>;
  try {
    doc = collectDeviceData();
  } catch {
    return false;
  }
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `curio-data-${doc.exportedAt.slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
