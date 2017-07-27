let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiSlidingbar = require('./wi-slidingbar.js');
let wiContextMenu = require('./wi-context-menu.js');
let wiDropdown = require('./wi-dropdown');

let graph = require('./visualize/visualize.js');
let wiD3 = require('./wi-d3.js');
let wiLogplot = require('./wi-logplot.js');
let wiElementReadyDirective = require('./wi-element-ready');

let wiRightClick = require('./wi-right-click');

let wiComponentService = require('./wi-component-service');
let wiApiService = require('./wi-api-service')

let utils = require('./utils');

let dragMan = {
    dragging: false,
    draggedObj: null,
    cancelingId: null
};


let app = angular.module('helloapp', [
    wiLogplot.name,
    wiButton.name,
    wiToolbar.name,
    wiSlidingbar.name,
    wiContextMenu.name,
    wiD3.name,
    wiComponentService.name,
    wiElementReadyDirective.name,
    'angularModalService',
    'ngFileUpload',
    wiDropdown.name,
    wiApiService.name
]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);
    wiComponentService.putComponent("UTILS", utils);
    wiComponentService.putComponent('DRAG_MAN', dragMan);

    var wiD3Ctrl = null;
    wiComponentService.on('myPlotD3Area', function(param) {
        wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
    });

    $scope.depthTrackButtonClick = function() {
        wiD3Ctrl.pushDepthTrack();
    }

    $scope.trackButtonClick = function() {
        wiD3Ctrl.pushLogTrack();
    }

    $scope.addData1ButtonClick = function() {
        let track = wiD3Ctrl.getCurrentTrack();
        wiD3Ctrl.addCurveToTrack(track, genSamples([0,1], [0,1000]), {});
    }

    $scope.addData2ButtonClick = function() {
        let track = wiD3Ctrl.getCurrentTrack();
        wiD3Ctrl.addCurveToTrack(track, genSamples([1,2], [0,1100]), {});
    }

    $scope.changeColor = function() {
        wiD3Ctrl.setColor(wiD3Ctrl.getCurrentTrack(), $scope.color);
    }

    $scope.removeCurveButtonClick = function() {
        wiD3Ctrl.removeCurrentCurve();
    }

    $scope.removeTrackButtonClick = function() {
        wiD3Ctrl.removeTrack(wiD3Ctrl.getCurrentTrack());
    }

    $scope.addLeftShadingButtonClick = function() {
        let track = wiD3Ctrl.getCurrentTrack();
        wiD3Ctrl.addLeftShadingToTrack(track, track.getCurrentCurve(), {
            fill: {
                pattern: {
                    foreground: 'red',
                    background: 'blue',
                    name: 'basement'
                }
            },
            positiveFill: {
                color: 'red'
            },
            negativeFill: {
                pattern: {
                    foreground: 'black',
                    background: 'white',
                    name: 'chert'
                }
            }
        });
    }

    $scope.addRightShadingButtonClick = function() {
        let track = wiD3Ctrl.getCurrentTrack();
        wiD3Ctrl.addRightShadingToTrack(track, track.getCurrentCurve(), {});
    }

    $scope.addCustomShadingButtonClick = function() {
        let track = wiD3Ctrl.getCurrentTrack();
        wiD3Ctrl.addCustomShadingToTrack(track, track.getCurrentCurve(), 0.5, {});
    }

    $scope.removeShadingButtonClick = function() {
        wiD3Ctrl.removeCurrentShading();
    }

    function genSamples(extentX, extentY) {
        let samples = [];
        let transform = d3.scaleLinear().domain([0,1]).range(extentX);

        for (let i = extentY[0]; i <= extentY[1]; i++) {
            samples.push({y: i, x: transform(Math.random())});
        }
        return samples;
    }
});
