let helper = require('./DialogHelper');
module.exports = function(ModalService, curvesData, callback){
    function ModalController(close, wiApiService){
        let self = this;
        window.SC = this;
        self.curvesData = curvesData;
        async.each(self.curvesData, function(curve, callback){
            curve.percent = '0%';
            let payload = {
                idDataset: curve.idDataset,
                idDesCurve: curve.id,
                data: curve.data
            }
            wiApiService.processingDataCurve(payload, function(){
                delete curve.edit;
                curve.dataBK = angular.copy(curve.data);
                callback();
            }, function(percent){
                curve.percent = percent + '%';
            })
        },function(err){
            close(null);
        })

        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'save-curves-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal){
        helper.initModal(modal);
        modal.close.then(function(data){
            if(callback) callback();
            helper.removeBackdrop();
        })
    })
}