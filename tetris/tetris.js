/** @type {HTMLCanvasElement} */
var canvas = document.getElementsByTagName("canvas")[0];
/** @type {CanvasRenderingContext2D} */
var context = canvas.getContext("2d");

function drawRect(x, y, width, height, colour) {
    context.fillStyle = colour;
    context.fillRect(x, y, width, height);
}

const BACKGROUND_COLOUR = "black";

const FPS = 60;

function update() { }

function render() {
    drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
}

function main() {
    update();
    render();
}

setInterval(main, 1000 / FPS);
