exports.ExitButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Exit Program", "Are you sure to exit program?", function (isExit) {
        if (isExit) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
            location.reload();
        }
    })
};
exports.WellImportClicked = function() {
    console.log('Well Import clicked');
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let root = layoutManager.getRoot();
    if (root.contentItems && root.contentItems.length)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'well-import',
        componentName: 'wi-block',
        componentState: {
            templateId: 'well-import'
        },
        title: 'Title'
    });
}
exports.lasZipArchiveUploadDone = function() {
    toastr.info('upload successfully completed');
    angular.element($('wi-stages ul')[0]).scope().ctrl.skip();
}
exports.lasZipArchiveUploadError = function(error) {
    toastr.error('Error: ' + error.reason + " (error:" + error.code + ")");
}
exports.ImportBlockButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'import-block',
        componentName: 'wi-block',
        componentState: {
            templateId: 'import-block'
        },
        title: 'Title'
    });
};

exports.WipmButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'wipm',
        componentName: 'wi-block',
        componentState: {
            templateId: 'wipm'
        }
    });
};

exports.testGetData = function() {
    let wiApiService = this.wiApiService;
    console.log('Test get Data', wiApiService);
    // wiApiService.dataCurve(1, function(dataCurve) {
    //     console.log(dataCurve);
    // });
    window.WIAPISERVICE = wiApiService;

    wiApiService.getProjectInfo(1, function(projectInfo) {
        console.log(projectInfo);
        wiApiService.getProject(projectInfo, function(pInfo) {
            console.log(pInfo);
        });
    });

}