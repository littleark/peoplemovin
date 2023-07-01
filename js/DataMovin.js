/*!
 * datamovin JavaScript Library v0.4
 * http://peoplemov.in
 *
 * (c) Copyright 2011-2023, Carlo Zapponi
 * Temporary licensed under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Date: Sun Aug 01 00:05:56 2011 (CEST) +0200
 */

function DataMovin() {

  var self = this,
    requestId = null,
    canvas,
    ctx;

  var src = {},
    dst = {},
    lookup = { src: [], dst: [] },
    current = { src: [], dst: [], beziers: [] },
    label_reference = null;

  var margins = { left: 30, top: 0, right: 30, bottom: 0 },
    padding = { left: 0, right: 0 },
    step = 10,
    box_w = 15,
    orientation = 'vertical';

  var colors = new Colors();
  var legend = {};

  var areas = { src: {}, dst: {} };

  var WIDTH,
    HEIGHT;

  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  var devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1,

    ratio = devicePixelRatio / backingStoreRatio;

  this.init = function(canvas, options) {
    if (!!document.createElement('canvas').getContext) {

      label_reference = options.labels;

      var heights = initFlows(options.flows)
      if (!heights)
        return false;


      step = options.step || step;
      box_w = options.box_w || box_w;
      margins = options.margins || margins;



      padding = {
        left: (heights.to - heights.from > 0) ? (heights.to - heights.from) / 2 : 0,
        right: (heights.from - heights.to > 0) ? (heights.from - heights.to) / 2 : 0
      };

      // canvas=document.createElement("canvas");
      canvas = document.getElementById("flows");
      const flows_container = document.getElementById('flows_container');
      canvas.width = flows_container.offsetWidth;
      ctx = canvas.getContext("2d");

      ctx.lineCap = 'butt';

      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;



      orientation = options.orientation || orientation;
      if (orientation == 'horizontal') {
        canvas.height = canvas.width;
        canvas.width = (heights.from + margins.top + margins.bottom);
      } else {
        canvas.height = (heights.from + margins.top + margins.bottom);
        //+100 fix a bug in chrome when using highDPI scale deviceRatio
        canvas.height += 100;
      }

      WIDTH = canvas.width;
      HEIGHT = canvas.height;

      this.ctx = ctx;
      this.margins = margins;



      if (typeof auto === 'undefined') {
        auto = true;
      }
      if (auto && devicePixelRatio !== backingStoreRatio) {
        canvas.width = WIDTH * ratio;
        canvas.height = HEIGHT * ratio;

        ctx.fill = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.style.setProperty("width", (WIDTH) + "px");
        canvas.style.setProperty("height", (HEIGHT) + "px");

        ctx.scale(ratio, ratio);

      }

      return this;
    } else {
      return null;
    }
  }
  this.showCountries = function(countries) {
    if (countries.length) {
      var country = countries.shift();
      try {
        this.drawInFlow(country);
      } catch (e) {
        this.warn("drawOutFlow", country)
      }

      setTimeout(function() {
        showCountries(countries)
      }, 2000);
    }
  }
  this.getPointInfo = function(point_name, type) {
    var point = {};
    switch (type) {
      case 'src':
        point = src[point_name];
        break;
      case 'dst':
        point = dst[point_name];
        break;
    }
    if (!point)
      return null;
    return {
      name: point_name,
      x: point.x,
      y: point.y,
      w: point.w,
      h: point.h,
      type: type
    }
  }
  this.getCurrent = function() {
    return current;
  }
  this.checkCurrent = function(point, type) {
    return (current[type].length > 0 && current[type][0] == point);
  }
  function initFlows(flows) {
    if (!flows)
      return null;

    var src_values = { max: 0, min: 10000 },
      dst_values = { max: 0, min: 1 };

    for (var s in flows) {
      var source = flows[s];
      source.flow = 0;
      for (var d in source.flows) {
        source.flow += source.flows[d].v;
        if (!dst[d])
          dst[d] = { flow: 0, flows: {} };
        dst[d].flow += source.flows[d].v;
        dst[d].flows[s] = {
          flow: source.flows[d].v,
          i: {
            q: source.flows[d].f,
            f: s,
            t: d
          }
        };
        dst_values.max = Math.max(dst_values.max, dst[d].flow);
        source.flows[d] = {
          flow: source.flows[d].v,
          i: {
            q: source.flows[d].f,
            f: s,
            t: d
          }
        };
      }
      src[s] = source;

      src_values.max = Math.max(source.flow, src_values.max);
      src_values.min = Math.min(source.flow, src_values.min);
    }

    var min = Math.min(src_values.min, dst_values.min);
    var max = Math.max(src_values.max, dst_values.max);
    console.log(`[${min},${max}]`)
    const colorScale = d3.scaleLinear().range([0, 1]).domain([min, max / 10]);
    const getHSL = (rgb) => {
      const hsl = d3.hsl(rgb);
      return `${hsl.h},${hsl.s * 100}%,${hsl.l * 100}%`;
    }
    var tot_from = 0, tot_to = 0;
    for (var s in src) {
      // src[s].color = colors.getHSL(Math.round(Math.map(src[xs].flow, min, max, 110, 10)));
      // console.log(s, src[s].flow, colorScale(src[s].flow))
      // src[s].color = getHSL(d3.interpolateReds(colorScale(src[s].flow))); // colors.getHSL(Math.round(logscale(src[s].flow, 0, max / 2, 120, 1)));
      src[s].color = colors.getHSL(Math.round(logscale(src[s].flow, 0, max / 2, 120, 1)));
      tot_from += src[s].flow + step;
    }
    for (var d in dst) {
      //dst[d].color=colors.getColor(Math.round(Math.map(dst[d].flow,dst_values.min,dst_values.max,50,colors.length-50)));
      dst[d].color = colors.getHSL(Math.round(Math.map(dst[d].flow, min, max, 110, 10)));
      // dst[d].color = getHSL(d3.interpolateReds(colorScale(dst[d].flow))); // colors.getHSL(Math.round(logscale(dst[d].flow, 0, max / 2, 120, 1)));
      tot_to += dst[d].flow + step;
    }
    dst = iterateSorted(dst, label_reference);


    legend = {
      src_min: 0,
      src_max: max / 2,
      dst_min: 120,
      dst_max: 1
    }

    return { from: tot_from, to: tot_to };
  }
  function logscale(value, src_min, src_max, dst_min, dst_max) {

    //return Math.map(value,src_min,src_max,dst_min,dst_max)

    // value will be between src_min and src_max
    var minp = src_min;
    var maxp = src_max;

    // The result should be between dst_min an dst_max
    var minv = Math.log(dst_min);
    var maxv = Math.log(dst_max);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (value - minp));
  }
  this.addLegend = function() {

    var x = 100,
      y = 20,
      w = 100,
      h = 20;

    var color_steps = 20;

    var c = (function() {
      var c = [];

      var step = (legend.src_max - legend.src_min) / color_steps;

      for (var i = 0; i < color_steps; i++) {
        c.push(
          colors.getHSL(Math.round(logscale(legend.src_min + step * i, 0, legend.src_max, legend.dst_min, legend.dst_max)))
        );
      }

      return c;
    }());

    ctx.save();
    var g = ctx.createLinearGradient(x, y, x + w, y + h);

    for (var i = 0; i < color_steps; i++) {
      g.addColorStop(i / color_steps, "hsl(" + c[i] + ")")
    }

    ctx.fillStyle = g;
    ctx.fillRect(100, 20, 100, 20);

    ctx.restore();
  }
  function drawBoxes(boxes, start_x, start_y, labels) {
    var index = 0, __y = start_y;
    console.log('BOXES', boxes)
    for (var i in boxes) {
      var s = boxes[i];
      lookup[labels.type][Math.floor(__y) - Math.floor(step / 2)] = i;
      if (!boxes[i].y)
        boxes[i].y = __y;
      if (!boxes[i].x)
        boxes[i].x = start_x;
      //drawBox(start_x, __y, box_w, s.flow,{fill: "rgb("+s.color+")", stroke: "#f00", opacity: 1,"stroke-width":0});
      drawBox(start_x, __y, box_w, s.flow, { fill: "hsl(" + s.color + ")", stroke: "#f00", opacity: 1, "stroke-width": 0 });
      if (labels)
        drawLabel(i, start_x, __y, { w: box_w, h: s.flow }, labels)
      for (var j in s.flows) {

        var to = boxes[i].flows[j];
        to.x = start_x;
        to.y = __y;
        to.w = box_w;
        __y += to.flow;

      }
      __y += step;
      boxes[i].w = box_w;
      boxes[i].h = Math.ceil(s.flow);
    }
  }
  function drawBoxesHorizontal(boxes, start_x, start_y, labels) {
    var index = 0, __x = start_x, __y = start_y;

    for (var i in boxes) {
      var s = boxes[i];
      lookup[labels.type][Math.round(__x)] = i;
      if (!boxes[i].x)
        boxes[i].x = __x;
      if (!boxes[i].y)
        boxes[i].y = start_y;
      drawBox(__x, start_y, s.flow, box_w, { fill: "rgb(" + s.color + ")", stroke: "#f00", opacity: 1, "stroke-width": 0 });
      if (labels)
        drawLabel(i, __x, start_y, { w: s.flow, h: box_w }, labels)
      for (var j in s.flows) {

        var to = boxes[i].flows[j];
        to.y = __y;
        to.x = __x;
        to.w = box_w;
        __x += to.flow;

      }
      __x += step;
      boxes[i].w = s.flow;
      boxes[i].h = box_w;
    }
  }
  this.lookUp = function(y, lk_table_name) {
    var lk_table = lookup[lk_table_name],
      i = y;
    //for(var i=y;i>=0;i--) {
    while (i--) {
      if (lk_table[i]) {
        return lk_table[i];
      }
    }
  };
  this.getAreas = function() {
    return areas;
  }
  this.getCanvas = function() {
    return ctx.canvas;
  };
  this.getRatio = function() {
    return ratio;
  };
  this.getOrientation = function() {
    return orientation;
  }
  this.drawSources = function() {

    var x, y;
    switch (orientation) {
      case 'vertical':
        x = margins.left;
        y = margins.top + padding.left;

        //areas.src={x1:x,y1:y,x2:x+box_w};
        areas.src = { x1: 0, y1: y, x2: x + box_w };

        drawBoxes(src, x, y, { align: "left", valign: "center", orientation: orientation, type: "src" });
        break;
      case 'horizontal':
        x = margins.top;
        y = margins.top + padding.left;

        areas.src = { x: x, y1: y, y2: y + box_w };

        drawBoxesHorizontal(src, x, y, { align: "center", valign: "top", orientation: orientation, type: "src" });
        break;
    }

  }
  this.drawDestinations = function() {

    var x, y;

    switch (orientation) {
      case 'vertical':
        x = WIDTH - margins.right - box_w;
        y = margins.top + padding.right;

        //areas.dst={x1:x,y1:y,x2:x+box_w};
        areas.dst = { x1: x, y1: y, x2: WIDTH };

        drawBoxes(dst, x, y, { align: "right", valign: "center", orientation: orientation, type: "dst" });
        break;
      case 'horizontal':
        x = 0;///margins.left;
        y = HEIGHT - margins.bottom - box_w;

        areas.dst = { x1: x, y1: y, y2: y + box_w };

        drawBoxesHorizontal(dst, x, y, { align: "center", valign: "bottom", orientation: orientation, type: "dst" });
        break;
    }

  }
  this.drawFlowFromTo = function(from, to, clean) {
    // console.log('FROM', from, 'TO', to)
    var __from = src[from].flows[to],
      __to = dst[to].flows[from];

    if (clean) {
      this.clean();
      current.src.push(from);
      current.dst.push(to);
    }

    var info = {
      color: src[from].color,
      color2: dst[to].color,
      "stroke-width": __from.flow,
      flow: __from.i
    };

    if (orientation == 'horizontal') {
      drawCurve(__from.x + __from.flow / 2, __from.y + __from.w, __to.x + __from.flow / 2, __to.y, info);
    } else {
      drawCurve(__from.x + __from.w, __from.y + __from.flow / 2, __to.x, __to.y + __from.flow / 2, info);
    }

  }
  const drawOutFlow = (flows, point, callback) => {
    console.log('FLOWS', flows)
    flows.forEach(c => this.drawFlowFromTo(point, c));
    callback();
    // if (flows.length) {
    //   var c = flows.shift();
    //   self.drawFlowFromTo(point, c);

    //   requestId = requestAnimationFrame(function() {
    //   drawOutFlow(flows, point, callback)
    //   });

    // } else {
    //   callback();
    // }
  }
  this.drawOutFlow = function(point, clean) {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
      requestId = null;
    }
    if (clean)
      this.clean();
    var flows = [];
    for (var c in src[point].flows) {
      flows.push(c);
    }
    console.log('DRAW OUT FLOW')
    console.log('CURRENT', current)
    console.log('POINT', point)
    drawOutFlow(flows, point, function() {
      current.src.push(point);
    });
  }
  const drawInFlow = (flows, point, callback) => {
    console.log('FLOWS', flows)
    flows.forEach(c => this.drawFlowFromTo(c, point));
    callback();
    // if (flows.length) {
    //   var c = flows.shift();
    //   self.drawFlowFromTo(c, point);
    //   requestId = requestAnimationFrame(function r() {
    //     drawInFlow(flows, point, callback)
    //   });
    // } else {
    //   callback();
    // }

  }
  this.drawInFlow = function(point, clean) {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
      requestId = null;
    }
    if (clean)
      this.clean();
    var flows = [];
    if (dst[point] && dst[point].flows) {
      for (var c in dst[point].flows) {
        flows.push(c);
      }
      drawInFlow(flows, point, function() {
        current.dst.push(point);
      });
    }
  }

  this.animate = function() {
    console.log('ANIMATE')
    var points = (function() {
      var c = [];
      for (var s in src) {
        c.push(s);
      }
      return c;
    }()),
      points_index = 0;

    (function loop() {
      if (src[points[points_index]] && src[points[points_index]].flows) {
        for (var t in src[points[points_index]].flows) {
          self.drawFlowFromTo(points[points_index], t)
        }
        points_index++;
        // setTimeout(loop, 1000)
        console.log('LOOP')
        loop();
      }

    }());
  }
  function drawBox(x, y, w, h, options) {
    ctx.save();
    ctx.fillStyle = options.fill;
    ctx.fillRect(x, y - 0.5, w, h + 1);
    ctx.restore();
  }
  /*
    x,y => src
    zx,zy => dest
    ax,ay => src control point
    bx,by => dest control point
  */
  function drawCurve(x, y, zx, zy, info) {
    var _ctx = (info.ctx) ? info.ctx : ctx;

    //console.log(_ctx)

    x = Math.round(x);
    y = Math.round(y);
    zx = Math.round(zx);
    zy = Math.round(zy);
    //_ctx.save();
    if (info.color2) {
      var g = _ctx.createLinearGradient(x, y, zx, zy);
      g.addColorStop(0, "hsla(" + info.color + ",0.75)");
      g.addColorStop(1, "hsla(" + info.color2 + ",0.75)");
      _ctx.strokeStyle = g;
    } else {
      _ctx.strokeStyle = "hsla(" + info.color + ",0.75)";
    }
    _ctx.lineWidth = (info['stroke-width'] > 1 ? info['stroke-width'] : 0.5);

    _ctx.beginPath();


    if (orientation == 'horizontal') {
      _ctx.moveTo(x, y)
      _ctx.bezierCurveTo(
        x, Math.round((y + (zy - y) / 1.5)),
        zx, Math.round((zy - (zy - y) / 1.5)),
        zx, zy
      );
    } else {
      /*
      _ctx.moveTo(x,y);
      _ctx.bezierCurveTo(
        Math.round(zx-(zx-x)/2), y,
        Math.round(x+(zx-x)/2), zy,
        zx, zy
      );
      */
      splitBezier(_ctx, x, y, zx, zy);
      current.beziers.push(
        {
          b: [
            {
              x: x,
              y: y
            },
            {
              x: Math.round(zx - (zx - x) / 2),
              y: y
            },
            {
              x: Math.round(x + (zx - x) / 2),
              y: zy
            },
            {
              x: zx,
              y: zy
            }
          ],
          info: info
        }
      );
    }
    _ctx.stroke();
    //_ctx.closePath();
    //_ctx.restore();
  }
  this.drawCurve = function(x, y, zx, zy, info) {
    drawCurve(x, y, zx, zy, info)
  }
  this.findBezier = function(x, y) {
    var point = null,
      bezier = null,
      location = null;
    if (current.beziers.length > 0) {
      var distance = WIDTH;

      var i = current.beziers.length;
      while (i--) {
        var d = jsBezier.distanceFromCurve({ x: x, y: y }, current.beziers[i].b);
        if (d.distance < distance) {
          bezier = current.beziers[i];
          distance = d.distance;
          location = d.location;

          if (distance < 2)
            break;
        }
      }

      if (bezier) {
        point = jsBezier.pointOnCurve(bezier.b, 1 - location);
      }


    }
    return {
      p: point,
      l: location,
      i: bezier ? bezier.info : null,
      b: bezier ? bezier.b : null
    }
  }
  this.getBeziers = function() {
    return current.beziers;
  }
  this.clean = function(context, options) {

    var _ctx = context ? context : ctx;

    if (!context) {
      current.dst = [];
      current.src = [];

      current.beziers = [];
    }
    switch (orientation) {
      case 'vertical':
        var x = margins.left + box_w,
          y = margins.top + padding.left,
          w = WIDTH - margins.right - box_w - x;

        if (options && options.transparent) {
          _ctx.clearRect(x, y - 1, w, HEIGHT - margins.top - margins.bottom + 1);
          return;
          if (options.area) {
            _ctx.clearRect(options.area.x1, options.area.y1, options.area.x2, options.area.y2);
          } else {
            _ctx.clearRect(x, y - 1, w, HEIGHT - margins.top - margins.bottom + 1);
          }
          return;
        }
        //console.log("fillRect")
        _ctx.save();
        _ctx.fill = "#000000";
        _ctx.fillRect(x, y - 1, w, HEIGHT - margins.top - margins.bottom + 1);
        _ctx.restore();
        break;
      case 'horizontal':
        x = 0;//margins.left;
        y = margins.top + box_w,
          h = HEIGHT - margins.bottom - box_w - y;

        if (transparent) {
          _ctx.clearRect(x, y, WIDTH - margins.left - margins.right, h);
          return;
        }

        _ctx.clearRect(x, y, WIDTH - margins.left - margins.right, h);


        break;
    }

  }
  function drawLabel(label, x, y, box, options) {
    ctx.font = options.font || "normal normal 10px Arial";
    ctx.textBaseline = "middle";

    if (label_reference) {
      label = label_reference[label] || label;
    }

    var d = ctx.measureText(label);
    ctx.save();
    ctx.fillStyle = options.color || 'rgba(255,255,255,1)';
    var temp_x = x,
      temp_y = y;
    switch (options.align) {
      case 'left':
        temp_x = x - d.width - 5;
        break;
      case 'center':
        temp_x = x + (box.w / 2 - d.width / 2);
        break;
      case 'right':
        temp_x = x + 5 + box.w;
        break;
    }
    switch (options.valign) {
      case 'top':
        temp_y = y - box.h / 2;
        break;
      case 'center':
        temp_y = y + box.h / 2;
        break;
      case 'bottom':
        temp_y = y + box.h + box.h / 2;
        break;
    }

    ctx.fillText(label, temp_x, temp_y);
    ctx.restore();
  }

  return this;
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
      || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());
