const wiServiceName = 'wiComponentService';
const moduleName = 'wi-component-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    let __Controllers = {};
    let handlers = {};
    let _state = {};

    return {
        getComponent: function (componentName) {
            return __Controllers[componentName];
        },
        getD3Area: function(wiLogplotName) {
            return __Controllers[wiLogplotName + 'D3Area'];
        },
        getSlidingBar: function(wiLogplotName) {
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        getSlidingBarForD3Area: function(wiD3AreaName) {
            let wiLogplotName = wiD3AreaName.replace('D3Area', '');
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        getD3AreaForSlidingBar: function(wiSlidingbarName) {
            let wiLogplotName = wiSlidingbarName.replace('Slidingbar', '');
            return __Controllers[wiLogplotName + 'D3Area'];
        },
        putComponent: function (componentName, controller) {
            // console.log('put component');
            // console.log('componentName', componentName);

            __Controllers[componentName] = controller;
        },
        dropComponent: function (componentName) {
            delete __Controllers[componentName];
        },

        setState: function (stateName, state) {
            _state[stateName] = state;
        },
        getState: function (stateName) {
            return _state[stateName];
        },

        on: function (eventName, handlerCb) {
            let eventHandlers = handlers[eventName];
            if (!Array.isArray(eventHandlers)) {
                handlers[eventName] = [];
            }

            handlers[eventName].push(handlerCb);
        },
        emit: function (eventName, data) {
            let eventHandlers = handlers[eventName];
            if (Array.isArray(eventHandlers)) {
                eventHandlers.forEach(function (handler) {
                    handler(data);
                })
            }
        },

        // component
        LOGPLOT_HANDLERS: 'LOGPLOT_HANDLERS',
        HISTOGRAM_HANDLERS: 'HISTOGRAM_HANDLERS',
        TREE_FUNCTIONS: 'tree-functions',
        GLOBAL_HANDLERS: 'GLOBAL_HANDLERS',
        WI_EXPLORER_HANDLERS: 'wi-explorer-handlers',
        WI_EXPLORER: 'WiExplorer',
        GRAPH: 'GRAPH',
        DRAG_MAN: 'DRAG_MAN',
        DIALOG_UTILS:'DIALOG_UTILS',
        LAYOUT_MANAGER: 'LAYOUT_MANAGER',
        UTILS: 'UTILS',
        COPYING_CURVE: 'copying-curve',
        CUTTING_CURVE: 'cutting-curve',
        CROSSPLOT_HANDLERS: 'CROSSPLOT_HANDLERS',
        // MOMENT: 'moment',
        PROJECT_LOADED: 'project-loaded',
        ITEM_ACTIVE_PAYLOAD: 'item-active-payload',
        LIST_FAMILY: 'list-family',
        SELECTED_NODES: 'selected-nodes',
        DUSTBIN: 'dustbin',

        PROJECT_LOGPLOTS: 'project-logplots',
        PROJECT_CROSSPLOTS: 'project-crossplots',
        PROJECT_HISTOGRAMS: 'project-histograms',

        // state name
        ITEM_ACTIVE_STATE: 'item-active-state',

        // event
        ADD_LOGPLOT_EVENT: 'add-logplot-event',
        PROJECT_LOADED_EVENT: 'project-loaded-event',
        PROJECT_UNLOADED_EVENT: 'project-unloaded-event',
        PROJECT_REFRESH_EVENT: 'project-refresh-event',
        DUSTBIN_REFRESH_EVENT: 'dustbin-refresh-event',
        UPDATE_WELL_EVENT: 'update-well-event',
        UPDATE_MULTI_WELLS_EVENT: 'update-multi-wells-event',
        UPDATE_LOGPLOT_EVENT: 'update-logplot-event',
        UPDATE_TRACK_EVENT: 'update-track-event',
        PALETTES: 'PALETTES',
    };
});

exports.name = moduleName;
