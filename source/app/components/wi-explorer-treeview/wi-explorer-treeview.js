const componentName = "wiExplorerTreeview";
const moduleName = "wi-explorer-treeview";
const wiBaseTreeview = require("./wi-base-treeview");

function WiExpTreeController(
    $controller,
    wiComponentService,
    wiApiService,
    $timeout,
    $scope
) {
    let self = this;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);

    this.$onInit = function() {
        window.__WIEXPTREE = self;
    };

    function setupCurveDraggable (element) {
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        let selectedObjs;
        element.draggable({
            helper: function (event) {
                selectedObjs = $(`#WiExplorertreeview .wi-parent-node[type='curve']`).filter('.item-active').clone();
                let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                if (!selectedNodes || selectedNodes.find(n => n.type != 'curve')) {
                    return $(event.currentTarget).find('div:nth-child(2)').clone();
                }
                return $('<div/>').append(selectedObjs.find('.wi-parent-content div:nth-child(2)'));
            },
            start: function (event, ui) {
                dragMan.dragging = true;
                d3.selectAll('.vi-track-plot-container').style('z-index', 1);
            },
            stop: function (event, ui) {
                dragMan.dragging = false;
                const idDataset = dragMan.idDataset;
                let wiD3Ctrl = dragMan.wiD3Ctrl;
                let track = dragMan.track;
                let wiSlidingBarCtrl = dragMan.wiSlidingBarCtrl;
                dragMan.idDataset = null;
                dragMan.wiD3Ctrl = null;
                dragMan.track = null;
                dragMan.wiSlidingBarCtrl = null;
                d3.selectAll('.vi-track-plot-container').style('z-index', 'unset');
                function handleDrop(idCurves) {
                    if (idDataset) {
                        const curveModels = idCurves.map(idCurve => utils.getModel('curve', idCurve));
                        utils.copyCurve(curveModels);
                        const datasetModel = utils.getModel('dataset', idDataset)
                        utils.pasteCurve(datasetModel);
                        return;
                    }
                    if (wiSlidingBarCtrl) {
                        let idCurve = idCurves[0];
                        let errorCode = wiSlidingBarCtrl.verifyDroppedIdCurve(idCurve);
                        console.log('drop curve into slidingBar', errorCode);
                        if (errorCode > 0) {
                            wiSlidingBarCtrl.createPreview(idCurve);
                            let logplotModel = wiSlidingBarCtrl.logPlotCtrl.getLogplotModel();
                            let logplotRequest = angular.copy(logplotModel.properties);
                            logplotRequest.referenceCurve = idCurve;
                            wiApiService.editLogplot(logplotRequest, function () {
                                logplotModel.properties.referenceCurve = idCurve;
                            });
                        }
                        else if (errorCode === 0) {
                            toastr.error("Cannot drop curve from another well");
                        }
                        return;
                    }
                    if (wiD3Ctrl && !track) {
                        const errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurves[0]);
                        if (errorCode > 0) {
                            wiD3Ctrl.addLogTrack(null, function (logTrackController) {
                                async.eachSeries(idCurves, (idCurve, next) => {
                                    const viTrack = logTrackController.viTrack;
                                    wiApiService.createLine({
                                        idTrack: viTrack.id,
                                        idCurve: idCurve,
                                        orderNum: viTrack.getCurveOrderKey()
                                    }, function (line) {
                                        let lineModel = utils.lineToTreeConfig(line);
                                        utils.getCurveData(wiApiService, idCurve, function (err, data) {
                                            if (!err) logTrackController.addCurveToTrack(viTrack, data, lineModel.data);
                                            next(err);
                                        });
                                    });
                                });
                            });
                        } else if (errorCode === 0) {
                            toastr.error("Cannot drop curve from another well");
                        }
                        return;
                    }
                    if (wiD3Ctrl && track) {
                        async.eachSeries(idCurves, (idCurve, next) => {
                            let errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurve);
                            if (errorCode > 0) {
                                wiApiService.createLine({
                                    idTrack: track.id,
                                    idCurve: idCurve,
                                    orderNum: track.getCurveOrderKey()
                                }, function (line) {
                                    let lineModel = utils.lineToTreeConfig(line);
                                    utils.getCurveData(wiApiService, idCurve, function (err, data) {
                                        if (!err) wiD3Ctrl.getComponentCtrlByViTrack(track).addCurveToTrack(track, data, lineModel.data);
                                        next(err);
                                    });
                                });
                            }
                            else if (errorCode === 0) {
                                toastr.error("Cannot drop curve from another well");
                            }
                            return;
                        })
                    }
                }
                let idCurves = selectedObjs.map(function () { return parseInt($(this).attr('data')) }).get();
                if (idCurves.length) {
                    handleDrop(idCurves);
                } else {
                    let idCurve = parseInt($(event.target).attr('data'));
                    handleDrop([idCurve]);
                }
            },
            appendTo: 'body',
            revert: false,
            scroll: false,
            containment: 'document',
            cursorAt: {
                top: 5,
                left: 10
            }
        });
    };

    function handleKey(event) {
        switch (event.key) {
            case 'F2':
                const selectedNode = utils.getSelectedNode();
                switch (selectedNode.type) {
                    case 'well':
                        utils.renameWell();
                        break;
                    case 'dataset':
                        utils.renameDataset();
                        break;
                    case 'curve':
                        utils.renameCurve();
                        break;
                    case 'zoneset':
                        utils.renameZoneSet(selectedNode);
                        break;
                    default:
                        break;
                }
                break;
            case 'Delete':
                const isPermanently = !!event.shiftKey;
                self.container.handlers.DeleteItemButtonClicked(isPermanently);
                break;
            default:
                break;
        }
    }

    this.onReady = _.debounce(function () {
        let typeItemDragable = "curve";
        const curveElements = $("wi-base-treeview#" + self.name + " .wi-parent-node" + `[type='${typeItemDragable}']`);
        setupCurveDraggable(curveElements, wiComponentService, wiApiService);
        curveElements.click(function() {
            this.focus();
        });
        // dataset droppable
        const dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(`wi-base-treeview#${self.name} .wi-parent-node[type=dataset]`).droppable({
            accept: '.wi-parent-node[type=curve]',
            addClasses: false,
            tolerance: 'pointer',
            over: function (event, ui) {
                if (event.ctrlKey) {
                    ui.helper.css({'cursor': 'copy'});
                    $(event.target).css('border', '1px dashed #0088ff');
                }
            },
            out: function (event, ui) {
                ui.helper.css('cursor', '');
                $(event.target).css('border', '');
            },
            drop: function (event, ui) {
                if (event.ctrlKey) {
                    $(event.target).css('border', '');
                    dragMan.idDataset = +$(event.target).attr('data');
                }
            },
            cursor: 'copy'
        });
        const nodeElements = $(`wi-base-treeview#${self.name} .wi-parent-node`);
        nodeElements.off('focusin');
        nodeElements.off('focusout');
        nodeElements.focusin(function() {
            $(this).on('keyup', handleKey);
        });
        nodeElements.focusout(function() {
            $(this).off('keyup', handleKey);
        });
    }, 100)

    this.onClick = function($index, $event) {
        if (!this.container && this.container.selectHandler) return;
        let node = this.config[$index];
        node.$index = $index;
        if (!node) {
            this.container.unselectAllNodes();
            return;
        }
        wiComponentService.emit("update-properties", node);
        let selectedNodes = wiComponentService.getComponent(
            wiComponentService.SELECTED_NODES
        );
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (
                !$event.ctrlKey ||
                node.type != selectedNodes[0].type ||
                node.parent != selectedNodes[0].parent
            ) {
                if (
                    $event.type == "contextmenu" &&
                    selectedNodes.includes(node)
                )
                    return this.container.selectHandler(node);
                this.container.unselectAllNodes();
            }
            this.container.selectHandler(node);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (
                    node.type != selectedNodes[selectedNodes.length - 1].type ||
                    node.parent != selectedNodes[0].parent
                ) {
                    this.container.unselectAllNodes();
                    this.container.selectHandler(node);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        this.container.unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            this.container.selectHandler(this.config[i]);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        this.container.unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            this.container.selectHandler(this.config[i]);
                        }
                    }
                }
            }
        }
    };

    this.showContextMenu = function($event, $index) {
        console.log(this.config[$index]);
        let nodeType = this.config[$index].type;
        let container = this.container;
        let defaultContextMenu = container.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        let itemContextMenu = container.getItemTreeviewCtxMenu(nodeType, this);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };
}

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: "wi-explorer-treeview.html",
    controller: WiExpTreeController,
    controllerAs: componentName,
    bindings: {
        name: "@",
        config: "<",
        container: "<",
        filter: "@",
        filterBy: "@"
    }
});
exports.name = moduleName;
