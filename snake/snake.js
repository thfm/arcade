/** @type {HTMLCanvasElement} */
var canvas = document.getElementsByTagName("canvas")[0];
canvas.height = canvas.width;
/** @type {CanvasRenderingContext2D} */
var context = canvas.getContext("2d");

function drawRect(x, y, width, height, colour) {
    context.fillStyle = colour;
    context.fillRect(x, y, width, height);
}

const BACKGROUND_COLOUR = "rgb(158,206,69)";
const OVERLAY_TILE_COLOUR = "rgb(170,215,81)";

const TILES_PER_ROW = 25;
// The width (and height) of each tile in pixels
const TILE_SIZE = canvas.width / TILES_PER_ROW; 
const CENTRE_TILE = [Math.floor(TILES_PER_ROW / 2),
    Math.floor(TILES_PER_ROW / 2)];

const SNAKE_COLOUR = "black";
const START_SEGMENT_COUNT = 12;

const FOOD_COLOUR = "red";

const FPS = 10;

const Direction = {
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
}

// Draws a rectangle based on positions in the grid square
function drawGridTile(gridX, gridY, colour) {
    drawRect(gridX * TILE_SIZE, gridY * TILE_SIZE,
        TILE_SIZE, TILE_SIZE, colour);
}

function drawBoard() {
    drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
    for(let i = 0; i < TILES_PER_ROW; i++) {
        for(let j = 0; j < TILES_PER_ROW; j++) {
            // If 'j' (the row number) is even, each tile should be moved
            // horizontally one grid square in order to create a
            // checkered pattern
            let offset = (j % 2 == 0) ? 1 : 0;
            // The overlay grid square is only drawn if 'i' (the column)
            // is even.
            if(i % 2 == 0) {
                drawGridTile(i + offset, j, OVERLAY_TILE_COLOUR);
            }
        }
    }
}

// Checks if two positions are equal (both objects are occupying the
// same grid square)
function collision(pos1, pos2) {
    if(pos1[0] == pos2[0] && pos1[1] == pos2[1]) {
        return true;
    }
    return false;
}

class Snake {
    // The 'position' parameter represents the position of the snake's head
    constructor(position, segmentCount, colour) {
        this.segments = [position]
        // Adds segments to the right of the head's position
        for(let i = 1; i < segmentCount; i++) {
            this.segments.push([position[0] + i, position[1]]);
        }
        this.colour = colour;
        this.direction = Direction.LEFT;
    }

    // Adds a new segment at the head based on the direction of movement
    move() {
        switch(this.direction) {
            case Direction.LEFT: this.addHeadSegment(-1, 0); break;
            case Direction.UP: this.addHeadSegment(0, -1); break;
            case Direction.RIGHT: this.addHeadSegment(1, 0); break;
            case Direction.DOWN: this.addHeadSegment(0, 1); break;
        }
    }

    get head() {
        return this.segments[0];
    }

    // i.e the last segment in the snake
    get tail() {
        return this.segments[this.segments.length - 1];
    }

    // Adds a segment at the head with an offset on each axis
    addHeadSegment(offsetX, offsetY) {
        this.segments.unshift([this.head[0] + offsetX,
            this.head[1] + offsetY]);
    }

    // Adds a segment at the tail with an offset on each axis
    addTailSegment(offsetX, offsetY) {
        this.segments.push([this.tail[0] + offsetX,
            this.tail[1] + offsetY]);
    }

    draw() {
        this.segments.forEach(position => {
            drawGridTile(position[0], position[1], this.colour);
        });
    }

    isDead() {
        let headX = this.head[0];
        let headY = this.head[1];
        // Checks if the head of the snake is outside the grid boundaries
        if(headX < 0 || headX >= TILES_PER_ROW ||
            headY < 0 || headY >= TILES_PER_ROW) {
            return true;
        }

        // Checks if the snake's head is colliding with any of it's
        // own segments
        for(let i = 1; i < this.segments.length; i++) {
            if(collision(this.head, this.segments[i])) {
                return true;
            }
        }
        return false;
    }
}

// Returns the position of a random tile on the grid
function getRandomTile() {
    let gridX = Math.floor(Math.random() * TILES_PER_ROW);
    let grixY = Math.floor(Math.random() * TILES_PER_ROW);
    return [gridX, grixY];
}

class Food {
    constructor(position, colour) {
        this.position = position;
        this.colour = colour;
    }

    draw() {
        drawGridTile(this.position[0], this.position[1], this.colour);
    }
}

snake = new Snake(CENTRE_TILE, START_SEGMENT_COUNT, SNAKE_COLOUR);

// Changes the snake's direction if an arrow key is pressed
document.addEventListener("keydown", function(e) {
    switch(event.keyCode) {
        case 37: snake.direction = Direction.LEFT; break;
        case 38: snake.direction = Direction.UP; break;
        case 39: snake.direction = Direction.RIGHT; break;
        case 40: snake.direction = Direction.DOWN; break;
    }
});

// Spawns the food at a random position
food = new Food(getRandomTile(), FOOD_COLOUR);

function update() {
    snake.move();
    if(collision(snake.head, food.position)) {
        // Resets the food's position
        food.position = getRandomTile();
    } else if(snake.isDead()) {
        // Spawns a new snake with the starting number of segments
        snake = new Snake(CENTRE_TILE, START_SEGMENT_COUNT,
            SNAKE_COLOUR);
    } else {
        // Removes the snake's last segment to give the illusion
        // of movement
        snake.segments.pop();
    }
}

function render() {
    drawBoard();
    snake.draw();
    food.draw();
}

function main() {
    update();
    render();
}

/* https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser */
function isMobile() {
    let match = window.matchMedia || window.msMatchMedia;
    if(match) {
        let mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

// Checks if the player is using a mobile device
if(!isMobile()) {
    setInterval(main, 1000 / FPS);
} else {
    // If they are, the canvas is removed and replaced with an
    // incompatibility message
    canvas.remove();
    let noMobileCompatMsg = document.createElement("p");
    noMobileCompatMsg.innerHTML = "This game does not support " +
        "mobile devices.";
    document.body.appendChild(noMobileCompatMsg);
}
