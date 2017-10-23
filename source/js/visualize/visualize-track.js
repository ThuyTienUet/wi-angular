let Utils = require('./visualize-utils');

module.exports = Track;

/**
 * Represent a general track
 * @constructor
 */
function Track(config) {
    this.HEADER_NAME_COLOR = '#88CC88';
    this.HEADER_ITEM_BORDER_WIDTH = 1;
    this.HEADER_ITEM_MARGIN_BOTTOM = 1;
    this.HEADER_HIGHLIGHT_COLOR = 'rgb(255,128,128)';
    //this.BODY_CONTAINER_HEIGHT = 340;
    this.BODY_CONTAINER_HEIGHT = 70;
    this.BODY_HIGHLIGHT_COLOR = '#ffffe0';
    this.BODY_DEFAULT_COLOR = 'transparent';
    this.MIN_WIDTH = 120;

    this.orderNum = config.orderNum;
    this.bgColor = config.bgColor || this.BODY_DEFAULT_COLOR;
    this.yStep = config.yStep || 1;
    this.offsetY = config.offsetY || 0;
    this.type = Utils.pascalCaseToLowerDash(this.constructor.name);
    this.justification = config.justification || 'center';
    this.showTitle = (config.showTitle == null) ? true : config.showTitle;

    this.xPadding = config.xPadding || 1;
    this.yPadding = config.yPadding || 5;
}

/**
 * Check if class of this instance is LogTrack
 * @returns {Boolean}
 */
Track.prototype.isLogTrack = function() {
    return this.constructor.name == 'LogTrack';
}

/**
 * Check if class of this instance is DepthTrack
 * @returns {Boolean}
 */
Track.prototype.isDepthTrack = function() {
    return this.constructor.name == 'DepthTrack';
}

/**
 * Check if class of this instance is ZoneTrack
 * @returns {Boolean}
 */
Track.prototype.isZoneTrack = function() {
    return this.constructor.name == 'ZoneTrack';
}

/**
 * Set background color for the track
 * @param {String} color - CSS color string
 */
Track.prototype.setBackgroundColor = function(color) {
    this.trackContainer
        .style('background-color', color)
}

/**
 * Initialize DOM elements
 * @param {Object} domElem - The DOM elements to contain the track
 */
Track.prototype.init = function(domElem) {
    this.root = d3.select(domElem);
    this.createContainer();
    this.createHeaderContainer();
    this.createHorizontalResizer();
    this.createVerticalResizer();
    this.createBodyContainer();
}

/**
 * Create outer-most DOM element containing the track
 */
Track.prototype.createContainer = function() {
    this.trackContainer = this.root.append('div')
        .datum(this.orderNum)
        .attr('class', 'vi-track-container')
        .attr('tabindex', isNaN(this.orderNum) ? -1 : this.orderNum)
        .attr('data-order-num', function(d) { return d; })
        .style('width', this.width + 'px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('outline', 'none');
}
Track.prototype.updateOrderNum = function() {
    this.trackContainer.datum(this.orderNum)
        .attr('tabindex', isNaN(this.orderNum) ? -1 : this.orderNum)
        .attr('data-order-num', function(d) { return d; })
        .style('width', this.width + 'px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('outline', 'none');
    this.verticalResizer.datum(this.orderNum + "*")
        .attr('class', 'vi-track-vertical-resizer')
        .attr('data-order-num', function(d) {return d;})
        .style('width', '5px')
        .style('cursor', 'col-resize');
}
/**
 * Create DOM element containing header
 */
Track.prototype.createHeaderContainer = function() {
    let self = this;

    this.headerContainer = this.trackContainer.append('div')
        .attr('class', 'vi-track-header-container')
        .style('background-color', 'white')
        .style('position', 'relative')
        .style('z-index', 11)
        .style('width', '100%')
        .style('flex', 1)
        .style('overflow', 'hidden')
        .style('text-align', 'center');

    this.headerNameBlock = this.headerContainer.append('div')
        .attr('class', 'vi-track-header-name')
        .style('display', this.showTitle ? 'block' : 'none')
        .style('text-align', this.justification)
        .style('position', 'relative')
        .style('background-color', this.HEADER_NAME_COLOR)
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('z-index', 1)
        .text(this.name)
        .on('mousedown', function(d) {
        })
        .on('mouseup', function(d) {
        });

    this.drawingHeaderContainer = this.headerContainer.append('div')
        .attr('class', 'vi-track-drawing-header-container')
        .style('position', 'absolute')
        .style('top', this.headerNameBlock.node().clientHeight + this.HEADER_ITEM_BORDER_WIDTH*2 + this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('width', '100%')
        .lower()
        .on('mousewheel', function() {
            if (d3.event.shiftKey) {
                self.headerScrollCallback();
            }
        })
        .on('mousedown', function() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            self.trackContainer.node().focus();
        })
        .call(d3.drag()
            .on('drag', function() {
                self.headerScrollCallback();
            })
        );
}

/**
 * Create DOM element containing body
 */
Track.prototype.createBodyContainer = function() {
    let existedPlot = this.root
        .select('.vi-track-body-container');

    this.bodyContainer = this.trackContainer.append('div')
        .attr('class', 'vi-track-body-container')
        .style('position', 'relative')
        .style('height', this.BODY_CONTAINER_HEIGHT + '%');

    this.plotContainer = this.bodyContainer.append('div')
        .attr('class', 'vi-track-plot-container')
        .style('position', 'absolute')
        .style('z-index', 1);

    if (!existedPlot.empty()) {
        this.bodyContainer
            .style('height', existedPlot.style('height'));
    }
}

/**
 * Create vertical resizer to resize track width
 */
Track.prototype.createVerticalResizer = function() {
    let minWidth = this.MIN_WIDTH;
    let compensator;
    let self = this;

    this.verticalResizer = this.root.append('div')
        .datum(this.orderNum + "*")
        .attr('class', 'vi-track-vertical-resizer')
        .attr('data-order-num', function(d) {return d;})
        .style('width', '5px')
        .style('cursor', 'col-resize')
        .call(d3.drag()
            .on('start', function() {
                compensator = 0;
            })
            .on('drag', function() {
                compensator += d3.event.dx;
                if (( self.width + compensator ) > minWidth) {
                    self.width += compensator;
                    compensator = 0;
                    self.trackContainer.style('width', self.width + 'px');
                    self.doPlot();
                }
            })
        );
}

/**
 * Create horizontal resiser to resize track height
 */
Track.prototype.createHorizontalResizer = function() {
    let self = this;
    this.horizontalVertical = this.trackContainer.append('div')
        .attr('class', 'vi-track-horizontal-resizer')
        .style('height', '5px')
        .style('background-color', 'lightgray')
        .style('border-radius', '3px')
        .style('width', '100%')
        .style('cursor', 'row-resize')
        .call(d3.drag()
            .on('drag', function() {
                self.horizontalResizerDragCallback();
            })
        );
}

/**
 * Function to call when the horizontal resizer is dragged
 */
Track.prototype.horizontalResizerDragCallback = function() {
    let plotHeight = this.bodyContainer
        .node()
        .clientHeight;

    this.bodyContainer
        .style('height', (plotHeight - d3.event.dy) + 'px');

    this.headerScrollCallback();
    this.doPlot();
}

/**
 * Function to call when header is scrolled
 */
Track.prototype.headerScrollCallback = function() {
    let rowHeight = this.headerNameBlock.node().clientHeight;
    let extraHeight = this.HEADER_ITEM_BORDER_WIDTH*2 + this.HEADER_ITEM_MARGIN_BOTTOM;

    //let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? -(rowHeight+extraHeight)*2: (rowHeight+extraHeight)*2);
    let step = this.headerContainer.node().clientHeight/40.;
    let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? (0 - step) : step);
    let top = parseInt(this.drawingHeaderContainer.style('top').replace('px', '')) + dy;
    let maxTop = rowHeight + extraHeight;
    let minTop = this.headerContainer.node().clientHeight - this.drawingHeaderContainer.node().clientHeight + extraHeight;

    top = minTop < maxTop ? Utils.clip(top, [minTop, maxTop]) : maxTop;
    this.drawingHeaderContainer
        .style('top', top + 'px');
}

/**
 * Register event when dragging horizontal resizer
 */
Track.prototype.onHorizontalResizerDrag = function(cb) {
    let self = this;
    this.horizontalVertical.call(d3.drag().on('drag', function(){
        cb();
        self.horizontalResizerDragCallback();
    }))
}

/**
 * Register event when drag track
 */
Track.prototype.onTrackDrag = function(callback) {
    let self = this;
    let width;
    $(this.trackContainer.node()).draggable({
        axis: 'x',
        containment: 'parent',
        helper: function () {
            width = self.width;
            self.width = 60;
            self.doPlot();
            return $(self.trackContainer.node()).clone().css('z-index', 99);
        },
        opacity: 0.7,
        distance: 10,
        handle: '.vi-track-header-name',
        snap: '.vi-track-vertical-resizer',
        scope: 'tracks',
        start: function (event, ui) {
            document.addEventListener('ontrackdrop', onTrackDropHandler, false);
            self.width = width;
            self.doPlot();
            function onTrackDropHandler(event) {
                document.removeEventListener('ontrackdrop', onTrackDropHandler);
                if (self == event.desTrack) return;
                callback(self, event.desTrack);
            }
        },
    });
    $(this.verticalResizer.node()).droppable({
        accept: '.vi-track-container',
        tolerance: "touch",
        scope: 'tracks',
        drop: function (event, ui) {
            let onTrackDrop = new Event('ontrackdrop');
            onTrackDrop.desTrack = self;
            document.dispatchEvent(onTrackDrop);
        }
    });
}

/**
 * Destroy all DOM elements of the track
 */
Track.prototype.destroy = function() {
    this.trackContainer.remove();
    this.verticalResizer.remove();
}

/**
 * Function to call if the track is highlighted
 */
Track.prototype.highlightCallback = function() {
    this.setBackgroundColor(this.BODY_HIGHLIGHT_COLOR);
}

/**
 * Plot the track and children elements
 */
Track.prototype.doPlot = function(highlight) {
    if (highlight != null) this.highlight = highlight;
    this.trackContainer.style('width', this.width + 'px');

    this.setBackgroundColor(this.bgColor);
    if (this.highlight && (typeof this.highlightCallback == 'function'))
        this.highlightCallback();

    this.updateHeader();
    this.updateBody();
}

/**
 * Get d3 decimal formatter function
 */
Track.prototype.getDecimalFormatter = function(decimal) {
    decimal = decimal < 0 ? 0 : decimal;
    return d3.format('.' + decimal + 'f');
}

/**
 * Register event for track container
 */
Track.prototype.on = function(type, cb) {
    this.trackContainer.on(type, cb);
}

/**
 * Update header container
 */
Track.prototype.updateHeader = function() {
    this.headerNameBlock
        .style('display', this.showTitle ? 'block': 'none')
        .style('text-align', this.justification)
        .text(this.name);
}

/**
 * Update body container
 */
Track.prototype.updateBody = function() {
    let rect = this.plotContainer
        .style('top', this.yPadding + 'px')
        .style('bottom', this.yPadding + 'px')
        .style('left', this.xPadding + 'px')
        .style('right', this.xPadding + 'px')
        .node()
        .getBoundingClientRect();

    this.plotContainer.selectAll('.vi-track-drawing')
        .attr('width', rect.width)
        .attr('height', rect.height);
}

/**
 * Get y window of the track
 * @returns {Array} Range of x values to show
 */
Track.prototype.getWindowY = function() {
    let windowY = (this.minY != null && this.maxY != null)
        ? [this.minY, this.maxY]
        : [0, 10000];

    windowY[0] = this.offsetY + Utils.roundUp(windowY[0] - this.offsetY, this.yStep);
    windowY[1] = this.offsetY + Utils.roundDown(windowY[1] - this.offsetY, this.yStep);
    return windowY;
}


/**
 * Get y viewport of the track
 * @returns {Array} Range of transformed y values to show
 */
Track.prototype.getViewportY = function() {
    return [0, this.plotContainer.node().clientHeight];
}

/**
 * Get x viewport of the track
 * @returns {Array} Range of transformed x values to show
 */
Track.prototype.getViewportX = function() {
    return [0, this.plotContainer.node().clientWidth];
}

/**
 * Get transform function for y coordinate
 */
Track.prototype.getTransformY = function() {
    return d3.scaleLinear()
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

Track.prototype.genColor = function() {
    function rand(x) {
        return Math.floor(Math.random() * x);
    }

    const DEFAULT_COLORS = ['Blue', 'Brown', 'Green', 'DarkGoldenRod', 'DimGray', 'Indigo', 'Navy'];
    let usedColors = [];
    this.drawings.forEach(function(d) {
        if (!d.getAllColors) return;
        usedColors = usedColors.concat(d.getAllColors());
    });

    let color;
    for (let i = 0; i <= this.drawings.length; i++)  {
        if (i >= DEFAULT_COLORS.length) {
            do {
                color = d3.rgb(rand(255), rand(255), rand(255)).toString();
            }
            while (usedColors.indexOf(color) >= 0);
        }
        else color = d3.color(DEFAULT_COLORS[i]).toString();
        if (usedColors.indexOf(color) < 0) break;
    }
    return color;
}
