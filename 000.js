//http://blog.andrewray.me/how-to-clone-a-nested-array-in-javascript/
function arrayClone(arr) {
    var i, copy;

    if (Array.isArray(arr)) {
        copy = arr.slice(0);
        for (i = 0; i < copy.length; i++) {
            copy[i] = arrayClone(copy[i]);
        }
        return copy;
    } else if (typeof arr === 'object') {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }
}

//caching DOM elements
var cache = {
    body: document.body,
    playGround: document.getElementById('playground-table')
};

//moving cells of playground into multidimensional arrays
var playGroundArray = [];
for (var i = 0; i < cache.playGround.rows.length; i++) {
    playGroundArray[i] = [];

    for (var j = 0; j < cache.playGround.rows[0].cells.length; j++) {
        playGroundArray[i][j] = cache.playGround.rows[i].cells[j];
    }
}

//calculating starting coordinates of snake head
var startCellCoordX = Math.floor(playGroundArray[0].length / 2);
var startCellCoordY = Math.floor(playGroundArray.length / 2);

//body of snake
//each subarray consists of [class, row number, column number] / [class, y, x]
var snake = [];
var snakeStartLength = 4;
var snakeSpeed = 700;

for (var i = 0; i < snakeStartLength; i++) {
    snake[i] = ['snake_body', startCellCoordY - i, startCellCoordX];
}
snake[0][0] = 'snake_head'; //constant

var snakeOld; //to store old values of snake coordinates


//placing snake on a playground
//counters: i - Y coordinate (as a snake is placed vertically) stands for starting point
//snake builds from head to tail;
//j - each part (subarray) of snake; k - loop works as many times as the length of snake is.
for (var i = startCellCoordY, j = 0, k = snake.length; k > 0; i--, j++, k--) {
    playGroundArray[i][startCellCoordX].classList.add(snake[j][0]);
}

//apple block
//array consists of [class, row number, column number] / [class, y, x]
var appleArray = [];
appleArray[0] = 'apple'; //constant

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function placeApple() {
    var appleIsOnSnake;
    do {
        appleIsOnSnake = false;
        appleArray[1] = getRandomInt(0, playGroundArray.length); //Y
        appleArray[2] = getRandomInt(0, playGroundArray[0].length); //X

        for (var i = 0; i < snake.length; i++) {
            if (appleArray[1] == snake[i][1] && appleArray[2] == snake[i][2]) {
                appleIsOnSnake = true;
                break;
            }
        }
    } while (appleIsOnSnake == true);

    playGroundArray[ appleArray[1] ][ appleArray[2] ].classList.toggle('apple');
}
var appleTemp;

function removeApple() {
    appleTemp = document.querySelectorAll('.apple');
    appleTemp[0].classList.remove('apple');
}

placeApple();

//move functions
function moves() {
    //changing snake coordinates in subarrays
    for (var i = 1; i < snake.length; i++) {
        for (var j = 1; j < snake[i].length; j++) {
            snake[i][j] = snakeOld[i - 1][j];
        }
    }
   
    //checking if snake doesn't bump into itself
    for (var i = 1; i < snake.length; i++) {
        if (snake[0][1] == snake[i][1] && snake[0][2] == snake[i][2]) {
            return error();
        }
    }
    //applying classes to build new snake
    //counters:
    //i - snake/snakeOld part number; [1] stands for Y coordinate - [2] for X
    for (var i = 0; i < snake.length; i++) {
        playGroundArray[ snake[i][1] ][ snake[i][2] ].classList.add(snake[i][0]);
        playGroundArray[ snakeOld[i][1] ][ snakeOld[i][2] ].classList.remove(snake[i][0]);
    }
    //eating apple
    if (appleArray[1] == snake[0][1] && appleArray[2] == snake[0][2]) {
        snake.push(snakeOld[ snakeOld.length - 1 ]);
        removeApple();
        placeApple();
    }    
}
var timer; //to store setTimeout for curent move
var breakSnake = false; //variable to store if snake bumped into itself or not
//if true - pass it to return function (stop moving in background)

function moveLeftStep() {
    if (breakSnake) {
        return;
    }
    snakeOld = arrayClone(snake);

    snake[0][2] = snake[0][2] - 1;
    if (snake[0][2] < 0) {
        return error();
    }

    moves();

    timer = setTimeout(moveLeftStep, snakeSpeed);
}
function moveUpStep() {
    if (breakSnake) {
        return;
    }
    snakeOld = arrayClone(snake);

    snake[0][1] = snake[0][1] - 1;
    if (snake[0][1] < 0) {
        return error();
    }

    moves();

    timer = setTimeout(moveUpStep, snakeSpeed);
}
function moveRightStep() {
    if (breakSnake) {
        return;
    }
    snakeOld = arrayClone(snake);

    snake[0][2] = snake[0][2] + 1;
    if (snake[0][2] > playGroundArray[0].length - 1) {
        return error();
    }

    moves();

    timer = setTimeout(moveRightStep, snakeSpeed);
}
function moveDownStep() {
    if (breakSnake) {
        return;
    }
    snakeOld = arrayClone(snake);

    snake[0][1] = snake[0][1] + 1;
    if (snake[0][1] > playGroundArray.length - 1) {
        return error();
    }

    moves();

    timer = setTimeout(moveDownStep, snakeSpeed);
}

var currentKeyCode = 40; //variable to keep current direction
//in order to be unable to move the opposite direction

//detecting pressed key
document.addEventListener("keydown", function(e) {
    if (e.keyCode == 37 && currentKeyCode != 39) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        moveLeftStep();
    } else if (e.keyCode == 38 && currentKeyCode != 40) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        moveUpStep();
    } else if (e.keyCode == 39 && currentKeyCode != 37) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        moveRightStep();
    } else if (e.keyCode == 40 && currentKeyCode != 38) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        moveDownStep();
    }
});

//lose messages
var errorBlock = document.createElement('div');
errorBlock.classList.add('lose_message_wrapper');
errorBlock.innerHTML = '<div class="lose_message"><h2>Sorry, you lose :(</h2><div class="restart" onclick="reloadPage()">Restart</div></div>';

function error() {
    cache.body.classList.add('error');
    cache.body.insertBefore(errorBlock, cache.body.firstChild);
    breakSnake = true;
}

//restart button function...doesn't work in codepen.io
function reloadPage() {
    location.reload();
}


