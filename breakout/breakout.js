/** @type {HTMLCanvasElement} */
var canvas = document.getElementsByTagName("canvas")[0];
/** @type {CanvasRenderingContext2D} */
var context = canvas.getContext("2d");

const BACKGROUND_COLOUR = "black";

const CANVAS_CENTRE = [canvas.width / 2, canvas.height / 2];

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const PADDLE_COLOUR = "rgb(200,72,72)";
// The gap (in pixels) from the paddle to the bottom wall
const WALL_GAP = 50;

const BALL_DIAMETER = 11;
const BALL_COLOUR = "rgb(200,72,72)";
const BALL_SPEED = 5;
// The maximum angle that the ball can rebound from a wall or block
const MAX_REBOUND_ANGLE = 45;

const BLOCK_HEIGHT = 20;
// The distance from the topmost blocks to the top wall
const TOP_OFFSET = 60;
const BLOCKS_PER_ROW = 10;
const ROW_COLOURS = [
    "rgb(200,72,72)",
    "rgb(198,107,59)",
    "rgb(180,122,49)",
    "rgb(162,161,42)",
    "rgb(71,160,72)",
    "rgb(66,72,200)"
];

const WIN_TEXT_FONT = "bold 54px arial";
const WIN_TEXT_COLOUR = "white";

const FPS = 60;

function drawRect(x, y, width, height, colour) {
    context.fillStyle = colour;
    context.fillRect(x, y, width, height);
}

function drawText(text, x, y, font, alignment, colour) {
    context.font = font;
    context.fillStyle = colour;
    context.textAlign = alignment;
    context.fillText(text, x, y);
}

// A generic rectangle class
class Rect {
    constructor(x, y, width, height, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
    }

    draw() {
        drawRect(this.x, this.y, this.width, this.height,
            this.colour);
    }

    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get top() { return this.y; }
    get bottom() { return this.y + this.height; }
}

class Paddle extends Rect {
    constructor(x, y, width, height, colour) {
        super(x, y, width, height, colour);
    }

    get horizontalCentre() {
        return this.x + (this.width / 2);
    }
}

class Ball extends Rect {
    constructor(x, y, width, colour, speed) {
        super(x, y, width, width, colour);
        this.velocityX = speed;
        this.velocityY = speed;
    }

    move() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

// Detects if two rectangles are colliding
function detectCollision(r1, r2) {
    return r1.right > r2.left && r1.bottom > r2.top
        && r1.left < r2.right && r1.top < r2.bottom;
}

function createBlockRows(blocksPerRow, rowColours) {
    blocks = [];
    // The block width is independent of the canvas size
    let blockWidth = canvas.width / blocksPerRow;
    for (let i = 0; i < rowColours.length; i++) {
        for (let j = 0; j < blocksPerRow; j++) {
            blocks.push(new Rect(j * blockWidth, i * BLOCK_HEIGHT + TOP_OFFSET,
                blockWidth, BLOCK_HEIGHT, rowColours[i]));
        }
    }
    return blocks;
}

// Initialises the player paddle at the centre of the screen
player = new Paddle(
    CANVAS_CENTRE[0] - (PADDLE_WIDTH / 2),
    canvas.height - PADDLE_HEIGHT - WALL_GAP,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_COLOUR
);

// Moves the player horizontally based on the mouse position,
// regardless of the location of the canvas
canvas.addEventListener("mousemove", function (e) {
    let canvasLeft = canvas.getBoundingClientRect().left
    player.x = e.clientX - canvasLeft - (player.width / 2);
});

ball = new Ball(CANVAS_CENTRE[0], CANVAS_CENTRE[1], BALL_DIAMETER,
    BALL_COLOUR, BALL_SPEED);

blocks = createBlockRows(BLOCKS_PER_ROW, ROW_COLOURS);

function update() {
    ball.move();
    if (detectCollision(ball, player)) {
        let centreOffset = ball.x - player.horizontalCentre;
        let maxOffset = player.width / 2;
        // Normalises the centre offset between 0 and 1
        centreOffset = centreOffset / maxOffset;
        // Uses the normalised offset to calculate the ball rebound angle
        let reboundAngle = (MAX_REBOUND_ANGLE * Math.PI / 180) * centreOffset;
        // Converts the rebound angle into its component velocity values,
        // inverting the Y
        ball.velocityX = BALL_SPEED * Math.sin(reboundAngle);
        ball.velocityY = -(BALL_SPEED * Math.cos(reboundAngle));
    }

    // Rebounds the ball if it collides with the side walls...
    if (ball.left < 0 || ball.right > canvas.width) {
        ball.velocityX = -ball.velocityX;
    }

    // ... or the top wall
    if (ball.top < 0) {
        ball.velocityY = -ball.velocityY;
    } else if (ball.bottom > canvas.height) {
        // Restarts the game
        blocks = createBlockRows(BLOCKS_PER_ROW, ROW_COLOURS);
        ball.x = CANVAS_CENTRE[0];
        ball.y = CANVAS_CENTRE[1];
        ball.velocityX = BALL_SPEED;
        ball.velocityY = BALL_SPEED;
    }

    blocks.forEach(block => {
        if (detectCollision(ball, block)) {
            // Removes the block from the array
            blocks.splice(blocks.indexOf(block), 1);
            // Rebounds the ball
            ball.velocityY = -ball.velocityY;
        }
    });
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
    ball.draw();
    player.draw();
    blocks.forEach(block => {
        block.draw();
    });

    // Draws the 'win text' if all of the blocks have been destroyed
    if (blocks.length == 0) {
        drawText("YOU WIN!", CANVAS_CENTRE[0], CANVAS_CENTRE[1],
            WIN_TEXT_FONT, "center", WIN_TEXT_COLOUR);
    }
}

function main() {
    update();
    render();
}

setInterval(main, 1000 / FPS);
