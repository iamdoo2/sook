// License: MIT
// https://github.com/vogievetsky/KoalasToTheMax (modified)

(function() {
  function array2d(w, h) {
    var a = [];
    return function(x, y, v) {
      if (x < 0 || y < 0) return void 0;
      if (arguments.length === 3) return a[w * x + y] = v;
      else if (arguments.length === 2) return a[w * x + y];
      else throw new TypeError('Bad number of arguments');
    }
  }

  function avgColor(x, y, z, w) {
    return [
      (x[0] + y[0] + z[0] + w[0]) / 4,
      (x[1] + y[1] + z[1] + w[1]) / 4,
      (x[2] + y[2] + z[2] + w[2]) / 4,
    ];
  }

  function Circle(vis, xi, yi, size, color, children, layer, onSplit) {
    this.vis = vis;
    this.x = size * (xi + 0.5);
    this.y = size * (yi + 0.5);
    this.size = size;
    this.color = color;
    this.rgb = d3.rgb(color[0], color[1], color[2]);
    this.children = children;
    this.layer = layer;
    this.onSplit = onSplit;
  }

  Circle.prototype.isSplitable = function() {
    return this.node && this.children
  }

  Circle.prototype.split = function() {
    if (!this.isSplitable()) return;
    d3.select(this.node).remove();
    delete this.node;
    Circle.addToVis(this.vis, this.children);
    this.onSplit(this);
  }

  Circle.prototype.checkIntersection = function(startPoint, endPoint) {
    var edx = this.x - endPoint[0];
    var edy = this.y - endPoint[1];
    var sdx = this.x - startPoint[0];
    var sdy = this.y - startPoint[1];
    var r2 = (this.size / 2) * (this.size / 2);
    return edx * edx + edy * edy <= r2 && sdx * sdx + sdy * sdy > r2;
  }

  Circle.addToVis = function(vis, circles, init) {
    var circle = vis.selectAll('.nope')
                    .data(circles)
                    .enter()
                    .append('circle');
    if (init) {
      circle = circle.attr('cx', function(d) { return d.x; })
                     .attr('cy', function(d) { return d.y; })
                     .attr('r', minSize)
                     .attr('fill', '#ffffff')
                     .transition()
                     .duration(1000);
    }
    else {
      circle = circle.attr('cx', function(d) { return d.parent.x; })
                     .attr('cy', function(d) { return d.parent.y; })
                     .attr('r', function(d) { return d.parent.size / 2; })
                     .attr('fill', function(d) { return String(d.parent.rgb); })
                     .attr('fill-opacity', 0.66)
                     .transition()
                     .duration(300);
    }
    var hint = (document.getElementById('hint').className.indexOf('on') > -1);
    circle = circle.attr('cx', function(d) { return d.x; })
                   .attr('cy', function(d) { return d.y; })
                   .attr('r', function(d) { return d.size / 2; })
                   .attr('fill', function(d) { return String(d.rgb); })
                   .attr('fill-opacity', function(d) { return (d.size == minSize && hint) ? 0.5 : 1.0})
                   .each('end',  function(d) { d.node = this; });
  }

  var vis;
  var dim;
  var maxSize = (screen.width < 801) ? 256 : 512;
  var minSize = 4;

  loadImage = function(imageData) {
    dim = maxSize / minSize;
    var canvas = document.createElement('canvas').getContext('2d');
    canvas.drawImage(imageData, 0, 0, dim, dim);
    return canvas.getImageData(0, 0, dim, dim).data;
  };

  makeCircles = function(colorData, onEvent) {
    vis = d3.select('div#dots')
            .append('svg')
            .attr('width', maxSize)
            .attr('height', maxSize)
    document.getElementById('dots').style.marginTop = (-maxSize / 2) + 'px';
    document.getElementById('dots').style.marginLeft = (-maxSize / 2) + 'px';

    var score = 0,
      maxScore = 0;
    function onSplit(circle) {
      ++score;
      if (score == maxScore) endGame();
      else onEvent((100 * score / maxScore).toFixed(2) + '%');
    }
    onEvent('0.00%');

    var finestLayer = array2d(dim, dim);
    var size = minSize;

    var xi, yi, t = 0, color;
    for (yi = 0; yi < dim; yi++) {
      for (xi = 0; xi < dim; xi++) {
        color = [colorData[t], colorData[t+1], colorData[t+2]];
        finestLayer(xi, yi, new Circle(vis, xi, yi, size, color));
        t += 4;
      }
    }

    var layer, prevLayer = finestLayer;
    var c1, c2, c3, c4, currentLayer = 0;
    while (size < maxSize) {
      dim /= 2;
      size = size * 2;
      layer = array2d(dim, dim);
      for (yi = 0; yi < dim; yi++) {
        for (xi = 0; xi < dim; xi++) {
          c1 = prevLayer(2 * xi, 2 * yi);
          c2 = prevLayer(2 * xi + 1, 2 * yi);
          c3 = prevLayer(2 * xi, 2 * yi + 1);
          c4 = prevLayer(2 * xi + 1, 2 * yi + 1);
          color = avgColor(c1.color, c2.color, c3.color, c4.color);
          c1.parent = c2.parent = c3.parent = c4.parent = layer(xi, yi,
            new Circle(vis, xi, yi, size, color, [c1, c2, c3, c4], currentLayer, onSplit)
          );
        }
      }
      currentLayer++;
      prevLayer = layer;
      maxScore += dim * dim;
    }

    Circle.addToVis(vis, [layer(0, 0)], true);

    function splitableCircleAt(pos) {
      var xi = Math.floor(pos[0] / minSize);
      var yi = Math.floor(pos[1] / minSize);
      var circle = finestLayer(xi, yi);
      if (!circle) return null;
      while (circle && !circle.isSplitable()) circle = circle.parent;
      return circle || null;
    }

    function intervalLength(startPoint, endPoint) {
      var dx = endPoint[0] - startPoint[0];
      var dy = endPoint[1] - startPoint[1];
      return Math.sqrt(dx * dx + dy * dy);
    }

    function breakInterval(startPoint, endPoint, maxLength) {
      var breaks = [];
      var length = intervalLength(startPoint, endPoint);
      var numSplits = Math.max(Math.ceil(length / maxLength), 1);
      var dx = (endPoint[0] - startPoint[0]) / numSplits;
      var dy = (endPoint[1] - startPoint[1]) / numSplits;
      var startX = startPoint[0];
      var startY = startPoint[1];
      for (var i = 0; i <= numSplits; i++) {
        breaks.push([startX + dx * i, startY + dy * i]);
      }
      return breaks;
    }

    function findAndSplit(startPoint, endPoint, isTouch) {
      var breaks = breakInterval(startPoint, endPoint, 4);
      var circleToSplit = []
      for (var i = 0; i < breaks.length - 1; i++) {
        var sp = breaks[i], ep = breaks[i+1];
        var circle = splitableCircleAt(ep);
        if (circle && circle.isSplitable() && (isTouch || circle.checkIntersection(sp, ep)))
          circle.split();
      }
    }

    var prevMousePosition = null;
    var prevTouchPositions = {};

    function onMouseMove() {
      var mousePosition = d3.mouse(vis.node());
      if (isNaN(mousePosition[0])) {
        prevMousePosition = null;
        return;
      }
      if (prevMousePosition) {
        findAndSplit(prevMousePosition, mousePosition, false);
      }
      prevMousePosition = mousePosition;
      d3.event.preventDefault();
    }

    function onTouchMove() {
      var touchPositions = d3.touches(vis.node());
      for (var touchIndex = 0; touchIndex < touchPositions.length; touchIndex++) {
        var touchPosition = touchPositions[touchIndex];
        var prevTouchPosition = prevTouchPositions[touchPosition.identifier]
        if (prevTouchPosition) {
          findAndSplit(prevTouchPosition, touchPosition, true);
        }
        prevTouchPositions[touchPosition.identifier] = touchPosition;
      }
      d3.event.preventDefault();
    }

    function onTouchEnd() {
      var touches = d3.event.changedTouches;
      for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
        var touch = touches.item(touchIndex);
        prevTouchPositions[touch.identifier] = null;
      }
      d3.event.preventDefault();
    }

    d3.select(document.body)
      .on('mousemove', onMouseMove)
      .on('touchmove', onTouchMove)
      .on('touchend', onTouchEnd)
      .on('touchcancel', onTouchEnd);
  };
})();
