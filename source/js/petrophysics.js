'use strict';
// petrophysics

function calVSHfromGR(grCurve, matrix = 10, shale = 100, type = 'Linear', callback){
    async.series([
    function(cb){
        // cal GR index
        for(let i = 0; i < grCurve.length; i++){
            result[i] = (grCurve[i] - matrix)/(shale - matrix);
        }
        cb();
    },
    function(cb){
        // cal VSH by type
        switch(type){
            case 'Linear':
            cb();
            break;

            case 'Clavier':
            result = result.map(d => {return 1.7 - Math.sqrt(3.38 - Math.pow(d + 0.7, 2))});
            cb();
            break;

            case 'Tertiary':
            result = result.map(d => {return 0.083 * (Math.pow(2, 3.7 * d) - 1)});
            cb();
            break;

            case 'Larionov':
            result = result.map(d => {return 0.33 * (Math.pow(2, 3.7 * d) - 1)});
            cb();
            break;

            case 'Stieber1':
            result = result.map(d => {return d / (2 - d)});
            cb();
            break;

            case 'Stieber3':
            result = result.map(d => {return d / (3 - 2 * d)});
            cb();
            break;

            case 'Stieber2':
            result = result.map(d => {return d / (4 - 3 * d)});
            cb();
            break;
        }
    }], function(err){
        result = result.map(d => parseFloat(d.clamp(0,1).toFixed(4)));
        callback(result);
    })
}
exports.calVSHfromGR = calVSHfromGR;

function calPorosityFromDensity(density, vsh, matrix = 2.65, shale = 2.4, fluid = 1, callback){
    let result = new Array();
    let sh = (matrix - shale)/(matrix - fluid);
    for(let i = 0; i < density.length; i++){
        result[i] = (matrix - density[i])/(matrix - fluid);
        if(vsh){
            result[i] = result[i] - (sh * vsh[i]);
        }
    }
    result = result.map(d => parseFloat(d.clamp(0,1).toFixed(4)));
    callback(result);
}
exports.calPorosityFromDensity = calPorosityFromDensity;

function calSaturationArchie(Rt, porosity, a = 1, m = 2, n = 2, Rw = 0.03, callback){
    let SW = new Array(), SH = new Array(), SW_UNCL = new Array(), BVW = new Array();
    for(let i = 0; i < Rt.length; i++){
        SW_UNCL[i] = Math.pow((a * Rw)/(Rt[i] * Math.pow(porosity[i], m), (1/n)));
        SW[i] = parseFloat(SW_UNCL[i].clamp(0,1).toFixed(4));
        SH[i] = 1 - SW[i];
        BVW[i] = SW[i] * porosity[i];
    }
    callback({
        'water_saturation': SW,
        'hydrocarbon_saturation': SH,
        'water_saturation_unclipped': SW_UNCL,
        'bulk_volume_water': BVW
    })
}
exports.calSaturationArchie = calSaturationArchie;