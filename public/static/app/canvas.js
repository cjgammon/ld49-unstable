export default class Canvas {
    constructor() {
        this.el = document.createElement('canvas');
        document.body.appendChild(this.el);
        this.resize();
        console.log('it works');
    }
    resize() {
        this.el.width = window.innerWidth;
        this.el.height = window.innerHeight;
    }
}
