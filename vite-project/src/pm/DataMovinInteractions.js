/*!
 * DataMovinInteractions JavaScript Library v0.5
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
export default function DataMovinInteractions() {

  var canvas,
    orientation,
    areas,
    datamovin,
    mouse = {
      x: 0,
      y: 0,
      scrollTop: 0,
      scrollLeft: 0
    },
    tm;

  var eventsCallbacks = {
    'click': null,
    'mouseover': null,
    'mousedown': null,
    'mouseup': null,
    'mouseout': null,
    'processing': function(when, where) { }
  }

  var scroll = {
    top: 0,
    left: 0
  }

  this.init = function($datamovin, options) {

    datamovin = $datamovin;
    canvas = options.canvas || datamovin.getCanvas();
    orientation = datamovin.getOrientation();
    areas = datamovin.getAreas();

    initEventListeners();
  }
  function initEventListeners() {
    // Init event listeners
    if (canvas.addEventListener) {

      document.addEventListener('mousemove', documentMouseMove, false);
      document.addEventListener('mousewheel', documentScrollWheelHandler, false);
      // Firefox
      document.addEventListener('DOMMouseScroll', documentScrollWheelHandler, false);

      if (orientation == 'vertical') {
        canvas.addEventListener('click', canvasMouseClickHandlerVertical, false);
        canvas.addEventListener('mousemove', canvasMouseMoveHandlerVertical, false);
      } else {
        canvas.addEventListener('click', canvasMouseClickHandlerHorizontal, false);
        canvas.addEventListener('getAreas', canvasMouseMoveHandlerHorizontal, false);
      }
      canvas.addEventListener('mousedown', canvasMouseDownHandler, false);
      canvas.addEventListener('mouseup', canvasMouseUpHandler, false);
      canvas.addEventListener('mouseout', canvasMouseOutHandler, false);

    } else if (el.attachEvent) {

      document.attachEvent('onmousemove', documentMouseMove, false);
      document.attachEvent('onmousewheel', documentScrollWheelHandler, false);
      if (orientation == 'vertical') {
        canvas.attachEvent('onclick', canvasMouseClickHandlerVertical);
        canvas.attachEvent('onmousemove', canvasMouseMoveHandlerVertical, false);
      } else {
        canvas.attachEvent('onclick', canvasMouseClickHandlerHorizontal);
        canvas.attachEvent('onmousemove', canvasMouseMoveHandlerHorizontal, false);
      }
      canvas.attachEvent('onmousedown', canvasMouseDownHandler);
      canvas.attachEvent('onmouseup', canvasMouseUpHandler);
      canvas.attachEvent('onmouseout', canvasMouseOutHandler, false);
    };
  }
  this.registerMouseEvents = function(callbacks) {
    for (var i in callbacks) {
      eventsCallbacks[i] = callbacks[i];
    }
  }

  function canvasMouseOutHandler(e) {
    e = initEvent(e);

    if (eventsCallbacks.mouseout)
      eventsCallbacks.mouseout.call(e, e);

    return false;
  }
  function documentMouseMove(e) {
    e = initEvent(e);

    if (eventsCallbacks.document_mousemove)
      eventsCallbacks.document_mousemove.call(e, e);

    return false;
  }
  function documentScrollWheelHandler(e) {
    if (!e) var e = window.event;
    if (eventsCallbacks.document_scrollwheel)
      eventsCallbacks.document_scrollwheel.call(e, e);
  }
  function canvasMouseMoveHandlerVertical(e) {
    e = initEvent(e);

    var point,
      info,
      left,
      position;
    mouse = getPosition(e, canvas);

    if (mouse.x >= areas.src.x1 && mouse.x <= areas.src.x2) {
      canvas.style.cursor = "pointer";

      point = datamovin.lookUp(mouse.y, "src");

      // datamovin.findBezier(mouse.x, mouse.y);

      info = datamovin.getPointInfo(point, 'src');

      if (eventsCallbacks.mouseover) {
        eventsCallbacks.mouseover.call(e, info);
      }
    } else if (mouse.x > areas.src.x2 && mouse.x < areas.dst.x1) {
      canvas.style.cursor = "default";

      point = datamovin.findBezier(mouse.x, mouse.y);

      console.log('point', point);

      if (eventsCallbacks.mouseover) {
        eventsCallbacks.mouseoverbezier.call(e, point);
      }
    } else if (mouse.x >= areas.dst.x1 && mouse.x <= areas.dst.x2) {
      canvas.style.cursor = "pointer";

      point = datamovin.lookUp(mouse.y, "dst");

      info = datamovin.getPointInfo(point, 'dst');

      if (eventsCallbacks.mouseover) {
        eventsCallbacks.mouseover.call(e, info);
      }

    } else {
      canvas.style.cursor = "default";

      if (eventsCallbacks.mouseover) {
        eventsCallbacks.mouseover.call(e, null);
      }
    }

    if (e.ownerDocument)
      scroll = getScroll(e);

    return false;
  }

  function canvasMouseDownHandler(e) {
    e = initEvent(e);

    if (eventsCallbacks.mousedown)
      eventsCallbacks.mousedown.call(e);
    return false;
  }

  function canvasMouseUpHandler(e) {
    e = initEvent(e);

    if (eventsCallbacks.mouseup)
      eventsCallbacks.mouseup.call(e);
    return false;
  }
  function canvasMouseClickHandlerVertical(e) {
    e = initEvent(e);

    var point;
    mouse = getPosition(e, canvas);

    if (mouse.x >= areas.src.x1 && mouse.x <= areas.src.x2) {
      point = datamovin.lookUp(mouse.y, "src");
      if (!datamovin.checkCurrent(point, "src")) {
        eventsCallbacks.processing.call(e, 'start', 'src');
        setTimeout(function tm() {
          console.log('point', point)
          datamovin.drawOutFlow(point, e.shiftKey ? false : true);
          if (eventsCallbacks.click)
            eventsCallbacks.click.call(e, datamovin.getPointInfo(point, 'src'));
          setTimeout(function ttm() { eventsCallbacks.processing.call(e, 'end', 'src'); }, 0);
        }, 100);
      } else {
        datamovin.clean();
        if (eventsCallbacks.click)
          eventsCallbacks.click.call(e, null);
      }
    } else if (mouse.x >= areas.dst.x1 && mouse.x <= areas.dst.x2) {
      point = datamovin.lookUp(mouse.y, "dst");
      if (!datamovin.checkCurrent(point, "dst")) {
        eventsCallbacks.processing.call(e, 'start', 'dst');
        setTimeout(function tm() {
          datamovin.drawInFlow(point, e.shiftKey ? false : true);
          if (eventsCallbacks.click)
            eventsCallbacks.click.call(e, datamovin.getPointInfo(point, 'dst'));
          setTimeout(function ttm() { eventsCallbacks.processing.call(e, 'end', 'dst'); }, 0);
        }, 100);
      } else {
        datamovin.clean();
        if (eventsCallbacks.click)
          eventsCallbacks.click.call(e, null);
      }
    } else {
      if (eventsCallbacks.click)
        eventsCallbacks.click.call(e, -1);
    }

    return false;

  }

  function canvasMouseClickHandlerHorizontal(e) {
    e = initEvent(e);


    var point;
    mouse = getPosition(e, canvas);

    if (mouse.y >= areas.src.y1 && mouse.y <= areas.src.y2) {
      point = datamovin.lookUp(mouse.x, "src");
      if (!datamovin.checkCurrent(point, "src")) {
        setTimeout(function tm() {
          datamovin.drawOutFlow(point, true)
          click_callback(datamovin.getPointInfo(point, 'src'));
        }, 5);
      } else {
        datamovin.clean();
      }
    } else if (mouse.y >= areas.dst.y1 && mouse.y <= areas.dst.y2) {
      point = datamovin.lookUp(mouse.x, "dst");
      if (!datamovin.checkCurrent(point, "dst")) {
        setTimeout(function tm() {
          datamovin.drawInFlow(point, true)
          click_callback(datamovin.getPointInfo(point, 'dst'));
        }, 5);
      } else {
        datamovin.clean();
      }
    }

    return false;

  }
  function initEvent(e) {
    if (!e) var e = window.event;
    if (e.preventDefault)
      e.preventDefault();
    else
      e.returnValue = false;
    return e;
  }
  function findPos(obj) {
    let curtop = 0;
    let curleft = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
    return [curleft, curtop];
  }
  /*
  *
  * getPosition needs to be improved to avoid the use of jQuery [only case in which I'm using it...]
  *
  */
  function getPosition(e) {

    //this section is from http://www.quirksmode.org/js/events_properties.html
    var targ;
    if (!e)
      e = window.event;
    if (e.target)
      targ = e.target;
    else if (e.srcElement)
      targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;

    var offset = findPos(targ);
    var x = e.pageX - offset[0];
    var y = e.pageY - offset[1];

    return { "x": Math.floor(x), "y": Math.floor(y) };
  };
}
