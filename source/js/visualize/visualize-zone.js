let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Zone;

Utils.extend(Drawing, Zone);

function Zone(config) {
    Drawing.call(this, config);

    this.id = config.idZone;
    this.idZoneSet = config.idZoneSet;
    this.idZoneTrack = config.idZoneTrack;
    this.fill = config.fill;

    this.name = config.name || 'Zone';
    this.showName = config.showName == null ? true : config.showName;

    this.startDepth = config.startDepth;
    this.endDepth = config.endDepth;
}

Zone.prototype.getProperties = function() {
    return {
        idZone: this.id,
        idZoneSet: this.idZoneSet,
        idZoneTrack: this.idZoneTrack,
        name: this.name,
        showName: this.showName,
        startDepth: this.startDepth,
        endDepth: this.endDepth,
        fill: this.fill
    }
}

Zone.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idZone);
    Utils.setIfNotNull(this, 'idZoneSet', props.idZoneSet);
    Utils.setIfNotNull(this, 'idZoneTrack', props.idZoneTrack);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'showName', props.showName);
    Utils.setIfNotNull(this, 'startDepth', props.startDepth);
    Utils.setIfNotNull(this, 'endDepth', props.endDepth);
    Utils.setIfNotNull(this, 'fill', Utils.isJson(props.fill) ? JSON.parse(props.fill) : props.fill);
}

Zone.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);

    this.svgContainer = plotContainer.select('.vi-track-svg-container');
    this.svgGroup = this.svgContainer.append('g')
        .classed('vi-track-svg-group', true);


    this.pattern = this.svgGroup.append('defs')
        .append('pattern')
        .attr('id', 'vi-zone-pattern-' + this.id)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 16)
        .attr('width', 16);
    this.rect = this.svgGroup.append('rect');
}

Zone.prototype.doPlot = function(highlight) {
    this.updateHeader();
    if (this.startDepth == null || this.endDepth == null) return;

    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();
    let y1 = transformY(this.startDepth);
    let y2 = transformY(this.endDepth);

    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);
    let minY = d3.min([y1, y2]);
    let maxY = d3.max([y1, y2]);

    this.lines = this.svgGroup.selectAll('line.vi-zone-line')
        .data([
            { x1: minX, y1: minY, x2: maxX, y2: minY },
            { x1: minX, y1: maxY, x2: maxX, y2: maxY }
        ]);

    this.lines.enter().append('line')
        .attr('class', 'vi-zone-line');
    this.lines
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; })
        .attr('stroke', 'black')
        .attr('stroke-width', highlight ? 3 : 1)
        .attr('stroke-dasharray', highlight ? '5, 5' : '');

    let fill = this.createFillStyle();
    console.log('fill', fill);
    this.rect
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY)
        .attr('fill', fill);
}

Zone.prototype.createFillStyle = function() {
    if (!this.fill || !this.fill.pattern) return null;
    let pattern = this.fill.pattern;
    if (pattern.name == 'none') return pattern.background;

    let src = CanvasHelper.RAW_PATTERNS[Utils.lowercase(pattern.name)];
    if (!src) return null;

    if (pattern.foreground)
        src = src.replace(/(stroke=")\w+(")/, '$1'+pattern.foreground+'$2');
    if (pattern.background)
        src = src.replace(/(fill=")\w+(")/, '$1'+pattern.background+'$2');
    this.pattern.selectAll('image').remove();
    this.pattern.append('image')
        .attr('xlink:href', src)
        .attr('width', 16)
        .attr('height', 16);
    return 'url(#vi-zone-pattern-' + this.id + ')';

}

Zone.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

Zone.prototype.getAllColors = function() {
    if (!this.fill || !this.fill.pattern) return [];
    return [this.fill.pattern.background];
}
