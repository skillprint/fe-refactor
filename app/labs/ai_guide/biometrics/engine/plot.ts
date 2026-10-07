// Minimal canvas line plots, themed from CSS custom properties.

export interface Line {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  color: string;
  dashed?: boolean;
  width?: number;
}

export interface PlotOptions {
  xRange?: [number, number];
  yRange?: [number, number];
  yLabel?: (v: number) => string;
  normalise?: boolean; // scale each line to its own min/max (for pulse waveforms)
}

// The colours are page-scoped tokens, so read them where the canvas sits.
const cssOf = (el: Element) => {
  const style = getComputedStyle(el);
  return (name: string) => style.getPropertyValue(name).trim();
};

export function plot(canvas: HTMLCanvasElement, lines: Line[], opt: PlotOptions = {}): void {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d")!;
  const css = cssOf(canvas);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const padL = opt.yLabel ? 36 : 6, padR = 6, padT = 6, padB = 6;
  const all = lines.filter((l) => l.x.length > 1);
  if (!all.length) return;
  let [x0, x1] = opt.xRange ?? [Infinity, -Infinity];
  if (!opt.xRange) for (const l of all) { x0 = Math.min(x0, l.x[0]); x1 = Math.max(x1, l.x[l.x.length - 1]); }
  let [y0, y1] = opt.yRange ?? [Infinity, -Infinity];
  if (!opt.yRange && !opt.normalise) {
    for (const l of all) for (let i = 0; i < l.y.length; i++) if (Number.isFinite(l.y[i])) { y0 = Math.min(y0, l.y[i]); y1 = Math.max(y1, l.y[i]); }
    const pad = (y1 - y0) * 0.1 || 1;
    y0 -= pad; y1 += pad;
  }

  ctx.strokeStyle = css("--bio-grid");
  ctx.fillStyle = css("--ui-muted");
  ctx.font = "10px ui-monospace, monospace";
  ctx.lineWidth = 1;
  if (opt.yLabel && !opt.normalise) {
    for (let k = 0; k <= 3; k++) {
      const v = y0 + ((y1 - y0) * k) / 3;
      const py = h - padB - ((v - y0) / (y1 - y0)) * (h - padT - padB);
      ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(w - padR, py); ctx.stroke();
      ctx.fillText(opt.yLabel(v), 2, py + 3);
    }
  }

  for (const l of all) {
    let ly0 = y0, ly1 = y1;
    if (opt.normalise) {
      ly0 = Infinity; ly1 = -Infinity;
      for (let i = 0; i < l.y.length; i++) { ly0 = Math.min(ly0, l.y[i]); ly1 = Math.max(ly1, l.y[i]); }
      if (ly1 === ly0) ly1 = ly0 + 1;
    }
    ctx.strokeStyle = l.color;
    ctx.lineWidth = l.width ?? 1.5;
    ctx.setLineDash(l.dashed ? [4, 3] : []);
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i < l.x.length; i++) {
      if (!Number.isFinite(l.y[i])) { pen = false; continue; }
      const px = padL + ((l.x[i] - x0) / (x1 - x0)) * (w - padL - padR);
      const py = h - padB - ((l.y[i] - ly0) / (ly1 - ly0)) * (h - padT - padB);
      if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      pen = true;
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
