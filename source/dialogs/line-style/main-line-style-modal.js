var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService', 'kendo.directives']);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.lineStyleDialog(ModalService, function(ret) {
            console.log(ret);
        });
    }
});
