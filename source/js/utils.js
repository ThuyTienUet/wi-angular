'use strict';

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

exports.error = function (wiComponentService, ModalService, errorMessage) {
    errorMessage = errorMessage || "Something's wrong!";
    console.log("Error: ", errorMessage);
    let wics = wiComponentService || this.wiComponentService;
    let DialogUtils = wics.getComponent('DIALOG_UTILS');
    DialogUtils.errorMessageDialog(ModalService, errorMessage );
}

exports.projectOpen = function (wiComponentService, projectData) {
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectData);
    wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
};

exports.projectClose = function (wiComponentService) {
    wiComponentService.emit(wiComponentService.PROJECT_UNLOADED_EVENT);
};

function getCurveFromId(idCurve, wiComponentService) {
    let rootNode = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNode) return;
    let curve = null;
    rootNode.forEach(function(node) {
        visit(node, function (aNode) {
            if (aNode.type == 'curve' && aNode.id == idCurve) {
                curve = aNode;
            }
        });
    }, this);
    return curve;
}

function lineToTreeConfig(line, wiComponentService) {
    let lineModel = new Object();
    let curveModel = getCurveFromId(line.idCurve, wiComponentService);
    console.log(curveModel);
    lineModel.name = curveModel.properties.name;
    lineModel.type = 'line';
    lineModel.id = line.idLine;
    lineModel.data = {
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
            // style: ,
            // fillStyle: ,
            lineWidth: line.lineWidth,
            lineDash: eval(line.lineStyle),
            // size: 
        }
    }
    return lineModel;
}
exports.lineToTreeConfig = lineToTreeConfig;

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
        unit: "US/F",
        dataset: curve.dataset,
        alias: curve.name // TODO
    };
    curveModel.data = {
        childExpanded: false,
        icon: 'curve-16x16',
        label: curve.name
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

function visit(node, callback) {
    if( node.data && node.data.deleted) return;
    callback(node);
    if (node.children) {
        node.children.forEach(function(child){
            visit(child, callback);
        });
    }
}

exports.getSelectedNode = getSelectedNode;
function getSelectedNode(wiComponentService) {
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes) return;
    let selectedNode = null;
    rootNodes.forEach(function(node) {
        visit(node, function(aNode) {
            if(aNode.data && aNode.data.selected == true)
                selectedNode = aNode;
        });
    });
    console.log("selectedNode:", selectedNode);
    return selectedNode;
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

exports.updateWellProject = function (wiComponentService, well) {
    // update well
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

    wiComponentService.emit(wiComponentService.UPDATE_WELL_EVENT, well);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
};

// todo: refactor
exports.updateWellsProject = function (wiComponentService, wells) {
    // update well
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    for (let well of wells) {
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
    }
    wiComponentService.emit(wiComponentService.UPDATE_MULTI_WELLS_EVENT, wells);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
};

function getCurveDataByName(apiService, idCurve, callback) {
    apiService.post(apiService.CURVE, { idCurve })
        .then(function (curve) {
            // console.log('curve data', curve);
            callback(null, curve);
        })
        .catch(function (err) {
            console.error('getCurveDataByName', err);

            callback(err);
        });
}

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
                        let lineModel = lineToTreeConfig(line, wiComponentService);
                        getCurveDataByName(apiService, idCurve, function (err, data) {
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
    let selectedLogplot = getSelectedNode(wiComponentService);
    let dataRequest = {
        idWell: selectedLogplot.properties.idWell,
        name: logplotName,
        option: 'blank-plot'
    };
    return wiApiService.post(wiApiService.CREATE_PLOT, dataRequest);
};

exports.openLogplotTab = function (wiComponentService, logplotModel) {
    console.log(logplotModel);
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putWiLogPlotRight(logplotModel);
    wiComponentService.emit(wiComponentService.UPDATE_TRACKS_EVENT, logplotModel);
};

exports.updateLogplotProject = function(wiComponentService, idWell, logplot) {
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
}

exports.findLogplotModelById = function (logplotId, wiComponentService) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    if (!project || !Array.isArray(project.wells)) return;

    for (let well of project.wells) {
        if (!Array.isArray(well.plots)) continue;

        for (let plot of well.plots) {
            if (plot.idPlot == logplotId) {
                return plot;
            }
        }
    }

    return null;
}

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

exports.refreshProjectState = function(wiComponentService, wiApiService) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    if (!project) return;

    return new Promise(function(resolve, reject) {
        let payload = {
            idProject: project.idProject
        };

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
