// Ground truth: any Bluetooth LE heart-rate monitor speaking the standard
// Heart Rate Service (0x180D) — Polar H10/Verity, Garmin HRM, Wahoo TICKR,
// Coros/Garmin/Polar watches in "broadcast HR" mode. Chrome/Edge only.

export interface HeartRateMeasurement {
  bpm: number;
  /** Beat-to-beat intervals in seconds, when the sensor sends them (chest straps do). */
  rrSec: number[];
  contact: boolean | null;
}

/** Parses the Heart Rate Measurement characteristic (0x2A37). */
export function parseHeartRateMeasurement(view: DataView): HeartRateMeasurement {
  const flags = view.getUint8(0);
  let offset = 1;
  let bpm: number;
  if (flags & 0x01) {
    bpm = view.getUint16(offset, true);
    offset += 2;
  } else {
    bpm = view.getUint8(offset);
    offset += 1;
  }
  const contact = flags & 0x04 ? Boolean(flags & 0x02) : null;
  if (flags & 0x08) offset += 2; // energy expended
  const rrSec: number[] = [];
  if (flags & 0x10) {
    for (; offset + 1 < view.byteLength; offset += 2) rrSec.push(view.getUint16(offset, true) / 1024);
  }
  return { bpm, rrSec, contact };
}

export interface StrapSample extends HeartRateMeasurement {
  t: number; // performance.now() seconds when the notification arrived
}

// Minimal Web Bluetooth typings; the DOM lib doesn't ship them.
interface BtCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BtCharacteristic>;
}
interface BtDevice extends EventTarget {
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<{ getPrimaryService(s: string): Promise<{ getCharacteristic(c: string): Promise<BtCharacteristic> }> }>;
    disconnect(): void;
  };
}
interface Bluetooth {
  requestDevice(opts: { filters: { services: string[] }[] }): Promise<BtDevice>;
}

export function bluetoothAvailable(): boolean {
  return "bluetooth" in navigator;
}

export class HeartRateStrap {
  private device: BtDevice | null = null;
  name = "";

  constructor(
    private onSample: (s: StrapSample) => void,
    private onDisconnect: () => void,
  ) {}

  async connect(): Promise<void> {
    const bt = (navigator as unknown as { bluetooth: Bluetooth }).bluetooth;
    this.device = await bt.requestDevice({ filters: [{ services: ["heart_rate"] }] });
    this.name = this.device.name ?? "heart-rate sensor";
    this.device.addEventListener("gattserverdisconnected", () => this.onDisconnect());
    const server = await this.device.gatt!.connect();
    const service = await server.getPrimaryService("heart_rate");
    const ch = await service.getCharacteristic("heart_rate_measurement");
    ch.addEventListener("characteristicvaluechanged", () => {
      if (!ch.value) return;
      this.onSample({ t: performance.now() / 1000, ...parseHeartRateMeasurement(ch.value) });
    });
    await ch.startNotifications();
  }

  disconnect(): void {
    this.device?.gatt?.disconnect();
  }
}
