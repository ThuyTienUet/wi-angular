'use strict';

var __GLOBAL = null;
exports.setGlobalObj = function(gObj) {
    __GLOBAL = gObj;
}
exports.objcpy = function (destObj, sourceObj) {
    if (destObj) {
        for (let attr in sourceObj) {
            destObj[attr] = sourceObj[attr];
        }
    }
};

exports.isEqual = function (a, b) {
    if (!a || !b) return false;
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
};

exports.bindFunctions = function (destHandlers, sourceHandlers, thisObj) {
    for (let handler in sourceHandlers) {
        destHandlers[handler] = sourceHandlers[handler].bind(thisObj);
    }
};

exports.error = function (errorMessage) {
    errorMessage = errorMessage || "Something's wrong!";
    let wics = __GLOBAL.wiComponentService;
    let DialogUtils = wics.getComponent('DIALOG_UTILS');
    DialogUtils.errorMessageDialog(__GLOBAL.ModalService, errorMessage );
}

exports.projectOpen = function (wiComponentService, projectData) {
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectData);
    wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
};

exports.projectClose = function (wiComponentService) {
    wiComponentService.emit(wiComponentService.PROJECT_UNLOADED_EVENT);
};

function getCurveFromId(idCurve) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes) return;
    let curve = null;
    rootNodes.forEach(function(node) {
        visit(node, function (aNode) {
            if (aNode.type == 'curve' && aNode.id == idCurve) {
                curve = aNode;
            }
        });
    });
    return curve;
}
exports.lineToTreeConfig = lineToTreeConfig;
function lineToTreeConfig(line) {
    let lineModel = new Object();
    let curveModel = getCurveFromId(line.idCurve);
    console.log(curveModel);
    lineModel.name = curveModel.properties.name;
    lineModel.type = 'line';
    lineModel.id = line.idLine;
    lineModel.idDataset = curveModel.idDataset;
    lineModel.data = {
        id: line.idLine,
        name: lineModel.name,
        unit: curveModel.properties.unit,
        minX: line.minValue,
        maxX: line.maxValue,
        scale: line.displayType,
        alias: curveModel.properties.alias,
        showHeader: line.showHeader,
        line: null,
        symbol: null
    };
    let temp = line.displayMode.toLowerCase().trim();
    if ( temp == 'line' || temp == 'both') {
        lineModel.data.line = {
            dash: eval(line.lineStyle),
            color: line.lineColor,
            width: line.lineWidth
        }
    }
    if ( temp == 'symbol' || temp == 'both') {
        lineModel.data.symbol = {
            style: line.symbolName.toLowerCase(),
            fillStyle: line.symbolFillStyle,
            strokeStyle: line.symbolStrokeStyle,
            lineWidth: line.symbolLineWidth,
            lineDash: eval(line.symbolLineDash),
            size: parseInt(line.symbolSize)
        }
    }
    return lineModel;
}

function trackToModel(track) {
    var trackModel = new Object();
    trackModel.idPlot = track.idPlot;
    if (track.idTrack) {
        trackModel.idTrack = track.idTrack;
        trackModel.type = 'log';
    } else if (track.idDepthAxis) {
        trackModel.idDepthTrack = track.idDepthAxis;
        trackModel.type = 'depth';
    }
    return trackModel;
}

function logplotToTreeConfig(plot) {
    var plotModel = new Object();
    plotModel.name = 'logplot';
    plotModel.type = 'logplot';
    plotModel.id = plot.idPlot;
    plotModel.properties = {
        idWell: plot.idWell,
        idPlot: plot.idPlot,
        name: plot.name
    };
    plotModel.data = {
        childExpanded: false,
        icon: 'logplot-blank-16x16',
        label: plot.name
    }
    plotModel.tracks = new Array();
    if (!plot.tracks) return plotModel;

    plot.tracks.forEach(function(track) {
        plotModel.tracks.push(trackToModel(track));
    });
    //TODO: refactor
    plot.depth_axes.forEach(function(depthTrack){
        plotModel.tracks.push(trackToModel(depthTrack));
    });
    //plot.dep
    return plotModel;
}
exports.logplotToTreeConfig = logplotToTreeConfig;

function curveToTreeConfig(curve) {
    var curveModel = new Object();
    curveModel.name = 'curve';
    curveModel.type = 'curve';
    curveModel.id = curve.idCurve;
    curveModel.properties = {
        idDataset: curve.idDataset,
        idCurve: curve.idCurve,
        idFamily: curve.idFamily,
        name: curve.name,
        unit: curve.unit || "NA",
        dataset: curve.dataset,
        alias: curve.name // TODO
    };
    curveModel.data = {
        childExpanded: false,
        icon: 'curve-16x16',
        label: curve.name,
        unit: curveModel.properties.unit
    };
    curveModel.curveData = null;
    return curveModel;
}
exports.curveToTreeConfig = curveToTreeConfig;

function datasetToTreeConfig(dataset) {
    var datasetModel = new Object();
    datasetModel.name = "dataset";
    datasetModel.type = "dataset";
    datasetModel.id = dataset.idDataset;
    datasetModel.properties = {
        idWell: dataset.idWell,
        idDataset: dataset.idDataset,
        name: dataset.name,
        datasetKey: dataset.datasetKey,
        datasetLabel: dataset.datasetLabel
    };
    datasetModel.data = {
        childExpanded: false,
        icon: "curve-data-16x16",
        label: dataset.name
    };
    datasetModel.children = new Array();
    if (!dataset.curves) return datasetModel;

    dataset.curves.forEach(function(curve) {
        datasetModel.children.push(curveToTreeConfig(curve));
    });

    return datasetModel;
}
exports.datasetToTreeConfig = datasetToTreeConfig;

function createLogplotNode(well) {
    let logplotModel = new Object();
    logplotModel.name = 'logplots';
    logplotModel.type = 'logplots';
    logplotModel.data = {
        childExpanded: false,
        icon: 'logplot-blank-16x16',
        label: "Logplot"
    };
    logplotModel.properties = {
        idWell: well.idWell
    }
    logplotModel.children = new Array();
    if (!well.plots) return logplotModel;
    well.plots.forEach(function(plot) {
        logplotModel.children.push(logplotToTreeConfig(plot));
    });

    return logplotModel;
}

function wellToTreeConfig(well) {
    var wellModel = new Object();
    wellModel.name = "well";
    wellModel.type = "well";
    wellModel.id = well.idWell;
    wellModel.properties = {
        idProject: well.idProject,
        idWell: well.idWell,
        name: well.name,
        topDepth: well.topDepth,
        bottomDepth: well.bottomDepth,
        step: well.step
    };
    wellModel.data = {
        childExpanded: false,
        icon: "well-16x16",
        label: well.name
    };

    wellModel.children = new Array();

    if (well.datasets) {
        well.datasets.forEach(function(dataset) {
            wellModel.children.push(datasetToTreeConfig(dataset));
        });
    }
    let logplotNode = createLogplotNode(well);
    wellModel.children.push(logplotNode);
    return wellModel;
}
exports.wellToTreeConfig = wellToTreeConfig;

exports.projectToTreeConfig = function(project) {
    var projectModel = new Object();
    projectModel.type = 'project';
    projectModel.name = 'project';
    projectModel.id = project.idProject;
    projectModel.properties = {
        idProject: project.idProject,
        name: project.name,
        department: project.department,
        company: project.company,
        description: project.description
    };
    projectModel.data = {
        childExpanded: false,
        icon: 'wells-16x16',
        label: project.name,
        selected: false
    };
    projectModel.children = new Array();

    if (!project.wells) return projectModel;

    project.wells.forEach(function(well) {
        projectModel.children.push(wellToTreeConfig(well));
    });
    return projectModel;
}

exports.visit = visit;
function visit(node, callback, options) {
    if (options && options.found) return;
    if( node.data && node.data.deleted) return;
    if (options && options.path && options.path.push)
        options.path.push(node);
    if ( callback(node, options) ) {
        if (options) options.found = true
    }
    if (node.children) {
        node.children.forEach(function(child){
            visit(child, callback, options);
        });
    }
    if (options && options.path && options.path.pop)
        options.path.pop();
}
exports.getSelectedNode = getSelectedNode;
function getSelectedNode() {
    return getSelectedPath().pop();
}

exports.getSelectedProjectNode = getSelectedProjectNode;
function getSelectedProjectNode() {
    const wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || rootNodes.length <= 0) return;
    return rootNodes[0];
    //return getSelectedPath().shift();
}

exports.getSelectedPath = getSelectedPath;
function getSelectedPath(foundCB) {
    const wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes) return;
    let selectedPath = new Array();
    visit(rootNodes[0], function (node, options) {
        if (node.data) {
            if (foundCB) {
                if (foundCB(node)) {
                    selectedPath = options.path.slice();
                    return true;
                }
            }
            else if (node.data.selected == true) {
                selectedPath = options.path.slice();
                return true;
            }
        }
        return false;
    }, {
        path: new Array()
    });
    return selectedPath;
}

exports.pushProjectToExplorer = function (self, project, wiComponentService, WiTreeConfig, WiWell, $timeout) {
    self.treeConfig = (new WiTreeConfig()).config;
    $timeout(function () {
        let wiRootTreeviewComponent = wiComponentService.getComponent(self.treeviewName);
        wiRootTreeviewComponent.config[0].data.label = project.name;
        wiRootTreeviewComponent.config[0].children = [];
    });
    if (!project.wells) return;
    // parse config from data
    // inject child item to origin config
    let wells = [];
    for (let well of project.wells) {
        let wiWellTemp = new WiWell(well);
        wells.push(wiWellTemp);
    }
    $timeout(function () {
        let wiRootTreeviewComponent = wiComponentService.getComponent(self.treeviewName);
        if (wiRootTreeviewComponent) {
            for (let well of wells) {
                wiRootTreeviewComponent.addItemToFirst('wells', well);
            }
        }
    });
};

exports.updateWellProject = updateWellProject;
function updateWellProject(wiComponentService, well) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    if (!Array.isArray(project.wells)) {
        project.wells = [];
        project.wells.push(well);
    } else {
        let isNewWell = true;
        for (let i = 0; i < project.wells.length; i++) {
            if (project.wells[i].idWell == well.idWell) {
                project.wells[i] = well;
                isNewWell = false;
            }
        }
        if (isNewWell) {
            project.wells.push(well);
        }
    }
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
    //wiComponentService.emit(wiComponentService.UPDATE_WELL_EVENT, well);
    wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);
};

exports.updateWellsProject = function (wiComponentService, wells) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    for (let well of wells) {
        updateWellProject(wiComponentService, well);
    }
};

function getCurveData(apiService, idCurve, callback) {
    apiService.post(apiService.CURVE, { idCurve })
        .then(function (curve) {
            callback(null, curve);
        })
        .catch(function (err) {
            console.error('getCurveData', err);
            callback(err);
        });
}
//exports.getCurveDataByName = getCurveDataByName;

exports.setupCurveDraggable = function (element, wiComponentService, apiService) {
    let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);

    element.draggable({
        start: function (event, ui) {
            dragMan.dragging = true;
        },
        stop: function (event, ui) {
            dragMan.dragging = false;
            let wiD3Ctrl = dragMan.wiD3Ctrl;
            let track = dragMan.track;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
            if (wiD3Ctrl && track) {
                let idCurve = ui.helper.attr('data');
                apiService.post(apiService.CREATE_LINE, { idTrack: track.id, idCurve: idCurve })
                    .then(function(line){
                        console.log('line created', line);
                        let lineModel = lineToTreeConfig(line);
                        getCurveData(apiService, idCurve, function (err, data) {
                            if (!err) wiD3Ctrl.addCurveToTrack(track, data, lineModel.data);
                        });
                    })
                    .catch(function(err){
                        wiComponentService.getComponent(wiComponentService.UTILS).error(err);
                        return;
                    });
            }
        },
        appendTo: 'body',
        revert: false,
        scroll: false,
        helper: 'clone',
        containment: 'document',
        cursor: 'move',
        cursorAt: { top: 0, left: 0 }
    });
};

exports.createNewBlankLogPlot = function (wiComponentService, wiApiService, logplotName) {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'logplots') return;
    let dataRequest = {
        idWell: selectedNode.properties.idWell,
        name: logplotName,
        option: 'blank-plot'
    };
    return wiApiService.post(wiApiService.CREATE_PLOT, dataRequest);
};

exports.deleteLogplot = function () {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'logplot') return;
    const wiComponentService = __GLOBAL.wiComponentService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.confirmDialog(__GLOBAL.ModalService, 'Confirm delete', 'Are you sure to delete logplot ' + selectedNode.data.label, function(yes){
        if (!yes) return;
        const wiApiService = __GLOBAL.wiApiService;
        wiApiService.delete(wiApiService.DELETE_PLOT, { idPlot: selectedNode.properties.idPlot })
            .then(function(res){
                __GLOBAL.$timeout(function(){
                    selectedNode.data.deleted = true;
                    wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeWiLogPlot(selectedNode.id);
                });
            }).catch(function(err){
                console.error('logplot delete error',err);
            });
    });
};

exports.openLogplotTab = function (wiComponentService, logplotModel) {
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putWiLogPlotRight(logplotModel);
    if (logplotModel.data.opened) return;
    logplotModel.data.opened = true;
    let wiD3Ctrl = wiComponentService.getComponent(logplotModel.properties.name).getwiD3Ctrl();
    let wiApiService = __GLOBAL.wiApiService;
    wiApiService.post(wiApiService.GET_PLOT, { idPlot: logplotModel.id })
        .then(function (plot) {
            let tracks = new Array();

            if (plot.depth_axes && plot.depth_axes.length) {
                plot.depth_axes.forEach(function(depthTrack) {
                    tracks.push(depthTrack);
                });
            }
            if (plot.tracks && plot.tracks.length) {
                plot.tracks.forEach(function (track) {
                    tracks.push(track);
                });
            }

            tracks.sort(function(track1, track2) {
                return track2.orderNum - track1.orderNum;
            });
            let aTrack = tracks.pop();
            while( aTrack ) {
                if (aTrack.idDepthAxis) {
                    wiD3Ctrl.pushDepthTrack(aTrack);
                }
                else if (aTrack.idTrack) {
                    let trackObj = wiD3Ctrl.pushLogTrack(aTrack);
                    if ( !aTrack.lines ) return;
                    aTrack.lines.forEach(function (line) {
                        getCurveData(wiApiService, line.idCurve, function (err, data) {
                            let lineModel = lineToTreeConfig(line);
                            if (!err) wiD3Ctrl.addCurveToTrack(trackObj, data, lineModel.data);
                        });
                    });
                }
                aTrack = tracks.pop();
            }
        });
};

/*exports.updateLogplotProject = function(wiComponentService, idWell, logplot) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    let selectWellProject = findWellProjectById(idWell, project);
    if (!selectWellProject) return;

    if (!Array.isArray(selectWellProject.plots) || selectWellProject.plots.length === 0) {
        selectWellProject.plots = [];
        selectWellProject.plots.push(logplot);
        return;
    }

    for (let plot of selectWellProject.plots) {
        if (!Array.isArray(project.wells)) {
            project.wells = [];
            project.wells.push(well);
        } else {

        }
    }

    let isNewPlot = true;
    for (let i = 0; i < selectWellProject.plots.length; i++) {
        if (selectWellProject.plots[i].idPlot == logplot.idPlot) {
            selectWellProject.plots[i] = logplot;
            isNewPlot = false;
        }
    }
    if (isNewPlot) {
        selectWellProject.plots.push(logplot);
    }

    wiComponentService.emit(wiComponentService.UPDATE_LOGPLOT_EVENT, logplot);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
}

function findWellProjectById(idWell, project) {
    if (!project || !Array.isArray(project.wells)) return;
    for (let well of project.wells) {
        if (well.idWell == idWell) {
            return well;
        }
    }

    return null;
}*/

exports.findLogplotModelById = function (logplotId) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let plot = null;
    visit(rootNodes[0], function(node) {
        if (node.type == 'logplot' && node.id == logplotId) {
            plot = node;
        }
    });
    return plot;
}

function findDatasetById(idDataset) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let dataset = null;
    visit(rootNodes[0], function(node) {
        if (node.type == 'dataset' && node.id == idDataset) {
            dataset = node;
        }
    });
    return dataset;
}
exports.findDatasetById = findDatasetById;

function findWellById(idWell) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let well = null;
    visit(rootNodes[0], function(node) {
        if (node.type == 'well' && node.id == idWell) {
            well = node;
        }
    });
    return well;
}
exports.findWellById = findWellById;

exports.findWellByLogplot = function(idLogplot) {
    var path = getSelectedPath(function(node) {
        return node.type == "logplot" && node.id == idLogplot;
    }) || [];
    return path[1];
};

// exports.parseTime = function (wiComponentService, time) {
//     let moment = wiComponentService.getComponent(wiComponentService.MOMENT);
//     let timestamp = 'DD-MM-YYYY, h:mm:ss a';
//
//     return moment(time).format(timestamp);
// };

exports.trackProperties = function (ModalService, wiComponentService) {
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.trackPropertiesDialog(this.ModalService, function (ret) {
        console.log("OKOK");
    });
};

exports.refreshProjectState = refreshProjectState;
function refreshProjectState() {
    let wiComponentService = __GLOBAL.wiComponentService;
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    if (!project) return;

    return new Promise(function(resolve, reject) {
        let payload = {
            idProject: project.idProject
        };
        let wiApiService = __GLOBAL.wiApiService;
        wiApiService.post(wiApiService.GET_PROJECT, payload)
            .then(function(projectRefresh) {
                wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectRefresh);
                wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);

                resolve();
            })
            .catch(function(err) {
                console.error('refreshProjectState', err);

                reject();
            });
    });
};

exports.renameDataset = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'dataset') return;
    DialogUtils.promptDialog(__GLOBAL.ModalService, "New dataset name", selectedNode.properties.name, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let datasetInfo = selectedNode.properties;
        datasetInfo.name = ret;
        wiApiService.editDataset(datasetInfo, function () {
            __GLOBAL.$timeout(function () {
                selectedNode.data.label = ret;
            })
        });
    });
}

function downloadFile(url) {
    var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
        a.download = filename; // Set the file name.
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
    };
    xhr.open('GET', url);
    xhr.send();
}

exports.exportCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    let wiApiService = __GLOBAL.wiApiService;
    wiApiService.exportCurve(selectedNode.properties.idCurve, function (curveFileUrl) {
        downloadFile(curveFileUrl);
    });
}

exports.renameCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    DialogUtils.promptDialog(__GLOBAL.ModalService, "New curve name", selectedNode.data.label, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let curveInfo = {
            idCurve: selectedNode.properties.idCurve,
            name: ret,
            idDataset: selectedNode.properties.idDataset,
            dataset: selectedNode.properties.dataset,
            unit: selectedNode.properties.unit
        }
        console.log(curveInfo);
        wiApiService.editCurve(curveInfo, function () {
            __GLOBAL.$timeout(function () {
                selectedNode.data.label = ret;
            })
        });
    });
}

exports.copyCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, selectedNode);
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
}

exports.cutCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, selectedNode);
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
}

exports.pasteCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve' && selectedNode.type != 'dataset') return;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let wiApiService = __GLOBAL.wiApiService;
    // if copying
    let copyingCurve = wiComponentService.getComponent(wiComponentService.COPYING_CURVE);
    if (copyingCurve) {
        console.log('copying curve');
        if (copyingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
        let currentDatasetName = "";
        if (selectedNode.type == 'curve') {
            let currentDataset = findDatasetById(selectedNode.properties.idDataset);
            currentDatasetName = currentDataset.properties.name;
        } else {
            currentDatasetName = selectedNode.properties.name;
        }
        let curveInfo = {
            idDataset: selectedNode.properties.idDataset,
            dataset: currentDatasetName,
            name: copyingCurve.properties.name,
            unit: copyingCurve.properties.unit
        }
        wiApiService.createCurve(curveInfo, function (curve) {
            refreshProjectState();
        });
        wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
        return;
    }
    // if cutting
    let cuttingCurve = wiComponentService.getComponent(wiComponentService.CUTTING_CURVE);
    if (cuttingCurve) {
        console.log('cutting curve');
        if (cuttingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
        let curveInfo = {
            idCurve: cuttingCurve.properties.idCurve,
            idDataset: selectedNode.properties.idDataset,
            dataset: cuttingCurve.properties.dataset,
            name: cuttingCurve.properties.name,
            unit: cuttingCurve.properties.unit
        }
        console.log(curveInfo);
        wiApiService.editCurve(curveInfo, function () {
            refreshProjectState();
        });
        wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
        return;
    }
}
function getDisplayMode(currentCurve) {
    if(currentCurve.line && currentCurve.symbol) return "Both";
    if(currentCurve.line && !currentCurve.symbol) return "Line";
    if(!currentCurve.line && currentCurve.symbol) return "Symbol";
    return "None";
}
exports.curveOptions = function (currentTrack, currentCurve) {
    let options = {
        idLine : currentCurve.id,
        idTrack: currentTrack.id,
        showHeader : currentCurve.showHeader, 
        showDataset : true, // add to currentCurve - Canh
        ignoreMissingValues: false,
        alias: currentCurve.alias,
        minValue: currentCurve.minX,
        maxValue: currentCurve.maxX,
        autoValueScale: false,
        displayType : currentCurve.scale,
        displayMode : getDisplayMode(currentCurve),
        wrapMode : "None", //default
        blockPosition : "None", //default
        displayAs : "Normal" //default
    }
    return options;
}
exports.mergeLineObj = function(curveOptions, lineStyle, symbolStyle) {
    let lineObj = {};
    angular.extend(lineObj, curveOptions, lineStyle, symbolStyle);
    lineObj.lineStyle = JSON.stringify(lineObj.lineStyle);
    lineObj.symbolLineDash = JSON.stringify(lineObj.symbolLineDash);
    return lineObj;
};
exports.changeLine = function(lineObj, wiApiService, callback) {
    console.log("testttttt");
    wiApiService.editLine(lineObj, function (result) {
        console.log("OK", result);
        if( callback ) callback(result);
    });
} 

function editProperty(item) {
    let selectedNode = getSelectedNode();
    let properties = selectedNode.properties;
    let wiApiService = __GLOBAL.wiApiService;
    switch (selectedNode.type) {
        case 'well':
            let infoWell = angular.copy(properties);
            infoWell[item.key] = item.value;
            if (JSON.stringify(infoWell) === JSON.stringify(properties)) return;
            console.log(infoWell);
            wiApiService.editWell(infoWell, function () {
                refreshProjectState();
            });
            break;
        case 'dataset':
            let infoDataset = angular.copy(properties);
            infoDataset[item.key] = item.value;
            if (JSON.stringify(infoDataset) === JSON.stringify(properties)) return;
            console.log(infoDataset);
            wiApiService.editDataset(infoDataset, function () {
                refreshProjectState();
            });
            break;
        case 'curve':
            let infoCurve = angular.copy(properties);
            infoCurve[item.key] = item.value;
            if (JSON.stringify(infoCurve) === JSON.stringify(properties)) return;
            console.log(infoCurve);
            wiApiService.editCurve(infoCurve, function () {
                refreshProjectState();
            });
            break;
        case 'logplot':
            let infoLogplot = angular.copy(properties);
            infoLogplot[item.key] = item.value;
            if (JSON.stringify(infoLogplot) === JSON.stringify(properties)) return;
            console.log(infoLogplot);
            wiApiService.editLogplot(infoLogplot, function () {
                refreshProjectState();
            });
            break;
        default:
            return;
    }
}
exports.editProperty = editProperty;
