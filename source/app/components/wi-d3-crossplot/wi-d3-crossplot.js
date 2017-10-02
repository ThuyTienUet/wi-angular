const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let zoneCtrl = null;
    this.viCrossplot = {};
    this.isShowWiZone = true;
    this.isShowReferenceWindow = false;

    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        self.crossplotModel = utils.getModel('crossplot', self.wiCrossplotCtrl.id);
        if (self.crossplotModel) {
            if (self.crossplotModel.properties.pointSet) {
                self.pointSet = self.crossplotModel.properties.pointSet;
            } else {

            }
        }
        console.log("crossplot", self.crossplotModel, self.wellProperties);
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };
    this.onReady = function () {
        self.linkModels();

        // self.createVisualizeCrossplot(self.curveXModel, self.curveYModel);
    }
    this.CloseZone = function () {
        self.isShowWiZone = false;
        utils.triggerWindowResize();
    }

    this.getZoneCtrl = function () {
        if (!zoneCtrl) zoneCtrl = wiComponentService.getComponent(self.getZoneName());
        return zoneCtrl;
    }

    this.getZoneName = function () {
        return self.name + "Zone";
    }

    this.linkModels = function () {
        self.zoneArr = null;
        if (self.crossplotModel && self.crossplotModel.properties.pointSet && self.crossplotModel.properties.pointSet.idZoneSet) {
            self.zoneSetModel = utils.getModel('zoneset', self.crossplotModel.properties.pointSet.idZoneSet);
            self.zoneArr = self.zoneSetModel.children;
            self.zoneArr.forEach(function (zone) {
                zone.handler = function () {}
            });
            self.getZoneCtrl().zones = self.zoneArr;
            self.getZoneCtrl().zoneUpdate();
            self.pointSet.zones = self.zoneArr.map(function(zone) {
                return zone.properties;
            });
        }
    }

    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function(data) {
            self.updateViCrossplotZones(data);
        });
    }

    this.updateViCrossplotZones = function(data) {
        let activeZones = self.getZoneCtrl().getActiveZones();

        if (activeZones)
            activeZones = activeZones.map(function(d) { return d.properties.idZone; });

        if (self.viCrossplot && self.viCrossplot.setProperties) {
            self.viCrossplot.setProperties({
                pointSet: {
                    activeZone: data == 'All' ? data : activeZones
                }
            });
            self.viCrossplot.doPlot();
        }
    }

    this.CloseReferenceWindow = function () {
        self.isShowReferenceWindow = false;
        utils.triggerWindowResize();
    }
    this.propertiesDialog = function () {
        function openDialog() {
            if (!self.viCrossplot || !Object.keys(self.viCrossplot).length) {
                self.viCrossplot = self.createVisualizeCrossplot(null, null, {
                    name: self.crossplotModel.properties.name,
                    idPointSet: self.pointSet.idPointSet,
                    idCrossPlot: self.crossplotModel.properties.idCrossPlot,
                    idWell: self.crossplotModel.properties.idWell,
                    pointSet: self.pointSet
                })
            }
            DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, function (ret) {
                self.linkModels();
            })
        }
        if (!self.crossplotModel || !self.pointSet) {
            wiApiService.getCrossplot(self.crossplotModel.properties.idCrossplot, function (crossplot) {
                self.pointSet = crossplot.pointsets[0];
                openDialog();
            });
        } else {
            openDialog();
        }
    }
    let commonCtxMenu = [
        {
            name: "Refresh",
            label: "Refresh",
            icon: "reload-16x16",
            handler: function () {
            }
        }, {
            name: "Properties",
            label: "Properties",
            icon: "properties2-16x16",
            handler: function () {
                self.propertiesDialog();
            }
        }, {
            name: "ShowOverlay",
            label: "Show Overlay",
            icon: "",
            handler: function () {

            }
        }, {
            name: "ShowReferenceZone",
            label: "Show Reference Zone",
            isCheckType: "true",
            checked: self.isShowWiZone,
            handler: function (index) {
                self.isShowWiZone = !self.isShowWiZone;
                utils.triggerWindowResize();
                self.contextMenu[index].checked = self.isShowWiZone;
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show Reference Window",
            isCheckType: "true",
            checked: self.isShowReferenceWindow,
            handler: function (index) {
                self.isShowReferenceWindow = !self.isShowReferenceWindow
                self.contextMenu[index].checked = self.isShowReferenceWindow;
                utils.triggerWindowResize();
            }
        }, {
            name: "ShowTooltip",
            label: "Show Tooltip",
            handler: function () {

            }
        }, {
            name: "ShowHistogram",
            label: "Show Histogram",
            handler: function () {

            }
        }, {
            name: "Function",
            label: "Function",
            childContextMenu: [

            ],
            handler: function () {

            }
        }
    ];
    this.contextMenu = commonCtxMenu;
    this.setContextMenu = function (contextMenu) {
        self.contextMenu = contextMenu;
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    this.createVisualizeCrossplot = function (curveX, curveY, config) {
        if (!config) config = {};
        // if (!self.viCrossplot) {
            let domElem = document.getElementById(self.crossplotAreaId);
            self.viCrossplot = graph.createCrossplot(curveX, curveY, config, domElem);

            self.viCrossplot.onMouseDown(function() {
                if (d3.event.button == 2) return;
                if (self.viCrossplot.mode == 'PlotAreaRectangle') {
                    if (self.viCrossplot.area && self.viCrossplot.area.points.length > 1) {
                        self.viCrossplot.endAddAreaRectangle();
                        self.contextMenu = commonCtxMenu;
                    }
                }
                else if (self.viCrossplot.mode == 'PlotUserLine') {
                    if (self.viCrossplot.userLine && self.viCrossplot.userLine.points.length > 1) {
                        self.viCrossplot.endAddUserLine();
                        self.contextMenu = commonCtxMenu;
                    }
                }
            })
        // }
        return self.viCrossplot;
    }
    this.initPolygons = function (polygons) {
        self.viCrossplot.polygons = [];
        polygons.forEach(function (polygon) {
            self.viCrossplot.polygons.push(polygon);
        })
        self.viCrossplot.doPlot();
    }
    this.initRegressionLines = function(regressionLines) {
        self.viCrossplot.regressionLines = [];
        regressionLines.forEach(function (regressionLines) {
            self.viCrossplot.regressionLines.push(regressionLines);
        })
        self.viCrossplot.doPlot();
    }
    this.getPolygons = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.polygons;
    }
    this.getRegressionLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.regressionLines;
    }
    this.getViCrossplot = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot;
    }

    this.updateActiveZone = function (activeZone) {
        if (!self.viCrossplot) return {};
        viCrossplot.setProperties({
            pointSet: {
                activeZone: activeZone
            }
        });
        viCrossplot.doPlot();
    }

    this.drawUserLine = function(callback) {
        self.viCrossplot.startAddUserLine();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let userLine = self.viCrossplot.endAddUserLine();
                    if (callback) callback(userLine);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.deleteUserLine = function() {
        self.viCrossplot.userLine = null;
        self.viCrossplot.plotUserLine();
    }

    this.drawAreaRectangle = function (callback) {
        self.viCrossplot.startAddAreaRectangle();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaRectangle();
                    if (callback) callback(area);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.drawAreaPolygon = function (callback) {
        self.viCrossplot.startAddAreaPolygon();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaPolygon();
                    if (callback) callback(area);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.deleteArea = function() {
        self.viCrossplot.area = null;
        self.viCrossplot.plotArea();
    }

    this.drawPolygon = function (idPolygon, callback) {
        if (idPolygon) {
            self.viCrossplot.startEditPolygon(idPolygon);
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endEditPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        } else {
            self.viCrossplot.startAddPolygon();
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endAddPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        }
    }

}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-crossplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiCrossplotCtrl: '<'
    }
});

exports.name = moduleName;
