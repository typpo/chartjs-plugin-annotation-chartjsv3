import ChartJsV3, {Element} from 'chart.js-v3';
const {PI, toRadians, toDegrees, toPadding, valueOrDefault} = ChartJsV3.helpers;
import {EPSILON, clamp, scaleValue, rotated, drawBox, drawLabel, measureLabelSize, getRelativePosition, setBorderStyle, setShadowStyle, translate, getElementCenterPoint, inBoxRange, retrieveScaleID, getDimensionByScale} from '../helpers';

const pointInLine = (p1, p2, t) => ({x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y)});
const interpolateX = (y, p1, p2) => pointInLine(p1, p2, Math.abs((y - p1.y) / (p2.y - p1.y))).x;
const interpolateY = (x, p1, p2) => pointInLine(p1, p2, Math.abs((x - p1.x) / (p2.x - p1.x))).y;
const sqr = v => v * v;
const rangeLimit = (mouseX, mouseY, {x, y, x2, y2}, axis) => axis === 'y' ? {start: Math.min(y, y2), end: Math.max(y, y2), value: mouseY} : {start: Math.min(x, x2), end: Math.max(x, x2), value: mouseX};

export default class LineAnnotation extends Element {

  inRange(mouseX, mouseY, axis, useFinalPosition) {
    const hBorderWidth = this.options.borderWidth / 2;
    if (axis !== 'x' && axis !== 'y') {
      const epsilon = sqr(hBorderWidth);
      const point = {mouseX, mouseY};
      return intersects(this, point, epsilon, useFinalPosition) || isOnLabel(this, point, useFinalPosition);
    }
    const limit = rangeLimit(mouseX, mouseY, this.getProps(['x', 'y', 'x2', 'y2'], useFinalPosition), axis);
    return (limit.value >= limit.start - hBorderWidth && limit.value <= limit.end + hBorderWidth) || isOnLabel(this, {mouseX, mouseY}, useFinalPosition, axis);
  }

  getCenterPoint(useFinalPosition) {
    return getElementCenterPoint(this, useFinalPosition);
  }

  draw(ctx) {
    const {x, y, x2, y2, options} = this;

    ctx.save();
    if (!setBorderStyle(ctx, options)) {
      // no border width, then line is not drawn
      return ctx.restore();
    }
    setShadowStyle(ctx, options);
    const angle = Math.atan2(y2 - y, x2 - x);
    const length = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
    const {startOpts, endOpts, startAdjust, endAdjust} = getArrowHeads(this);

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0 + startAdjust, 0);
    ctx.lineTo(length - endAdjust, 0);
    ctx.shadowColor = options.borderShadowColor;
    ctx.stroke();
    drawArrowHead(ctx, 0, startAdjust, startOpts);
    drawArrowHead(ctx, length, -endAdjust, endOpts);
    ctx.restore();
  }

  drawLabel(ctx, chartArea) {
    if (!labelIsVisible(this, false, chartArea)) {
      return;
    }
    const {labelX, labelY, labelCenterX, labelCenterY, labelWidth, labelHeight, labelRotation, labelPadding, labelTextSize, options: {label}} = this;

    ctx.save();
    translate(ctx, {x: labelCenterX, y: labelCenterY}, labelRotation);

    const boxRect = {
      x: labelX,
      y: labelY,
      width: labelWidth,
      height: labelHeight
    };
    drawBox(ctx, boxRect, label);

    const labelTextRect = {
      x: labelX + labelPadding.left + label.borderWidth / 2,
      y: labelY + labelPadding.top + label.borderWidth / 2,
      width: labelTextSize.width,
      height: labelTextSize.height
    };
    drawLabel(ctx, labelTextRect, label);
    ctx.restore();
  }

  resolveElementProperties(chart, options) {
    const scale = chart.scales[options.scaleID];
    const area = translateArea(chart.chartArea, {y: 'top', x: 'left', y2: 'bottom', x2: 'right'});
    let min, max;

    if (scale) {
      min = scaleValue(scale, options.value, NaN);
      max = scaleValue(scale, options.endValue, min);
      if (scale.isHorizontal()) {
        area.x = min;
        area.x2 = max;
      } else {
        area.y = min;
        area.y2 = max;
      }
    } else {
      const xScale = chart.scales[retrieveScaleID(chart.scales, options, 'xScaleID')];
      const yScale = chart.scales[retrieveScaleID(chart.scales, options, 'yScaleID')];

      if (xScale) {
        applyScaleValueToDimension(area, xScale, {min: options.xMin, max: options.xMax, start: xScale.left, end: xScale.right, startProp: 'x', endProp: 'x2'});
      }

      if (yScale) {
        applyScaleValueToDimension(area, yScale, {min: options.yMin, max: options.yMax, start: yScale.bottom, end: yScale.top, startProp: 'y', endProp: 'y2'});
      }
    }
    const {x, y, x2, y2} = area;
    const inside = isLineInArea(area, chart.chartArea);
    const properties = inside
      ? limitLineToArea({x, y}, {x: x2, y: y2}, chart.chartArea)
      : {x, y, x2, y2, width: Math.abs(x2 - x), height: Math.abs(y2 - y)};
    properties.centerX = (x2 + x) / 2;
    properties.centerY = (y2 + y) / 2;

    const label = options.label;
    if (label && label.content) {
      return loadLabelRect(properties, chart, label);
    }
    return properties;
  }
}

LineAnnotation.id = 'lineAnnotation';

const arrowHeadsDefaults = {
  backgroundColor: undefined,
  backgroundShadowColor: undefined,
  borderColor: undefined,
  borderDash: undefined,
  borderDashOffset: undefined,
  borderShadowColor: undefined,
  borderWidth: undefined,
  display: undefined,
  fill: undefined,
  length: undefined,
  shadowBlur: undefined,
  shadowOffsetX: undefined,
  shadowOffsetY: undefined,
  width: undefined
};

LineAnnotation.defaults = {
  adjustScaleRange: true,
  arrowHeads: {
    display: false,
    end: Object.assign({}, arrowHeadsDefaults),
    fill: false,
    length: 12,
    start: Object.assign({}, arrowHeadsDefaults),
    width: 6
  },
  borderDash: [],
  borderDashOffset: 0,
  borderShadowColor: 'transparent',
  borderWidth: 2,
  display: true,
  endValue: undefined,
  label: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    backgroundShadowColor: 'transparent',
    borderCapStyle: 'butt',
    borderColor: 'black',
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: 'miter',
    borderRadius: 6,
    borderShadowColor: 'transparent',
    borderWidth: 0,
    color: '#fff',
    content: null,
    display: false,
    drawTime: undefined,
    enabled: false,
    font: {
      family: undefined,
      lineHeight: undefined,
      size: undefined,
      style: undefined,
      weight: 'bold'
    },
    height: undefined,
    padding: 6,
    position: 'center',
    rotation: 0,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    textAlign: 'center',
    textStrokeColor: undefined,
    textStrokeWidth: 0,
    width: undefined,
    xAdjust: 0,
    yAdjust: 0
  },
  scaleID: undefined,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  value: undefined,
  xMax: undefined,
  xMin: undefined,
  xScaleID: undefined,
  yMax: undefined,
  yMin: undefined,
  yScaleID: undefined
};

LineAnnotation.descriptors = {
  arrowHeads: {
    start: {
      _fallback: true
    },
    end: {
      _fallback: true
    },
    _fallback: true
  }
};

LineAnnotation.defaultRoutes = {
  borderColor: 'color'
};

function isLineInArea({x, y, x2, y2}, {top, right, bottom, left}) {
  return !(
    (x < left && x2 < left) ||
    (x > right && x2 > right) ||
    (y < top && y2 < top) ||
    (y > bottom && y2 > bottom)
  );
}

function limitPointToArea({x, y}, p2, {top, right, bottom, left}) {
  if (x < left) {
    y = interpolateY(left, {x, y}, p2);
    x = left;
  }
  if (x > right) {
    y = interpolateY(right, {x, y}, p2);
    x = right;
  }
  if (y < top) {
    x = interpolateX(top, {x, y}, p2);
    y = top;
  }
  if (y > bottom) {
    x = interpolateX(bottom, {x, y}, p2);
    y = bottom;
  }
  return {x, y};
}

function limitLineToArea(p1, p2, area) {
  const {x, y} = limitPointToArea(p1, p2, area);
  const {x: x2, y: y2} = limitPointToArea(p2, p1, area);
  return {x, y, x2, y2, width: Math.abs(x2 - x), height: Math.abs(y2 - y)};
}

function intersects(element, {mouseX, mouseY}, epsilon = EPSILON, useFinalPosition) {
  // Adapted from https://stackoverflow.com/a/6853926/25507
  const {x: x1, y: y1, x2, y2} = element.getProps(['x', 'y', 'x2', 'y2'], useFinalPosition);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = sqr(dx) + sqr(dy);
  const t = lenSq === 0 ? -1 : ((mouseX - x1) * dx + (mouseY - y1) * dy) / lenSq;
  let xx, yy;
  if (t < 0) {
    xx = x1;
    yy = y1;
  } else if (t > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + t * dx;
    yy = y1 + t * dy;
  }
  return (sqr(mouseX - xx) + sqr(mouseY - yy)) <= epsilon;
}

/**
 * @param {boolean} useFinalPosition - use the element's animation target instead of current position
 * @param {top, right, bottom, left} [chartArea] - optional, area of the chart
 * @returns {boolean} true if the label is visible
 */
function labelIsVisible(element, useFinalPosition, chartArea) {
  const labelOpts = element.options.label;
  if (!labelOpts || !labelOpts.display) {
    return false;
  }
  return !chartArea || isLineInArea(element.getProps(['x', 'y', 'x2', 'y2'], useFinalPosition), chartArea);
}

function isOnLabel(element, {mouseX, mouseY}, useFinalPosition, axis) {
  if (!labelIsVisible(element, useFinalPosition)) {
    return false;
  }
  const {labelX, labelY, labelX2, labelY2, labelCenterX, labelCenterY, labelRotation} = element.getProps(['labelX', 'labelY', 'labelX2', 'labelY2', 'labelCenterX', 'labelCenterY', 'labelRotation'], useFinalPosition);
  const {x, y} = rotated({x: mouseX, y: mouseY}, {x: labelCenterX, y: labelCenterY}, -toRadians(labelRotation));
  return inBoxRange({x, y}, {x: labelX, y: labelY, x2: labelX2, y2: labelY2}, axis, element.options.label.borderWidth);
}

function translateArea(source, mapping) {
  const ret = {};
  const keys = Object.keys(mapping);
  const read = prop => valueOrDefault(source[prop], source[mapping[prop]]);
  for (const prop of keys) {
    ret[prop] = read(prop);
  }
  return ret;
}

function applyScaleValueToDimension(area, scale, options) {
  const dim = getDimensionByScale(scale, options);
  area[options.startProp] = dim.start;
  area[options.endProp] = dim.end;
}

function loadLabelRect(properties, chart, options) {
  const borderWidth = options.borderWidth;
  const padding = toPadding(options.padding);
  const textSize = measureLabelSize(chart.ctx, options);
  const width = textSize.width + padding.width + borderWidth;
  const height = textSize.height + padding.height + borderWidth;
  const labelRect = calculateLabelPosition(properties, options, {width, height, padding}, chart.chartArea);
  properties.labelX = labelRect.x;
  properties.labelY = labelRect.y;
  properties.labelX2 = labelRect.x2;
  properties.labelY2 = labelRect.y2;
  properties.labelCenterX = labelRect.centerX;
  properties.labelCenterY = labelRect.centerY;
  properties.labelWidth = labelRect.width;
  properties.labelHeight = labelRect.height;
  properties.labelRotation = toDegrees(labelRect.rotation);
  properties.labelPadding = padding;
  properties.labelTextSize = textSize;
  return properties;
}

function calculateAutoRotation(properties) {
  const {x, y, x2, y2} = properties;
  const rotation = Math.atan2(y2 - y, x2 - x);
  // Flip the rotation if it goes > PI/2 or < -PI/2, so label stays upright
  return rotation > PI / 2 ? rotation - PI : rotation < PI / -2 ? rotation + PI : rotation;
}

function calculateLabelPosition(properties, label, sizes, chartArea) {
  const {width, height, padding} = sizes;
  const {xAdjust, yAdjust} = label;
  const p1 = {x: properties.x, y: properties.y};
  const p2 = {x: properties.x2, y: properties.y2};
  const rotation = label.rotation === 'auto' ? calculateAutoRotation(properties) : toRadians(label.rotation);
  const size = rotatedSize(width, height, rotation);
  const t = calculateT(properties, label, {labelSize: size, padding}, chartArea);
  const pt = pointInLine(p1, p2, t);
  const xCoordinateSizes = {size: size.w, min: chartArea.left, max: chartArea.right, padding: padding.left};
  const yCoordinateSizes = {size: size.h, min: chartArea.top, max: chartArea.bottom, padding: padding.top};
  const centerX = adjustLabelCoordinate(pt.x, xCoordinateSizes) + xAdjust;
  const centerY = adjustLabelCoordinate(pt.y, yCoordinateSizes) + yAdjust;
  return {
    x: centerX - (width / 2),
    y: centerY - (height / 2),
    x2: centerX + (width / 2),
    y2: centerY + (height / 2),
    centerX,
    centerY,
    width,
    height,
    rotation
  };
}

function rotatedSize(width, height, rotation) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    w: Math.abs(width * cos) + Math.abs(height * sin),
    h: Math.abs(width * sin) + Math.abs(height * cos)
  };
}

function calculateT(properties, label, sizes, chartArea) {
  let t;
  const space = spaceAround(properties, chartArea);
  if (label.position === 'start') {
    t = calculateTAdjust({w: properties.x2 - properties.x, h: properties.y2 - properties.y}, sizes, label, space);
  } else if (label.position === 'end') {
    t = 1 - calculateTAdjust({w: properties.x - properties.x2, h: properties.y - properties.y2}, sizes, label, space);
  } else {
    t = getRelativePosition(1, label.position);
  }
  return t;
}

function calculateTAdjust(lineSize, sizes, label, space) {
  const {labelSize, padding} = sizes;
  const lineW = lineSize.w * space.dx;
  const lineH = lineSize.h * space.dy;
  const x = (lineW > 0) && ((labelSize.w / 2 + padding.left - space.x) / lineW);
  const y = (lineH > 0) && ((labelSize.h / 2 + padding.top - space.y) / lineH);
  return clamp(Math.max(x, y), 0, 0.25);
}

function spaceAround(properties, chartArea) {
  const {x, x2, y, y2} = properties;
  const t = Math.min(y, y2) - chartArea.top;
  const l = Math.min(x, x2) - chartArea.left;
  const b = chartArea.bottom - Math.max(y, y2);
  const r = chartArea.right - Math.max(x, x2);
  return {
    x: Math.min(l, r),
    y: Math.min(t, b),
    dx: l <= r ? 1 : -1,
    dy: t <= b ? 1 : -1
  };
}

function adjustLabelCoordinate(coordinate, labelSizes) {
  const {size, min, max, padding} = labelSizes;
  const halfSize = size / 2;
  if (size > max - min) {
    // if it does not fit, display as much as possible
    return (max + min) / 2;
  }
  if (min >= (coordinate - padding - halfSize)) {
    coordinate = min + padding + halfSize;
  }
  if (max <= (coordinate + padding + halfSize)) {
    coordinate = max - padding - halfSize;
  }
  return coordinate;
}

function getArrowHeads(line) {
  const options = line.options;
  const arrowStartOpts = options.arrowHeads && options.arrowHeads.start;
  const arrowEndOpts = options.arrowHeads && options.arrowHeads.end;
  return {
    startOpts: arrowStartOpts,
    endOpts: arrowEndOpts,
    startAdjust: getLineAdjust(line, arrowStartOpts),
    endAdjust: getLineAdjust(line, arrowEndOpts)
  };
}

function getLineAdjust(line, arrowOpts) {
  if (!arrowOpts || !arrowOpts.display) {
    return 0;
  }
  const {length, width} = arrowOpts;
  const adjust = line.options.borderWidth / 2;
  const p1 = {x: length, y: width + adjust};
  const p2 = {x: 0, y: adjust};
  return Math.abs(interpolateX(0, p1, p2));
}

function drawArrowHead(ctx, offset, adjust, arrowOpts) {
  if (!arrowOpts || !arrowOpts.display) {
    return;
  }
  const {length, width, fill, backgroundColor, borderColor} = arrowOpts;
  const arrowOffsetX = Math.abs(offset - length) + adjust;
  ctx.beginPath();
  setShadowStyle(ctx, arrowOpts);
  setBorderStyle(ctx, arrowOpts);
  ctx.moveTo(arrowOffsetX, -width);
  ctx.lineTo(offset + adjust, 0);
  ctx.lineTo(arrowOffsetX, width);
  if (fill === true) {
    ctx.fillStyle = backgroundColor || borderColor;
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
  } else {
    ctx.shadowColor = arrowOpts.borderShadowColor;
  }
  ctx.stroke();
}
