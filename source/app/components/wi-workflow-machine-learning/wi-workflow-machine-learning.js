const name = "wiWorkflowMachineLearning";
const moduleName = "wi-workflow-machine-learning";

var __USERINFO = {
    username: null,
    token: null,
    refreshToken: null
};

function getAuthInfo() {
    __USERINFO.username = window.localStorage.getItem('username');
    __USERINFO.token = window.localStorage.getItem('token');
    __USERINFO.refreshToken = window.localStorage.getItem('refreshToken');
}
getAuthInfo();

function Controller(wiComponentService, wiMachineLearningApiService, wiApiService, $timeout, $scope, $http) {
    let self = this;
    window.WFML = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    this.currentModelType = null;
    
    ////////////////////////////////////////
    const ___PERM_FAM_ID = 172;
    const ___FACIES_FAM_ID = 1198;
    const CURVE_MODEL = 'curve';
    const PERM_DUAL_MODEL = 'anfis';
    const FACIES_SINGLE_MODEL = 'facies';
    const PERM_CURVE_NAME = 'PERM_CORE';
    const FACIES_CURVE_NAME = 'DELTAIC_FACIES';
    const TRAIN_STEP_NAME = 'Train';
    const VERIFY_STEP_NAME = 'Verify';
    const PREDICT_STEP_NAME = 'Predict';
    ////////////////////////////////////////

    const LINEAR_REGRESSION_PARAMS = [];

    const HUBER_REGRESSOR_PARAMS = [{
        name: 'max_iter', 
        type: 'number', 
        value: 100,
        min: 100,
        max: 1000
    }, {
        name: "alpha",
        type: 'number',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }];

    const LASSO_PARAMS = [{
        name: 'max_iter', 
        type: 'number', 
        value: 1000,
        min: 100,
        max: 1000
    }, {
        name: "alpha",
        type: 'number',
        value: 0.1,
        step: 0.1
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }];

    const DECISION_TREE_PARAMS = [{
        name: 'max_features', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'log2',
            value: 1
        }, {
            name: 'sqrt',
            value: 2
        }, {
            name: 'auto',
            value: 3
        }, {
            name: 'None',
            value: 4
        }]
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }];

    const RANDOM_FOREST_REGRESSOR_PARAMS = [{
        name: 'max_features', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'log2',
            value: 1
        }, {
            name: 'sqrt',
            value: 2
        }, {
            name: 'auto',
            value: 3
        }, {
            name: 'None',
            value: 4
        }]
    }, {
        name: "n_estimators",
        type: 'number',
        value: 10,
        min: 10,
        max: 100
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }];

    const SUPPORT_VECTOR_MACHINE_PARAMS = [{
        name: 'kernel', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'rbf',
            value: 1
        }, {
            name: 'linear',
            value: 2
        }, {
            name: 'poly',
            value: 3
        }, {
            name: 'sigmoid',
            value: 4
        }]
    }, {
        name: "gamma",
        type: 'number',
        value: 0.1,
        nullValue: 'auto',
        step: 0.1,
        max: 1
    }, {
        name: "C",
        type: 'number',
        value: 0.1,
        step: 0.1
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }];

    const MULTIPERCEPTRON_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: 1,
        choices: [{
            name: 'Sigmoid',
            value: 1
        }, {
            name: 'Tanh',
            value: 2
        }]
    },{
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    }, {
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value:1
            }, {
                name: "layer 1",
                value:2
            },{
                name: "layer 2",
                value:3
            }]
        }
    },];

    const CONJUGATE_GRADIENT_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: 1,
        choices: [{
            name: 'Sigmoid',
            value: 1
        }, {
            name: 'Tanh',
            value: 2
        }]
    },{
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1000
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1000
    },{
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value:1
            }, {
                name: "layer 1",
                value:2
            },{
                name: "layer 2",
                value:3
            }]
        }
    }];
        
    this.listModelType = {
        name: 'model type',
        type: 'select',
        value: 1,
        choices: [{
            name: "LinearRegression",
            value: 1,
            parameters: LINEAR_REGRESSION_PARAMS
        }, {
            name: "HuberRegressor",
            value: 2,
            parameters: HUBER_REGRESSOR_PARAMS
        }, {
            name: "Lasso",
            value: 3,
            parameters: LASSO_PARAMS
        }, {
            name: "DecisionTreeRegressor",
            value: 4,
            parameters: DECISION_TREE_PARAMS
        }, {
            name: "RandomForestRegressor",
            value: 5,
            parameters: RANDOM_FOREST_REGRESSOR_PARAMS
        }, {
            name: "SupportVectorMachine",
            value: 6,
            parameters: SUPPORT_VECTOR_MACHINE_PARAMS
        }, {
            name: "MultiPerceptron",
            value: 7,
            parameters: MULTIPERCEPTRON_PARAMS
        }, {
            name: "ConjugateGradient",
            value: 8,
            parameters: CONJUGATE_GRADIENT_PARAMS
        }] 
    };

    // this.workflowConfig = {
    //     name: 'CURVE_PREDICTION',
    //     model: {
    //         type: CURVE_MODEL,
    //         inputs: [{class: 'curve input'}, {class: 'curve input'}, {class: 'curve output'}]
    //     },
    //     steps: [
    //         {
    //             name: TRAIN_STEP_NAME
    //         },
    //         {
    //             name: VERIFY_STEP_NAME
    //         },
    //         {
    //             name: PREDICT_STEP_NAME
    //         }
    //     ]
    // };
    
    // this.workflowConfig = {
    //     name: 'PERM_DUAL_MODEL',
    //     model: {
    //         type: PERM_DUAL_MODEL,
    //         inputs: [{class: 'GR'},{class: 'NPHI'},{class: 'RHOB'},{class: 'DT'},{class: 'VCL'},{class: 'PHIE'},{class: 'PERM_CORE'}]
    //     },
    //     steps: [
    //         {
    //             name: VERIFY_STEP_NAME
    //         },
    //         {
    //             name: PREDICT_STEP_NAME
    //         }
    //     ]
    // };
    // this.workflowConfig = {
    //     name: 'FACIES_SINGLE_MODEL',
    //     model: {
    //         type: FACIES_SINGLE_MODEL,
    //         inputs: [{class: 'MD'},{class: 'TVDSS'},{class: 'GR'},{class: 'NPHI'},{class: 'RHOZ'},{class: 'DT'},{class: 'VCL'},{class: 'PHIE'},{class: 'DELTAIC_FACIES'}]
    //     },
    //     steps: [
    //         {
    //             name: VERIFY_STEP_NAME
    //         },
    //         {
    //             name: PREDICT_STEP_NAME
    //         }
    //     ]
    // };
    this.runStep = function(wf, cb) {
        switch(wf.name) {
            case TRAIN_STEP_NAME: 
                console.log('runstep train');
                train(cb);
                break;
            case VERIFY_STEP_NAME:
                console.log('runstep verify');
                verify(cb);
                break;
            case PREDICT_STEP_NAME:
                console.log('runstep predict');
                predict(cb);
                break;
        };
    }

    function getDataCurves(step, callback) {
        let inputCurves = [];
        let inputData = step.inputData;
        if(inputData && inputData.length === 1){
            let inputSet = inputData[0];
            async.eachOf(inputSet.inputs, function(curveInfo, idx, __end){
                wiApiService.dataCurve(curveInfo.value.idCurve, function(curveData){
                    inputCurves[idx] = curveData.map(function(d) {
                        return parseFloat(d.x);
                    });
                    __end();
                });
            }, function(err){
                callback(inputCurves);
            });

        } else {
            console.error("inputData must be an array with one element !!", inputData);
            toastr.error('Choose one dataset');
        }
    }
    function getDataCurvesAndJoin(step, callback){
        let curveInputs = [];
        let inputData = step.inputData;
        if(inputData){
            inputData.forEach(function(iptData, i){
                let j=-1;
                async.each(iptData.inputs, function(curveInfo,__end){
                    wiApiService.dataCurve(curveInfo.value.idCurve, function(curveData){
                        j++;
                        if(i==0) curveInputs[j] = [];
                        curveData.forEach(function(data){
                            curveInputs[j].push(parseFloat(data.x));
                        });
                        __end();
                    });
                }, function(err){
                    if(i==inputData.length-1){
                        callback(curveInputs);
                    }
                });
            });
        }else {
            toastr.error('Choose a dataset', '');
        }
    }
    function filterNull(curves){
        let l = curves.length;
        let filterCurves = [];
        let fillNull = [];
        for(let j = 0; j<l; j++){
            filterCurves[j] = [];
        }
        for(let i = 0; i<curves[0].length; i++){
            let checkNull = true;
            for(let j=0; j<l; j++)
                if(isNaN(curves[j][i])){
                    fillNull.push(i);
                    checkNull = false;
                    break;
                }
            if(checkNull)
                for(let j = 0; j<l; j++){
                    filterCurves[j].push(curves[j][i]);
                }
        }
        return {
            filterCurves: filterCurves,
            fillNull: fillNull
        };
    }
    function fillNullInCurve(fillArr, curve) {
        for(let i in fillArr)
            curve.splice(i, 0, NaN);
    }
    function shortName(name) {
        const __names = {
            LinearRegression: "LR",
            HuberRegressor: "HR",
            Lasso: "LS",
            DecisionTreeRegressor: "DT",
            RandomForestRegressor: "RF",
            MultiPerceptron: "MP",
            ConjugateGradient: "CG",
            SupportVectorMachine: "SVM"
        };
        return __names[name];
    }
    function outputCurveName() {
        let modelType = self.workflowConfig.model.type;
        switch(modelType){
            case CURVE_MODEL:
                let steps = self.workflowConfig.steps;
                let trainingStep = steps[0];
                let trainingCurves = trainingStep.inputData[0].inputs;
                let lastTrainingInputCurve = trainingCurves[trainingCurves.length - 1];
                return lastTrainingInputCurve.name + "-WF" + self.idWorkflow + '-' + shortName(self.currentModelType.name);
            case PERM_DUAL_MODEL:
                return 'PERM_CORE-WF' + self.idWorkflow;
            case FACIES_SINGLE_MODEL:
                return 'DELTAIC_FACIES-WF' + self.idWorkflow;
        }
        return 
    }
    function train(cb){
        let step = self.workflowConfig.steps.filter(function(step){return step.name==TRAIN_STEP_NAME;})[0];
        getDataCurvesAndJoin(step, function(list_curves){
            let curves = filterNull(list_curves).filterCurves;
            let target = curves.splice(curves.length-1, 1)[0];
            let data = curves;
            let params;
            if(self.currentModelType.name == 'LinearRegression')
                params = {};
            else{
                function getValueParam(name, modelType){
                    let parameters = modelType.parameters;
                    let param = parameters.filter(function(param){return param.name==name;});
                    if(param.length){
                        if(param[0].type=='number'){
                            console.log(param[0].name,param[0].value);
                            let value = param[0].value;
                            if(value == undefined){
                                value = param[0].max;
                            }
                            console.log(value);
                            return value;
                        }
                        else if(param[0].type=='select'){
                            if(Number.isInteger(param[0].value))
                                return param[0].choices[0].name;
                            else
                                return param[0].value.name;
                        }
                        else {
                            let layers = [];
                            if(param[0].value.nLayer == undefined)
                                layers = [3,3,3,3];
                            else
                                param[0].value.layerConfig.forEach(function(layer){layers.push(layer.value?layer.value:3);});
                            return layers;
                        }
                    }
                }
                params = {
                    data_scale: [getValueParam('data_min', self.currentModelType), getValueParam('data_max', self.currentModelType)],
                    target_scale: [getValueParam('target_min', self.currentModelType), getValueParam('target_max', self.currentModelType)],
                    max_iter: getValueParam('max_iter', self.currentModelType),
                    alpha: getValueParam('alpha', self.currentModelType),
                    max_features: getValueParam('max_features', self.currentModelType),
                    kernel: getValueParam('kernel', self.currentModelType),
                    gamma: getValueParam('gamma', self.currentModelType),
                    C: getValueParam('C', self.currentModelType),
                    n_estimators: getValueParam('n_estimators', self.currentModelType),
                    layers: getValueParam('Neuron Network Structure', self.currentModelType),
                    activation: getValueParam('activation', self.currentModelType)
                }
            }
            let payload = {
                model_id: __USERINFO.username + '-idWorkflow:' + self.idWorkflow,
                model_type: self.currentModelType.name,
                params: params,
                train: {
                    target: target,
                    data: data
                },
                validation: {
                    target: target,
                    data: data
                }
            };
            console.log(payload);
            wiMachineLearningApiService.trainModel(payload, function(res){
                if(res){
                    toastr.success('Train model success');
                    console.log('train model success', res);
                    cb();
                }else{
                    console.log('train model fail');
                    cb('train model fail');
                }
            });
        });
    };
    
    function verify(cb){
        let _stepVerify = self.workflowConfig.steps.filter(function(step){return step.name==VERIFY_STEP_NAME;})[0];
        getDataCurves(_stepVerify, function(list_curves){
            let verifyCurve = list_curves.splice(list_curves.length-1, 1)[0];
            let indicesObj = filterNull(list_curves);
            let dataCurves = indicesObj.filterCurves;
            let nullPositions = indicesObj.fillNull;
            let payload = null;
            switch(self.workflowConfig.model.type) {
                case CURVE_MODEL:
                    payload = {
                        model_id: self.workflowConfig.name,
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictCurve(payload, function(res){
                        if (res){
                            toastr.success('Predict curve success');
                            console.log('verify success', res);
                            fillNullInCurve(nullPositions, res.target)
                            let lastIdx = _stepVerify.inputData[0].inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepVerify.inputData[0].dataset.idDataset,
                                idFamily: _stepVerify.inputData[0].inputs[lastIdx].value.idFamily,
                                idWell: _stepVerify.inputData[0].well.idWell,
                                // name: _stepVerify.inputData[0].inputs[lastIdx].value.name + '_ML',
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        } else{
                            cb('verify fail');
                        }
                    });
                    break;
                case PERM_DUAL_MODEL:
                    payload = {
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictAnfis(payload, function(res){
                        if (res){
                            toastr.success('Predict curve success');
                            console.log('verify success', res);
                            fillNullInCurve(nullPositions, res.target)
                            let lastIdx = _stepVerify.inputData[0].inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepVerify.inputData[0].dataset.idDataset,
                                idFamily: ___PERM_FAM_ID,
                                idWell: _stepVerify.inputData[0].well.idWell,
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        } else{
                            cb('verify fail');
                        }
                    });
                    break;
                case FACIES_SINGLE_MODEL:
                    payload = {
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictFacies(payload, function(res){
                        if (res){
                            toastr.success('Predict curve success');
                            console.log('verify success', res);
                            fillNullInCurve(nullPositions, res.target)
                            let lastIdx = _stepVerify.inputData[0].inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepVerify.inputData[0].dataset.idDataset,
                                idFamily: ___FACIES_FAM_ID,
                                idWell: _stepVerify.inputData[0].well.idWell,
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        } else{
                            cb('verify fail');
                        }
                    });
                    break;
            };
        });
    };
    function predict(cb){
        let _stepPredict = self.workflowConfig.steps.filter(function(step){return step.name==PREDICT_STEP_NAME;})[0];
        let _stepTrain = self.workflowConfig.steps.filter(function(step){return step.name==TRAIN_STEP_NAME;})[0];
        getDataCurves(_stepPredict, function(list_curves){
            let indicesObj = filterNull(list_curves);
            let dataCurves = indicesObj.filterCurves;
            let nullPositions = indicesObj.fillNull;
            let payload = null;

            switch(self.workflowConfig.model.type){
                case CURVE_MODEL:
                    payload = {
                        model_id: self.workflowConfig.name,
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictCurve(payload, function(res){
                        if(res){
                            toastr.success('Predict curve success');
                            console.log('predict success', res);
                            fillNullInCurve(nullPositions, res.target);
                            if(!_stepTrain.inputData.length){
                                toastr.error('Need train model before predict');
                                return;
                            }
                            let lastIdx = _stepTrain.inputData[0].inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepPredict.inputData[0].dataset.idDataset,
                                idFamily: _stepTrain.inputData[0].inputs[lastIdx].value.idFamily,
                                idWell: _stepPredict.inputData[0].well.idWell,
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        }else{
                            cb('predict fail');
                        }
                    });
                    break;
                case PERM_DUAL_MODEL:
                    payload = {
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictAnfis(payload, function(res){
                        if(res){
                            toastr.success('Predict curve success');
                            console.log('predict success', res);
                            fillNullInCurve(nullPositions, res.target);
                            // let lastIdx = self.workflowConfig.model.inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepPredict.inputData[0].dataset.idDataset,
                                idFamily: ___PERM_FAM_ID,
                                idWell: _stepPredict.inputData[0].well.idWell,
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        }else{
                            cb('predict fail');
                        }
                    });
                    break;
                case FACIES_SINGLE_MODEL:
                    payload = {
                        data: dataCurves
                    };
                    wiMachineLearningApiService.predictFacies(payload, function(res){
                        if(res){
                            toastr.success('Predict curve success');
                            console.log('predict success', res);
                            fillNullInCurve(nullPositions, res.target);
                            // let lastIdx = _stepTrain.inputData[0].inputs.length - 1;
                            let curveInfo = {
                                idDataset: _stepPredict.inputData[0].dataset.idDataset,
                                idFamily: ___FACIES_FAM_ID,
                                idWell: _stepPredict.inputData[0].well.idWell,
                                name: outputCurveName(),
                                data: res.target
                            }
                            saveCurve(curveInfo, function(curveProps) {
                                delete curveInfo.data;
                                cb();
                            });
                        }else{
                            cb('predict fail');
                        }
                    });
                    break;
            }
        });
    };
    let __selectionTop = 0;
    let __selectionLength = 50;
    let __selectionDelta = 10;
    self.filterText = "";
    self.filterText1 = "";
    const CURVE_SELECTION = "1";
    const FAMILY_SELECTION = "2";
    const FAMILY_GROUP_SELECTION = "3";
    self.CURVE_SELECTION = CURVE_SELECTION;
    self.FAMILY_SELECTION = FAMILY_SELECTION;
    self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;

    let __inputChanged = {
        status: false,
        index: []
    };
    let __inputDataLen = 0;

    this.nnConfig = {inputs: [], outputs:[], layers: []};

    function updateNNConfig() {
        if (!self.currentModelType) {
            // self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        if (!self.currentModelType.parameters.length) {
            // self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        let config = self.currentModelType.parameters[self.currentModelType.parameters.length -1];
        if (config.type != 'nnconfig') {
            // self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        self.nnConfig = {inputs: [], outputs:[], layers: []};
        
        self.nnConfig.inputs = self.workflowConfig.model.inputs.filter(function(input){return input.class == 'curve input'});
        self.nnConfig.outputs = self.workflowConfig.model.inputs.filter(function(input){return input.class == 'curve output'});
        self.nnConfig.layers = config.value.layerConfig.map(function(item){
            return item.value;
        });
        saveWorkflow();
        $timeout( function() {
            self.wiNNCtrl.update(self.nnConfig);
        });
    }
    
    this.updateNNConfig = _.debounce(updateNNConfig);    
    setInterval(self.updateNNConfig(), 1000);
    
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        if (self.idWorkflow) {
            wiApiService.getWorkflow(self.idWorkflow, function(workflow) {
                self.workflowConfig = workflow.content;
            });
        }

        // CONFIGURE INPUT TAB
        self.selectionType = "1";

        onSelectionTypeChanged();

        // SELECT INPUT TAB
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };

    this.onClick = function ($index, $event, node) {
        self.selectionList.forEach(function (item) {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    let __familyList;
    function getFamilyList(callback) {
        if (!self.filterText) {
            if (!__familyList) {
                let temp = utils.getListFamily();
                if (temp) {
                    __familyList = temp.map(function (family) {
                        return {
                            id: family.idFamily,
                            data: {
                                label: family.name,
                                icon: "user-define-16x16",
                                selected: false
                            },
                            children: [],
                            properties: family
                        };
                    });
                    callback(__familyList);
                }
                else {
                    wiApiService.listFamily(function (lstFamily) {
                        __familyList = lstFamily.map(function (family) {
                            return {
                                id: family.idFamily,
                                data: {
                                    label: family.name,
                                    icon: "user-define-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: family
                            };
                        });
                        callback(__familyList);
                    });
                }
            }
            else callback(__familyList);
        } else {
            if (!__familyList) {
                let temp = utils.getListFamily();
                if (temp) {
                    __familyList = temp.map(function (family) {
                        return {
                            id: family.idFamily,
                            data: {
                                label: family.name,
                                icon: "user-define-16x16",
                                selected: false
                            },
                            children: [],
                            properties: family
                        };
                    });
                    callback(__familyList.filter(item =>
                        item.data.label
                            .toLowerCase()
                            .includes(self.filterText.toLowerCase())
                    ));
                }
                else {
                    wiApiService.listFamily(function (lstFamily) {
                        __familyList = lstFamily.map(function (family) {
                            return {
                                id: family.idFamily,
                                data: {
                                    label: family.name,
                                    icon: "user-define-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: family
                            };
                        });
                        callback(__familyList.filter(item =>
                            item.data.label
                                .toLowerCase()
                                .includes(self.filterText.toLowerCase())
                        ));
                    });
                }
            }
            else {
                callback(__familyList.filter(item =>
                    item.data.label
                        .toLowerCase()
                        .includes(self.filterText.toLowerCase())
                ));
            }
        }
    }
    this.onSelectionTypeChanged = onSelectionTypeChanged;
    function onSelectionTypeChanged(selType) {
        self.filterText1 = "";
        self.filterText = "";
        self.selectionType = selType || self.selectionType;
        switch (self.selectionType) {
            case CURVE_SELECTION:
                let hash = new Object();
                let wiExplr = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
                let root = null;
                if (wiExplr) root = wiExplr.treeConfig[0];
                if (root) {
                    utils.visit(
                        root,
                        function (node, _hash) {
                            if (node.type == "curve") {
                                _hash[node.data.label] = 1;
                            }
                            return false;
                        },
                        hash
                    );
                    $timeout(() => self.selectionList = Object.keys(hash).map(function (key) {
                        return {
                            id: -1,
                            data: {
                                label: key,
                                icon: "curve-16x16",
                                selected: false
                            },
                            children: [],
                            properties: {}
                        };
                    }));
                }
                else {
                    buildCurveListFromServer(function (curve) {
                        hash[curve.name] = 1;
                    }, function () {
                        $timeout(() => self.selectionList = Object.keys(hash).map(function (key) {
                            return {
                                id: -1,
                                data: {
                                    label: key,
                                    icon: "curve-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: {}
                            };
                        }));
                    });
                }
                break;
            case FAMILY_GROUP_SELECTION:
                let temp = utils.getListFamily();
                let groups = new Set();
                if (temp) {
                    temp.forEach(t => {
                        groups.add(t.familyGroup);
                    });
                    $timeout(function () {
                        self.selectionList = Array.from(groups).map(g => {
                            return {
                                id: -1,
                                data: {
                                    label: g,
                                    icon: "zone-table-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: {}
                            };
                        });
                    });
                } else {
                    wiApiService.listFamily(function (temp) {
                        temp.forEach(t => {
                            groups.add(t.familyGroup);
                        });
                        $timeout(function () {
                            self.selectionList = Array.from(groups).map(g => {
                                return {
                                    id: -1,
                                    data: {
                                        label: g,
                                        icon: "zone-table-16x16",
                                        selected: false
                                    },
                                    children: [],
                                    properties: {}
                                };
                            });
                        });
                    })
                }

                break;
            case FAMILY_SELECTION:
                getFamilyList(function (familyList) {
                    $timeout(function () {
                        self.selectionList = familyList.slice(0, __selectionLength);
                    });
                    __selectionTop = 0;
                });
                break;
            default:
                break;
        }
    }
    function buildCurveListFromServer(cb, done) {
        if (!self.idProject) {
            toastr.error("No project exists");
            return;
        }
        wiApiService.listWells({
            idProject: self.idProject,
            limit: 100000
        }, function (wells) {
            if (!Array.isArray(wells)) {
                toastr.error('Error in listing wells');
                console.error(wells);
                return;
            }
            async.each(wells, function (well, __end) {
                wiApiService.getWell(well.idWell, function (wellProps) {
                    for (let dataset of wellProps.datasets) {
                        for (let curve of dataset.curves) {
                            cb(curve);
                        }
                    }
                    __end();
                })
            }, function (err) {
                done();
            });
        });
    }
    this.onSelectTemplate = function (itemIdx) {
        let __SELECTED_NODE = self.selectionList.find(function (d) {
            return d.data.selected;
        });
        if (__SELECTED_NODE) {
            let inputs = self.workflowConfig.model.inputs;
            let item = inputs[itemIdx];
            item.label = __SELECTED_NODE.data.label;
            item.value = __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.name = item.label;
            item.type = self.selectionType;
            __inputChanged.status = true;
            let tmp = new Set(__inputChanged.index);
            tmp.add(0,1,2);
            __inputChanged.index = Array.from(tmp);
            saveWorkflow();
        } else {
            toastr.error("please select data type!");
        }
    };
    this.onDeleteInput = function (idx) {
        for (let wf of self.workflowConfig.steps) {
            wf.inputData.splice(idx, 1);
        }
        saveWorkflow();
        __inputDataLen--;
    };
    this.upTrigger = function (cb) {
        if (self.selectionType == FAMILY_SELECTION) {
            if (__selectionTop > 0) {
                if (__selectionTop > __selectionDelta) {
                    getFamilyList(function (familyList) {
                        let newItems = familyList
                            .slice(
                                __selectionTop - __selectionDelta,
                                __selectionTop
                            )
                            .reverse();
                        __selectionTop = __selectionTop - __selectionDelta;
                        cb(newItems, self.selectionList);

                    });
                } else {
                    getFamilyList(function (familyList) {
                        let newItems = familyList
                            .slice(0, __selectionTop)
                            .reverse();
                        __selectionTop = 0;
                        cb(newItems, self.selectionList);
                    });
                }
            } else cb([]);
        } else cb([]);
    };
    this.downTrigger = function (cb) {
        if (self.selectionType == FAMILY_SELECTION) {
            getFamilyList(function (familyList) {
                let __selectionBottom = __selectionTop + __selectionLength;
                if (__selectionBottom < familyList.length) {
                    if (familyList.length - __selectionBottom > __selectionDelta) {
                        let newItems = familyList.slice(
                            __selectionBottom + 1,
                            __selectionDelta + __selectionBottom + 1
                        );
                        __selectionTop = __selectionTop + __selectionDelta;
                        cb(newItems, self.selectionList);
                    } else {
                        let newItems = familyList.slice(
                            __selectionBottom + 1,
                            familyList.length
                        );
                        __selectionTop =
                            __selectionTop +
                            (familyList.length - __selectionBottom);
                        cb(newItems, self.selectionList);
                    }
                } else cb([]);
            });
        } else cb([]);
    };
    this.onFilterEnterKey = function (filterText) {
        self.filterText = filterText;
        if (self.selectionType == FAMILY_SELECTION) {
            __selectionTop = 0;
            $timeout(function () {
                getFamilyList(function (familyList) {
                    self.selectionList = familyList.slice(0, __selectionLength);
                });
            });
        }
    };

    // SELECT INPUT TAB
    function modelFrom(rootConfig, wells) {
        wells.forEach(well => {
            let wellModel = utils.createWellModel(well);
            rootConfig.push(wellModel);
            if (well.datasets && well.datasets.length) {
                well.datasets.forEach(dataset => {
                    let datasetModel = utils.createDatasetModel(dataset);
                    wellModel.children.push(datasetModel);
                    dataset.curves.forEach(curve => {
                        datasetModel.children.push(
                            utils.createCurveModel(curve)
                        );
                    });
                });
            }
        });
    }
    function refreshProject() {
        if (!isNaN(self.idProject) && self.idProject > 0) {
            self.projectChanged({ idProject: self.idProject });
        }
    }
    this.refreshProject = refreshProject;
    
    this.getProjectList = function (wiItemDropdownCtrl) {
        if (!self.idProject) {
            wiApiService.getProjectList(null, function (projectList) {
                console.log(projectList);
                wiItemDropdownCtrl.items = projectList.map(function (prj) {
                    return {
                        data: {
                            label: prj.name
                        },
                        properties: prj
                    };
                });
            });
        } else {
            wiApiService.getProjectInfo(self.idProject, function (projectProps) {
                self.projectName = projectProps.name;
                self.projectChanged({ idProject: projectProps.idProject });
            });
        }
    };

    this.projectChanged = function (projectProps) {
        let __idProject = projectProps.idProject;
        if (__idProject > 0) {
            wiApiService.listWells(
                {
                    idProject: __idProject,
                    match:
                        self.prjFilter && self.prjFilter.length
                            ? self.prjFilter
                            : undefined
                },
                function (wells) {
                    self.projectConfig.length = 0;
                    modelFrom(self.projectConfig, wells);
                }
            );
        }
    };
    function draggableSetting() {
        $timeout(function () {
            $(
                'wi-base-treeview#__projectWellTree .wi-parent-node[type="dataset"]'
            ).draggable({
                helper: "clone",
                containment: "document",
                appendTo: document.getElementById("testElement")
            });
        }, 500);
    }
    function matchCurves(curves, matchCriterion) {
        switch (matchCriterion.type) {
            case FAMILY_GROUP_SELECTION:
                let familyList = utils.getListFamily();
                return curves.filter(function (cModel) {
                    if (familyList) {
                        let group = familyList.find(
                            f => {
                                if (cModel.properties) return f.idFamily == cModel.properties.idFamily;
                                return f.idFamily == cModel.idFamily;
                            }
                        );
                        return group
                            ? matchCriterion.value == group.familyGroup
                            : false;
                    }
                });
            case FAMILY_SELECTION:
                return curves.filter(function (cModel) {
                    if (cModel.properties) return matchCriterion.value == cModel.properties.idFamily;
                    return matchCriterion.value == cModel.idFamily;
                });
            case CURVE_SELECTION:
                return curves.filter(function (cModel) {
                    if (cModel.properties) return matchCriterion.value == cModel.properties.name;
                    return matchCriterion.value == cModel.name;
                });
        }
        return [];
    }
    this.droppableSetting = function (wf) {
        let id = wf.name;
        $("wi-workflow-machine-learning #" + id).droppable({
            drop: function (event, ui) {
                let w = $(this.parentElement).width();
                $(this.parentElement).css('width', w);
                let idDataset = parseInt($(ui.draggable[0]).attr("data"));
                let options = new Object();
                for (let node of self.projectConfig) {
                    utils.visit(
                        node,
                        function (_node, _options) {
                            if (
                                _node.type == "dataset" &&
                                _node.id == idDataset
                            ) {
                                _options.result = _node;
                                return true;
                            } else return false;
                        },
                        options
                    );
                    if (options.found) break;
                }
                // populate data into self.inputArray
                if (!options.result) {
                    toastr.error("Dataset doesn't not exist");
                    return;
                }
                let datasetModel = options.result;
                // let datasetName = datasetModel.properties.name;
                let idWell = datasetModel.properties.idWell;
                let wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                let wellName = wellModel.properties.name;
                if (!wf.inputData || !Array.isArray(wf.inputData))
                wf.inputData = new Array();
                let existDataset = wf.inputData.find(i => i.dataset.idDataset == datasetModel.properties.idDataset);
                if (existDataset) return;
                
                let inputs = [];
                
                if(wf.name == PREDICT_STEP_NAME)
                    self.workflowConfig.model.inputs.forEach(function(ipt, idx){
                        if(idx<self.workflowConfig.model.inputs.length-1)
                            inputs.push(ipt);
                    });
                else inputs = self.workflowConfig.model.inputs;
                    

                let inputItems = inputs.map(function (ipt) {
                    let tempItem = {
                        name: ipt.name,
                        choices: matchCurves(datasetModel.children.map(function(curve, idx){return {idCurve: curve.id, name: curve.name, idFamily: curve.properties.idFamily};}), ipt)
                    };
                    tempItem.value = tempItem.choices.length ? tempItem.choices[0] : null;
                    return tempItem;
                });
                
                let inputsNull = inputItems.filter(function(ipt){return ipt.value == null;});
                if (inputsNull.length>0) {
                    for (let missingInput of inputsNull) {
                        toastr.error(missingInput.name + " is missing");
                    }
                    return;
                }

                let input = {
                    well: {
                        idWell: wellModel.properties.idWell,
                        name: wellModel.properties.name
                    },
                    dataset: {
                        idDataset: datasetModel.properties.idDataset,
                        name: datasetModel.properties.name
                    },
                    inputs: inputItems
                };
                switch(wf.name) {
                    case TRAIN_STEP_NAME:
                        $timeout(() => {
                            saveWorkflow();
                            wf.inputData.push(input);
                            __inputDataLen = wf.inputData.length;
                        });
                        break;
                    case PREDICT_STEP_NAME:
                    case VERIFY_STEP_NAME:
                        $timeout(() => {
                            saveWorkflow();
                            wf.inputData[0] = input;
                            __inputDataLen = wf.inputData.length;
                        });

                }
                console.log(wf.inputData);
            }
        });
    };

    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            if (currentNode.data) {
                $timeout(function () {
                    currentNode.data.selected = true;
                });
                let selectedNodes = rootNode.__SELECTED_NODES;
                if (!Array.isArray(selectedNodes)) selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                rootNode.__SELECTED_NODES = selectedNodes;
            }
        }
        if (currentNode.type == "well" && !noLoadData) {
            if (Date.now() - (currentNode.ts || 0) > 20 * 1000) {
                wiApiService.getWell(currentNode.id, function (wellProps) {
                    currentNode.ts = Date.now();
                    if (wellProps.datasets && wellProps.datasets.length) {
                        currentNode.children.length = 0;
                        wellProps.datasets.forEach(dataset => {
                            let datasetModel = utils.createDatasetModel(
                                dataset
                            );
                            currentNode.children.push(datasetModel);
                            dataset.curves &&
                                dataset.curves.length &&
                                dataset.curves.forEach(curve => {
                                    datasetModel.children.push(
                                        utils.createCurveModel(curve)
                                    );
                                });
                        });
                    }
                    bareSelectHandler();
                    callback && callback();
                });
            } else {
                bareSelectHandler();
                callback && callback();
            }
        } else {
            bareSelectHandler();
            callback && callback();
        }
    }
    function unselectAllNodes(rootNode) {
        rootNode.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    this.prjClickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig, true);
    };

    function clickFunction(
        $index,
        $event,
        node,
        rootNode,
        multiNodeFetch = false
    ) {
        node.$index = $index;
        if (!node) {
            unselectAllNodes(rootNode);
            return;
        }
        let selectedNodes = rootNode.__SELECTED_NODES;
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (selectedNodes.length) {
            if (
                !$event.ctrlKey ||
                node.type != selectedNodes[0].type ||
                node.parent != selectedNodes[0].parent
            ) {
                unselectAllNodes(rootNode);
            }
        }
        selectHandler(node, false, rootNode, function () {
            draggableSetting();
        });
    }

    this.validate = function () {
        if(!self.workflowConfig)
            return false;
        for (let input of self.workflowConfig.model.inputs) {
            if (!input.value) return false;
        }
        return true;
    };

    function saveCurve(curveInfo, callback) {
        console.log('save curve', curveInfo);
        getFamilyList(familyList => {
            let family = familyList.find(f => f.data.label == curveInfo.family);
            let payload = {
                data: curveInfo.data,
                idDataset: curveInfo.idDataset,
                idFamily: (family || {}).id || null
            }
            wiApiService.checkCurveExisted(curveInfo.name, curveInfo.idDataset, (curve) => {
                if (curve.idCurve) {
                    payload.idDesCurve = curve.idCurve;
                    curveInfo.idCurve = curve.idCurve;
                } else {
                    payload.curveName = curveInfo.name
                }
                wiApiService.processingDataCurve(payload, function (ret) {
                    if(!curve.idCurve) curveInfo.idCurve = ret.idCurve;
                    let _ret = null;
                    if(!curve.idCurve) {
                        _ret = ret;
                    }else{
                        _ret = curveInfo;
                        _ret.idFamily = payload.idFamily;
                    }

                    callback(_ret);
                })
            })
        });
    }

    this.removeWell = function(wf, i){
        wf.inputData.splice(i, 1);
        saveWorkflow();
    }
    this.addCurveInput = function(){
        self.workflowConfig.model.inputs.unshift({class: "curve input"});
    }
    this.removeCurveInput = function(index){
        let i = self.workflowConfig.model.inputs.length;
        if(i==2)
            toastr.error('Need least at 1 curve input', '');
        else{
            self.workflowConfig.model.inputs.splice(index, 1);
            saveWorkflow();
        }
    }
    this.outputCurveStyle = function(idx){
        if(idx == self.workflowConfig.model.inputs.length -1)
            return {
                "margin-top": "30px"
            }
        return {};
    }
    
    this.onModelTypeListInit = function(wiItemDropdownCtrl) {
        wiItemDropdownCtrl.items = self.listModelType.choices.map(function(choice) {
            return {
                data: {label: choice.name},
                properties: choice
            }
        });
        wiItemDropdownCtrl.selectedItem = wiItemDropdownCtrl.items[0];
        self.currentModelType = wiItemDropdownCtrl.selectedItem.properties;
    }
    this.onModelTypeChanged = function(type) {
        self.currentModelType = type;
        self.updateNNConfig();
    }
    this.nnConfigNLayerChanged = function(nnConfig) {
        if (nnConfig.nLayer < nnConfig.layerConfig.length) {
            nnConfig.layerConfig.splice(nnConfig.nLayer, nnConfig.layerConfig.length - nnConfig.nLayer);
        }
        else {
            let oldLength = nnConfig.layerConfig.length;
            for (let i = 0; i < nnConfig.nLayer - oldLength; i++) {
                nnConfig.layerConfig.push({
                    name: "layer " + (oldLength + i),
                    value: 3
                });
            }
        }
    }
    
    let __running_wf = false;
    function saveWorkflow() {
        if (!self.idWorkflow || __running_wf) return;
        wiApiService.editWorkflow({
            idWorkflow: self.idWorkflow,
            content:self.workflowConfig
        }, function(workflow) {
            console.log('save workflow', workflow);
        });
    }
    this.saveWorkflow = _.debounce(saveWorkflow, 3000);    
    this.finishWizard = function() {
        __running_wf = true;
        async.eachOfSeries(self.workflowConfig.steps, function(step, idx, done){
            if( step.inputData && step.inputData.length != 0) {
                self.runStep(step, done);
            }else {
                async.setImmediate(done);
            }
        }, function(err) {
            if (err) toastr.error(err);
            __running_wf = false;
            console.log('finish');
            utils.refreshProjectState();
            saveWorkflow();
        });
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-workflow-machine-learning.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        idProject: "<",
        idWorkflow: "<"
    }
});

exports.name = moduleName;
