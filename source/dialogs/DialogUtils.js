/**
 * Created by cuong on 6/15/2017.
 */

exports.newProjectDialog = function ($scope, ModalService) {
    var self = this;
    console.log("new project dialog");
    function ModalController($scope, close) {
        this.close = function (ret) {
            close(ret, 500); // close, but give 500ms for bootstrap to animate
        };

        this.onOK = function () {
            if (typeof $scope.name == 'undefined') {
                var err = 'NewProject: Project Name is required!';
                return {error: err};
            } else if (typeof $scope.location == 'undefined') {
                var err = 'NewProject: Location is required';
                return {error: err};
            } else {
                return {
                    name: $scope.name,
                    location: $scope.location,
                    company: $scope.company,
                    department: $scope.department,
                    description: $scope.description
                }
            }
        }
    }

    ModalService.showModal({
        templateUrl: 'new-project/new-project-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log("Modal finally close: ", ret);
        });
    });
};
exports.openProjectDialog = function($scope, ModalService, callback) {
    function ModalController($scope, close) {
        console.log("modal controller created");
        this.close = function(retValue) {
            console.log("returnValue:", retValue);
            close(retValue);
        }
    }
    ModalService.showModal({
        templateUrl: 'open-project/open-project-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        })
    });
}
exports.confirmDialog = function(ModalService, titleMessage, confirmMessage, callback) {
    function ModalController($scope, close) {
        this.title = titleMessage;
        this.confirmMsg = confirmMessage;
        this.close = function(ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "confirm/confirm-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.unitSettingDialog = function(ModalService, callback) {
    function ModalController($scope, close) {
        this.defaultData = {
            Default : {
                unitSystem: "Default",
                caliper : "in", 
                neutron : "v/v",
                gammaRay : "api",
                acoustic : "us/ft",
                pressure : "psi",
                bitSize : "in",
                density : "g/cm3",
                concentration : "v/v",
                permeability : "mD",
                porosity : "v/v",
                angle : "deg",
                resistivity : "ohm.m",
                saturation : "v/v",
                temperature : "degC",
                volume : "v/v",
                sp : "mv",
                length : "m",
                time : "s",
                area : "m2",
                flow : "t",
                speed : "m/s",
                force : "N"    
            },
            Canadian : {
                unitSystem : "Canadian",
                caliper : "cm", 
                neutron : "%",
                gammaRay : "api",
                acoustic : "us/m",
                pressure : "psi",
                bitSize : "cm",
                density : "kg/m3",
                concentration : "ppm",
                permeability : "mD",
                porosity : "v/v",
                angle : "deg",
                resistivity : "ohm.m",
                saturation : "v/v",
                temperature : "degC",
                volume : "v/v",
                sp : "mv",
                length : "m",
                time : "s",
                area : "m2",
                flow : "t",
                speed : "m/s",
                force : "N"    
            },
            English : {
                unitSystem : "English",
                caliper : "in", 
                neutron : "%",
                gammaRay : "api",
                acoustic : "us/ft",
                pressure : "psi",
                bitSize : "in",
                density : "g/cm3",
                concentration : "ppm",
                permeability : "mD",
                porosity : "v/v",
                angle : "deg",
                resistivity : "ohm.m",
                saturation : "v/v",
                temperature : "degC",
                volume : "v/v",
                sp : "mv",
                length : "m",
                time : "s",
                area : "m2",
                flow : "t",
                speed : "m/s",
                force : "N"    
            },
            Metric : {
                unitSystem : "Metric",
                caliper : "cm", 
                neutron : "%",
                gammaRay : "api",
                acoustic : "us/ft",
                pressure : "mBar",
                bitSize : "cm",
                density : "g/cm3",
                concentration : "ppm",
                permeability : "mD",
                porosity : "v/v",
                angle : "deg",
                resistivity : "ohm.m",
                saturation : "v/v",
                temperature : "degC",
                volume : "v/v",
                sp : "mv",
                length : "m",
                time : "s",
                area : "m2",
                flow : "t",
                speed : "m/s",
                force : "N"    
            },
            Russian : {
                unitSystem : "Russian",
                caliper : "cm", 
                neutron : "%",
                gammaRay : "api",
                acoustic : "us/ft",
                pressure : "mBar",
                bitSize : "cm",
                density : "g/cm3",
                concentration : "ppm",
                permeability : "mD",
                porosity : "v/v",
                angle : "deg",
                resistivity : "ohm.m",
                saturation : "v/v",
                temperature : "degC",
                volume : "v/v",
                sp : "mv",
                length : "m",
                time : "s",
                area : "m2",
                flow : "t",
                speed : "m/s",
                force : "N"                 
            }
        };
        this.allData = {
            unitSystem : ["Default", "Canadian", "English", "Metric", "Russian"],
            caliper : ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
            neutron : ["v/v", "Trac", "%", "pu", "imp/min"],
            gammaRay : ["api", "GAPI", "uR/h", "GAMA"], 
            acoustic : ["us/ft", "us/m"],
            pressure : ["psi", "Pa", "kPa", "MPa", "mBar", "Bar", "kg/m2", "atm", "torr"],
            bitSize : ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
            density : ["g/cm3", "kg/m3"],
            concentration : ["v/v", "%", "ppm", "kpp", "m", "1/L", "mS/m", "1/kg", "dB/m", "mV", "galUS/min", "mD/cP", "b/elec", "b/cm3", "m3/d", "MV"],
            permeability : ["mD", "D"],
            porosity : ["v/v", "m3/m3", "ft3/ft3", "%", "imp/min", "ratio"],
            angle : ["deg", "dega", "grad", "rad"],
            resistivity : ["ohm.m", "ratio"],
            saturation : ["v/v", "m3/m3", "ft3/ft3",  "%", "ratio"],
            temperature : ["degC", "degF"],
            volume : ["v/v", "cm3", "L.m"],
            sp : ["mv"],
            length : ["m"],
            time : ["s"],
            area : ["m2"],
            flow : ["t"],
            speed : ["m/s", "m2", "ft/h", "ratio", "ft/s", "m/min", "rpm", "mn/m"],
            force : ["N"]
        };
        function copyObj(sourceObj, destObj) {
            for( var attr in sourceObj ) {
                destObj[attr] = sourceObj[attr];
            }
        };
        this.selectedData = {};
        var self = this;
        copyObj(self.defaultData.Default, self.selectedData);
        this.setDefault = function(){
            copyObj(self.defaultData.Default, self.selectedData);
        };
        this.changeDefault = function(){
            switch (self.selectedData.unitSystem) {
                case "Default":
                    copyObj(self.defaultData.Default, self.selectedData);
                    break;
                case "Canadian":
                    copyObj(self.defaultData.Canadian, self.selectedData);
                    break;
                case "English":
                    copyObj(self.defaultData.English, self.selectedData);
                    break;
                case "Metric":
                    copyObj(self.defaultData.Metric, self.selectedData);
                    break;
                case "Russian":
                    copyObj(self.defaultData.Russian, self.selectedData);
                    break;
                default:
                    console.log("Error: NULL");
                    break;
            }
        };
        console.log(self.selectedData.unitSystem)
        this.close = function(ret) {
            close(ret);
        }                    
    }
    ModalService.showModal({
        templateUrl: "unit-setting/unit-setting-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });

}

exports.addNewDialog = function(ModalService, callbak) {
    function ModalController($scope, close) {

        this.close = function(ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "add-new/add-new-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.wellHeaderDialog = function(ModalService, callback) {
    function ModalController($scope, close) {
        this.wellHeader = ["well1", "well2", "well3"];
        this.close = function(ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "well-header/well-header-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}