import {
  asNumber,
  clear,
  el,
  empty,
  field,
  formatNumber,
  formatTime
} from './util.js';

// Single series, one axis, one accent hue: identity never rides on colour here, so the
// card label is the title and there is no legend. Grid and axis stay recessive; the
// hover layer is a crosshair plus a tooltip.
//
// Samples are sticky (docs/concept.md section 5), so they are NOT evenly spaced: each value holds
// until the next sample's `ts`, and the newest holds until its `seen`. That makes a
// step plot the only honest line here — interpolating would invent movement.

const NS = 'http://www.w3.org/2000/svg';

const svgEl = (tag, attrs = {}) =>
{
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, String(value));
  }
  return node;
};

/** Sticky samples -> ascending points, each carrying the span it holds for. */
const toPoints = (samples, params) =>
{
  const ascending = [...samples].reverse();
  const points = [];

  for (let i = 0; i < ascending.length; i += 1) {
    const sample = ascending[i];
    let parsed = sample.value;
    try {
      parsed = JSON.parse(sample.value);
    } catch {
      // a bare scalar
    }

    const number = asNumber(field(parsed, params.field));
    if (number === null) {
      continue;
    }

    const next = ascending[i + 1];
    points.push({
      ts: sample.ts,
      until: next
        ? next.ts
        : Math.max(sample.seen, sample.ts + 1),
      value: number
    });
  }

  return points;
};

const niceBounds = (values, params) =>
{
  let min = Number.isFinite(params.min)
    ? params.min
    : Math.min(...values);
  let max = Number.isFinite(params.max)
    ? params.max
    : Math.max(...values);

  if (min === max) {
    min -= 1;
    max += 1;
  }
  if (!Number.isFinite(params.min) && min > 0 && min < (max - min)) {
    min = 0; // a bar's baseline must be zero, and a near-zero floor may as well be
  }

  return { min, max };
};

export default (node, value, params = {}, ctx = {}) =>
{
  const limit = Number.isFinite(params.limit)
    ? params.limit
    : 200;
  const render = samples => draw(node, samples, params);

  if (typeof ctx.history !== 'function') {
    return empty(node, 'no history');
  }

  ctx.history({ limit, since: params.since }).then(render).catch(() =>
    empty(node, 'no history')
  );
};

const draw = (node, samples, params) =>
{
  const points = toPoints(samples, params);
  if (points.length === 0) {
    return empty(node, 'no history');
  }

  const bars = params.kind === 'bar';
  const box = node.getBoundingClientRect();
  const width = Math.max(120, Math.round(box.width));
  const height = Math.max(60, Math.round(box.height));
  const pad = { top: 8, right: 8, bottom: 16, left: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const { min, max } = niceBounds(points.map(point => point.value), params);
  const t0 = points[0].ts;
  const t1 = Math.max(points[points.length - 1].until, t0 + 1);

  const x = ts => pad.left + ((ts - t0) / (t1 - t0)) * plotW;
  const y = v => pad.top + plotH - ((v - min) / (max - min)) * plotH;

  clear(node);
  const svg = svgEl('svg', {
    class: 'chart',
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    role: 'img',
    'aria-label': `${points.length} samples, latest ${
      points[points.length - 1].value
    }`
  });

  // Recessive reference lines, with the only two numbers on the axis.
  for (const bound of [max, min]) {
    svg.append(svgEl('line', {
      class: 'chart-grid',
      x1: pad.left,
      x2: width - pad.right,
      y1: y(bound),
      y2: y(bound)
    }));
    const text = svgEl('text', {
      class: 'chart-tick',
      x: pad.left - 5,
      y: y(bound) + 3
    });
    text.textContent = formatNumber(bound, params.precision);
    svg.append(text);
  }

  if (bars) {
    for (const point of points) {
      const left = x(point.ts);
      const right = x(point.until);
      const w = Math.max(1, right - left - 2); // 2px surface gap between bars
      svg.append(svgEl('rect', {
        class: 'chart-bar',
        x: left + 1,
        y: y(point.value),
        width: w,
        height: Math.max(1, y(min) - y(point.value)),
        rx: Math.min(4, w / 2)
      }));
    }
  } else {
    // Step path: hold each value until the next sample.
    const parts = [`M ${x(points[0].ts)} ${y(points[0].value)}`];
    for (let i = 1; i < points.length; i += 1) {
      parts.push(`L ${x(points[i].ts)} ${y(points[i - 1].value)}`);
      parts.push(`L ${x(points[i].ts)} ${y(points[i].value)}`);
    }
    const last = points[points.length - 1];
    parts.push(`L ${x(last.until)} ${y(last.value)}`);

    if (params.area !== false) {
      svg.append(svgEl('path', {
        class: 'chart-area',
        d: `${parts.join(' ')} L ${x(last.until)} ${y(min)} L ${
          x(points[0].ts)
        } ${y(min)} Z`
      }));
    }
    svg.append(svgEl('path', { class: 'chart-line', d: parts.join(' ') }));
    svg.append(
      svgEl('circle', {
        class: 'chart-dot',
        cx: x(last.until),
        cy: y(last.value),
        r: 4
      })
    );
  }

  const crosshair = svgEl('line', {
    class: 'chart-crosshair',
    y1: pad.top,
    y2: pad.top + plotH,
    x1: 0,
    x2: 0,
    opacity: 0
  });
  svg.append(crosshair);
  node.append(svg);

  // Hover layer: nearest sample by time, crosshair plus tooltip.
  const tip = el('div', 'chart-tip');
  tip.hidden = true;
  node.append(tip);

  svg.addEventListener('pointermove', event =>
  {
    const rect = svg.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const ts = t0 + ((px - pad.left) / plotW) * (t1 - t0);
    const point = points.findLast(candidate => candidate.ts <= ts) || points[0];

    crosshair.setAttribute('x1', x(point.ts));
    crosshair.setAttribute('x2', x(point.ts));
    crosshair.setAttribute('opacity', 1);

    tip.hidden = false;
    tip.textContent = `${formatNumber(point.value, params.precision)}${
      params.unit || ''
    } · ${formatTime(point.ts)}`;
    tip.style.left = `${Math.min(Math.max(px - 40, 0), width - 120)}px`;
  });

  svg.addEventListener('pointerleave', () =>
  {
    crosshair.setAttribute('opacity', 0);
    tip.hidden = true;
  });
};
