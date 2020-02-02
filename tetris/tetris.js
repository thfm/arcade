/** @type {HTMLCanvasElement} */
var canvas = document.getElementsByTagName("canvas")[0];
/** @type {CanvasRenderingContext2D} */
var context = canvas.getContext("2d");

function drawRect(x, y, width, height, colour) {
    context.fillStyle = colour;
    context.fillRect(x, y, width, height);
}

function getFactors(num) {
    let factors = [];
    for(let i = 0; i < num; i++) {
        if(num % i == 0) {
            factors.push(i);
        }
    }
    return factors;
}

function getCommonFactors(a, b) {
    let factors = [getFactors(a), getFactors(b)];
    let common = [];
    factors[0].forEach(factor => {
        if(factors[1].includes(factor)) {
            common.push(factor);
        }
    });
    return common;
}

function getClosestMatch(num, arr) {
    let closest = arr[0];
    arr.forEach(element => {
        let difference = Math.abs(num - element);
        let minDiff = Math.abs(num - closest);
        if(difference < minDiff) {
            closest = element;
        }
    });
    return closest;
}

const BACKGROUND_COLOUR = "black";

const DESIRED_TILE_SIZE = 25;
const TILE_SIZE = getClosestMatch(
    DESIRED_TILE_SIZE,
    getCommonFactors(canvas.width, canvas.height)
);

const FPS = 60;

function drawTile(gridX, gridY, colour) {
    drawRect(gridX * TILE_SIZE, gridY * TILE_SIZE,
        TILE_SIZE, TILE_SIZE, colour);
}

function update() { }

function render() {
    drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
    drawTile(0, 0, "white");
}

function main() {
    update();
    render();
}

setInterval(main, 1000 / FPS);
