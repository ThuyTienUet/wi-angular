const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller(wiComponentService) {
    let self = this;
    this.shown = true;

    this.addItem = function (key, value) {
        self.items.push({key, value});
    };

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    this.onChange = function (item) {
        utils.editProperty(item, _.debounce(function () {
            wiComponentService.emit('update-properties', utils.getSelectedNode());
        }, 200));
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-list.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name : '@',
        heading: '@',
        items: '<'
    }
});

exports.name = moduleName;
