var name = 'ribbonToolbar';

// todo: read from json file
const DATA_CONFIG = [
    {imgUrl: 'img/ic_folder.png', label: 'file 1'},
    {imgUrl: 'img/ic_folder.png', label: 'file 2'},
    {imgUrl: 'img/ic_folder.png', label: 'file 3'},
    {imgUrl: 'img/ic_folder.png', label: 'file 4'}
];

function Controller() {
    var self = this;

    this.dataConfig = DATA_CONFIG;
}

app.component(name, {
    templateUrl: 'ribbon-toolbar.html',
    controller: Controller,
    controllerAs: name
});
