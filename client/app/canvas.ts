export default class Canvas{

    public el: HTMLCanvasElement = document.createElement('canvas');

    constructor() {
        document.body.appendChild(this.el);
        this.resize();        
    }

    resize() {
        this.el.width = window.innerWidth;
        this.el.height = window.innerHeight;
    }
}