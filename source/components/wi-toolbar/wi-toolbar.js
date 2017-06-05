var name = 'wiToolbar';

function Controller() {
    var self = this;

    this.$onInit = function () {
        console.log(this.data)
    }
}

app.component(name, {
    templateUrl: 'wi-toolbar.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        data: '<'
    }
});