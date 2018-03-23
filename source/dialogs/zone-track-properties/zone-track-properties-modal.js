let helper = require('./DialogHelper');

module.exports = function (ModalService, wiLogplotCtrl, zoneTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let wiLogplotModel = wiLogplotCtrl.getLogplotModel();
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = zoneTrackProperties || {
            showTitle: true,
            title: "New Zone",
            topJustification: "center",
            color: '#ffffff',
            width: utils.inchToPixel(2),
            parameterSet: null
        }
        props.width = utils.pixelToInch(props.width);
        console.log(props);
        this.isShowTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.color = props.color;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = [];
        this.zoomFactor = props.zoomFactor;

        function refreshZoneSets() {
            wiApiService.listZoneSet(wiLogplotModel.properties.idWell, function (zoneSets) {
                $timeout(function(){
                    $scope.$apply(function () {
                        self.zoneSets = zoneSets;
                    });
                });
            });
        }
        refreshZoneSets();
        this.idZoneSet = props.idZoneSet;
        // Dialog buttons
        this.createZoneSet = function () {
            utils.createZoneSet(wiLogplotModel.properties.idWell, function (zoneSetReturn) {
                refreshZoneSets();
                self.idZoneSet = zoneSetReturn.idZoneSet;
            });
        }
        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.color, function (colorStr) {
                self.color = colorStr;
            });
        }
        function doApply(cb) {
            self.error = null;
            if (!self.idZoneSet) {
                self.error = "Zone Set is required";
                return;
            }
            props = {
                showTitle: self.isShowTitle,
                title: self.title,
                topJustification: self.topJustification,
                color: self.color,
                width: self.width,
                parameterSet: self.parameterSet,
                idZoneSet: self.idZoneSet,
                zoomFactor: self.zoomFactor
            }
            if (self.error) return;
            if(cb) cb();
        }
        this.onApplyButtonClicked = function () {
            doApply(function(){
                callback(props);
            });
        }
        this.onOkButtonClicked = function () {
            doApply(function() {
                close(props, 100);
            });
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "zone-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
}
