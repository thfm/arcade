/** @type {HTMLCanvasElement} */
let canvas = document.getElementsByTagName("canvas")[0];
/** @type {CanvasRenderingContext2D} */
let context = canvas.getContext("2d");
context.font = "bold 40px arial";

const BACK_COLOUR = "black"; // Background colour
 // Foreground colour (used for the net, paddles etc.)
const FORE_COLOUR = "white";

const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 150;
 // Gap between the paddles and adjacent walls
const WALL_GAP = 10;

const BALL_RADIUS = 10;
const MAX_REBOUND_ANGLE = 45;
const MAX_BALL_SPEED = 10;

const NET_WIDTH = 4;

// The 'reaction speed' of the computer paddle
const COMPUTER_SPEED = 0.1;

const FPS = 60;

function drawRect(x, y, width, height, colour) {
    context.fillStyle = colour;
    context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, colour) {
    context.fillStyle = colour;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, colour) {
    context.fillStyle = colour;
    context.fillText(text, x, y);
}

class Paddle {
    constructor(x, y, width, height, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
    }

    draw() {
        drawRect(this.x, this.y, this.width, this.height, this.colour);
    }

    get top() { return this.y; }
    get bottom() { return this.y + this.height; }
    get left() { return this.x; }
    get right() { return this.x + this.width; }

    get vertCentre() { return this.y + (this.height / 2) }
}

class Ball {
    constructor(x, y, radius, colour, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.speed = speed;
        this.curbSpeed();
        this.velocityX = this.speed;
        this.velocityY = this.speed;
    }

    move() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 5;
        this.curbSpeed();
        this.velocityX = this.speed;
        this.velocityY = this.speed;
    }

    // Ensures the ball speed does not exceed the maximum limit
    curbSpeed() {
        this.speed = Math.min(this.speed, MAX_BALL_SPEED);
    }

    draw() {
        drawCircle(this.x, this.y, this.radius, this.colour);
    }

    get top() { return this.y - this.radius; }
    get bottom() { return this.y + this.radius; }
    get left() { return this.x - this.radius; }
    get right() { return this.x + this.radius; }
}

function drawNet() {
    let x = (canvas.width / 2) - (NET_WIDTH / 2);
    for(let i = 0; i <= canvas.height; i += 15) {
        drawRect(x, i, NET_WIDTH, 10, FORE_COLOUR);
    }
}

// 'b' ==> ball
// 'p' ==> paddle (either the player or the computer)
// Returns true if any of the edges are overlapping
function detectCollision(b, p) {
    return b.right > p.left && b.bottom > p.top && b.left < p.right
        && b.top < p.bottom;
}

// Centres the paddles vertically
let paddleY = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
player = new Paddle(WALL_GAP, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT,
    FORE_COLOUR);
let playerScore = 0;

// Moves the player paddle according to the mouse position.
// The position of the top of the canvas is subtracted to ensure
// correct paddle positioning regardless of the page scroll
canvas.addEventListener("mousemove", function(e) {
    let canvasTop = canvas.getBoundingClientRect().top;
    player.y = e.clientY - canvasTop - (player.height / 2);
});

computer = new Paddle(canvas.width - PADDLE_WIDTH - WALL_GAP, paddleY,
    PADDLE_WIDTH, PADDLE_HEIGHT, FORE_COLOUR);
let computerScore = 0;

ball = new Ball(canvas.width / 2, canvas.height / 2, BALL_RADIUS,
    FORE_COLOUR, 5);

function update() {
    ball.move();
    if(ball.top < 0) {
        ball.velocityY = -ball.velocityY;
        // Removes any overlap between the ball and the canvas edge
        // to prevent repeated collisions
        while(ball.top < 0) {
            ball.y += 1;
        }
    } else if(ball.bottom > canvas.height) {
        ball.velocityY = -ball.velocityY;
        // [See 'while' loop in above 'if' block]
        while(ball.bottom > canvas.height) {
            ball.y -= 1;
        }
    }

    // Moves the centre of the paddle towards the ball at a rate defined by
    // the COMPUTER_SPEED constant
    computer.y += COMPUTER_SPEED * (ball.y - computer.vertCentre);

    // Decides which paddle to detect for collisions with the ball, based on
    // whether it is on the left or right side of the canvas
    let focusPaddle = (ball.x < canvas.width / 2) ? player : computer;
    if(detectCollision(ball, focusPaddle)) {
        let centreOffset = ball.y - focusPaddle.vertCentre;
        // Normalises the centreOffset value to between 0 and 1
        centreOffset = centreOffset / (focusPaddle.height / 2);
        let reboundAngle = (MAX_REBOUND_ANGLE * Math.PI / 180) * centreOffset;
        let horizDirection = (focusPaddle == player) ? 1 : -1;
        // Calculates the component velocity values in each axis based on
        // the rebound angle of the ball
        ball.velocityX = horizDirection * ball.speed * Math.cos(reboundAngle);
        ball.velocityY = ball.speed * Math.sin(reboundAngle);
        ball.speed += 0.25;
        ball.curbSpeed();
    }

    if(ball.left < 0) {
        computerScore++;
        ball.reset();
    } else if(ball.right > canvas.width) {
        playerScore++;
        ball.reset();
    }
}

function render() {
    // Reset the canvas to a black background
    drawRect(0, 0, canvas.width, canvas.height, BACK_COLOUR);
    drawNet();
    drawText(playerScore, 10, 40, FORE_COLOUR);
    drawText(computerScore, (canvas.width / 2) + 10, 40, FORE_COLOUR);
    player.draw();
    computer.draw();
    ball.draw();
}

function main() {
    update();
    render();
}

setInterval(main, 1000 / FPS);
