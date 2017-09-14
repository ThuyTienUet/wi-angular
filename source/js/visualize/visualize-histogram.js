module.exports = Histogram;

/**
 * Visualize Histogram contructor
 * @param: {Object} config: configuration of visualize histogram object
 *
 */
function Histogram(config) {
    console.log(config);

    this.idHistogram = config.idHistogram;
    this.histogramTitle = config.histogramTitle || "Noname";
    this.hardCopyWidth = config.hardCopyWidth;
    this.hardCopyHeight = config.hardCopyHeight;
    this.intervalDepthTop = config.intervalDepthTop;
    this.intervalDepthBottom = config.intervalDepthBottom;
    this.divisions = config.divisions;
    this.leftScale = config.leftScale;
    this.rightScale = config.rightScale;
    this.showGaussian = config.showGaussian || false;
    this.loga = config.loga || false;
    this.showGrid = config.showGrid || false;
    this.flipHorizontal = config.flipHorizontal || false;
    this.line = {
        color: config.lineColor,
        width: config.lineWidth,
        dash: config.lineStyle
    };
    this.plotType = config.plotType;
    this.fill = {
        pattern: null,
        background: config.color,
        foreground: config.color
    };
    this.discriminators = config.discriminator;
    this.idWell = config.idWell;
    this.idCurve = config.idCurve;
    idZoneSet = config.idZoneSet;
    this.data = null;
    this.zones = config.zones;

    // visualize instant vars
    this.svg = null;

}

Histogram.prototype.setCurve = function(data) {
    this.data = data; // ? clone
}

Histogram.prototype.doPlot = function() {
    if (!this.data) return;
}

Histogram.prototype.init = function(domElem) {
    var self = this;
    console.log("init histogram into domElem:", domElem);
    this.container = d3.select(domElem).attr('class', 'vi-histogram-container');
    new ResizeSensor($(this.container.node()), function(param) {
        console.log("On resize", param, this);
        self.svg.attr('width',self.container.node().clientWidth)
            .attr('height', self.container.node().clientHeight);
    });
    this.svg = this.container.append('svg')
        .attr('class', 'vi-histogram-svg')
        .attr('width',this.container.node().clientWidth)
        .attr('height', this.container.node().clientHeight);
}
