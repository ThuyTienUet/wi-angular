function genSamples(nSamples) {
    let samples = [];
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

exports.EditFormatButtonClicked = function() {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    console.error('This function is not implemented');
    utils.error('This function is not implemented');
};

exports.SaveAsLogplotButtonClicked = function() {
    console.log('SaveAsLogplotButton is clicked');
};

exports.SaveAsButtonClicked = function() {
    console.log('SaveAsButton is clicked');
};

exports.PrintButtonClicked = function () {
    let $timeout = this.$timeout;
    let wiLogplotCtrl = this.wiLogplot;
    let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();
    let wiLogplotElement = $(`wi-logplot[id=${wiLogplotCtrl.id}]`);
    // let maxDepth = wiD3Ctrl.getMaxDepth();
    // let minDepth = wiD3Ctrl.getMinDepth();
    // let trackRealLengthCm = (maxDepth - minDepth) * 100;
    let trackHeight = 32767 // max canvas height;
    let trackHeaderHeight = wiLogplotElement.find('.vi-track-header-container').height();
    let trackHorizontalResizer = wiLogplotElement.find('.vi-track-horizontal-resizer').height();
    let trackBodyHeight = trackHeight - trackHeaderHeight - trackHorizontalResizer - 10;
    wiLogplotElement.find('wi-d3').height(trackHeight + 'px');
    wiLogplotElement.find('div.vi-track-body-container').height(trackBodyHeight + 'px');
    let tracks = wiD3Ctrl.getTracks();
    for (let track of tracks) {
        if (track.isDepthTrack()) {
            track.yTicks = 1000;
        }
    }
    wiD3Ctrl.plotAll();
    wiLogplotCtrl.handlers.ScaleFullButtonClicked();
    $timeout(function () {
        let d3area = wiLogplotElement.find('.track-area').clone();
        let lines = wiD3Ctrl.getLines();
        if (lines && lines.length) {
            let lastLineId = lines[lines.length - 1].id;
            for (let line of lines) {
                let img = document.createElement('img');
                img.style.position = "absolute";
                img.src = wiLogplotElement.find(`canvas.vi-track-drawing[id=${line.id}]`).get(0).toDataURL();
                d3area.find(`canvas.vi-track-drawing[id=${line.id}]`).replaceWith(img);
            }
        }
        wiLogplotElement.find('wi-d3').height('unset');
        wiLogplotElement.find('div.vi-track-body-container').height('70%');
        for (let track of tracks) {
            if (track.isDepthTrack()) {
                track.yTicks = 10;
            }
        }
        wiD3Ctrl.plotAll();
        let bodyHtml = '<div class="track-area" style="background-color: #fff; margin: 4px; padding: 4px; flex: 1; display: flex; flex-direction: row;">';
        bodyHtml += d3area.html();
        bodyHtml += '</div>';
        let iframe = document.createElement('iframe');
        // iframe.height = '100%';
        // iframe.width = '100%';
        iframe.onload = function () {
            let doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
            let headHtml = `
                    <link href="vendor/css/bootstrap.min.css" rel="stylesheet" type="text/css">
                    <link href="css/graph.css" rel="stylesheet" type="text/css">
                    <link href="css/wi-logplot.css" rel="stylesheet" type="text/css">
                    <link href="css/wi-d3.css" rel="stylesheet" type="text/css">
                `;
            doc.head.innerHTML = headHtml;
            doc.body.innerHTML = bodyHtml;
            $timeout(function () {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
            });
        }
        document.body.appendChild(iframe);
    })
};

exports.PrintToImageButtonClicked = function() {
    console.log('PrintToImageButton is clicked');
};

function scaleTo(rangeUnit, wiLogplot, wiComponentService) {
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let wiSlidingbarCtrl = wiLogplot.getSlidingbarCtrl();
    let maxDepth = wiD3Ctrl.getMaxDepth();
    let minDepth = wiD3Ctrl.getMinDepth();
    let realLengthCm = (maxDepth - minDepth) * 100;
    let dpCm = utils.getDpcm();
    let trackHeight = $(`wi-logplot[id=${wiLogplot.id}] .vi-track-plot-container`).height();
    let trackHeightCm = trackHeight/dpCm;
    let trackRealLengthCm = trackHeightCm*rangeUnit;
    let rangeHandlerByPercent = (trackRealLengthCm/realLengthCm) * 100;
    // console.log('scale handler', rangeHandlerByPercent, trackRealLengthCm, realLengthCm);
    if (rangeHandlerByPercent > 100) {
        rangeHandlerByPercent = 100;
    }

    wiSlidingbarCtrl.updateRangeSlidingHandler(rangeHandlerByPercent);
}

exports.Scale20ButtonClicked = function() {
    let rangeUnit = 20;
    console.log(this);
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale50ButtonClicked = function() {
    let rangeUnit = 50;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale100ButtonClicked = function() {
    let rangeUnit = 100;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale200ButtonClicked = function() {
    let rangeUnit = 200;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale300ButtonClicked = function() {
    let rangeUnit = 300;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale500ButtonClicked = function() {
    let rangeUnit = 500;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale1000ButtonClicked = function() {
    let rangeUnit = 1000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale2000ButtonClicked = function() {
    let rangeUnit = 2000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale2500ButtonClicked = function() {
    let rangeUnit = 2500;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale3000ButtonClicked = function() {
    let rangeUnit = 3000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale5000ButtonClicked = function() {
    let rangeUnit = 5000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.ScaleFullButtonClicked = function() {
    let rangeUnit = this.wiLogplot.getwiD3Ctrl().getMaxDepth()*100;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.ZoomInButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().zoom(false);
};

exports.ZoomOutButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().zoom(true);
};

exports.CropDisplayButtonClicked = function() {
    console.log('CropDisplayButton is clicked');
};
exports.RangeSpecificButtonClicked = function() {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    DialogUtils.rangeSpecificDialog(this.ModalService, this.wiLogplot, function () {
       console.log("RangeFrom");
    });
}
// exports.RangeFromButtonClicked = function() {
//     console.log('RangeFromButton is clicked');
// };

// exports.RangeToButtonClicked = function() {
//     console.log('RangeToButton is clicked');
// };

// exports.RangeOkButtonClicked = function() {
//     console.log('RangeOkButton is clicked');
// };

exports.ViewWholeWellButtonClicked = function() {
    console.log('ViewWholeWellButton is clicked');
};

exports.AddDepthAxisButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().addDepthTrack();
};

exports.NewTrackButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().addLogTrack('New Track');
};

exports.DuplicateTrackButtonClicked = function() {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS)
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    let curves = currentTrack.getCurves();
    let wiApiService = this.wiApiService;
    let props = currentTrack.getProperties();
    wiD3Ctrl.addLogTrack(props.title, function(track) {
        props.orderNum = track.orderNum;
        props.idTrack = track.id;
        wiApiService.editTrack(props, function(ret) {
            track.setProperties(props);
        });
        if (!curves.length) return;
        curves.forEach(function(curve) {
            wiApiService.post(wiApiService.CREATE_LINE, { idTrack: track.id, idCurve: curve.idCurve })
                .then(function(line) {
                    let newCurve = wiD3Ctrl.addCurveToTrack(track, curve.rawData, {});
                    let newCurveProps = curve.getProperties();
                    newCurveProps.idLine = line.idLine;
                    newCurveProps.idTrack = track.id;
                    console.log('newCurveProps', newCurveProps);
                    newCurveProps.lineStyle = JSON.stringify(newCurveProps.lineStyle);
                    wiApiService.editLine(newCurveProps, function() {
                        newCurve.setProperties(newCurveProps);
                        track.plotCurve(newCurve);
                    });
                })
                .catch(function(err){
                    console.error(err);
                    utils.error(err);
                    return;
                });
        });
    })
};

exports.DeleteTrackButtonClicked = function() {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    let wiApiService = this.wiApiService;
    const DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    DialogUtils.confirmDialog(this.ModalService, "Delete Track", "Are you sure to delete this track?", function (yes) {
            if (!yes) return;
            if (currentTrack.type == 'log-track') {
                wiApiService.removeLogTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
            } else if (currentTrack.type == 'depth-track') {
                wiApiService.removeDepthTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
            } else if (currentTrack.type == 'zone-track') {
                // TO DO
                // Send api to remove zone track
                wiD3Ctrl.removeCurrentTrack();
            }
        }
    );
};

exports.AddMarkerButtonClicked = function() {
    console.log('AddMarkerButton is clicked');
};

exports.AddZoneButtonClicked = function() {
    console.log('AddZoneButton is clicked');
};

exports.AnnotationsButtonClicked = function() {
    console.log('AnnotationsButton is clicked');
};

exports.AddImageButtonClicked = function() {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let [top, bottom] = wiD3Ctrl.getDepthRangeFromSlidingBar();
    let defaultConfig = {
        top: top,
        bottom: bottom,
        left: 0,
        width: 100
    }
    DialogUtils.imagePropertiesDialog(this.ModalService, wiD3Ctrl, defaultConfig, function (config) {
        wiD3Ctrl.addImageToTrack(currentTrack, config);
    })
};

exports.AddShadingButtonClicked = function() {
    console.log('AddShadingButton is clicked');
};

exports.RemoveVisualButtonClicked = function() {
    console.log('RemoveVisualButton is clicked');
};

exports.CrossPlotButtonClicked = function() {
    console.log('CrossPlotButton is clicked');
};

exports.HistogramButtonClicked = function() {
    console.log('HistogramButton is clicked');
};

