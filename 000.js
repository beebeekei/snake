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

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//caching DOM elements
var cache = {
    body: document.body,
    playGround: document.getElementById('playground-table'),
    score_value: document.getElementById('score_value'),
    highscore_value: document.getElementById('highscore_value')
};

cache.highscore_value.innerHTML = 0;

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

var snake = {
    body: [],
    bodyOld: [],
    startLength: 4,
    snakeSpeed: 700,
    init: function() {
        for (var i = startCellCoordY, j = 0, k = snake.body.length; k > 0; i--, j++, k--) {
            playGroundArray[i][startCellCoordX].classList.add(snake.body[j][0]);
        }
    },
    moves: function() {
        //changing snake coordinates in subarrays
        for (var i = 1; i < snake.body.length; i++) {
            for (var j = 1; j < snake.body[i].length; j++) {
                snake.body[i][j] = snake.bodyOld[i - 1][j];
            }
        }

        //checking if snake doesn't bump into itself
        for (var i = 1; i < snake.body.length; i++) {
            if (snake.body[0][1] == snake.body[i][1] && snake.body[0][2] == snake.body[i][2]) {
                return error();
            }
        }

        //applying classes to build new snake
        //counters:
        //i - snake/snake.bodyOld part number; [1] stands for Y coordinate - [2] for X
        for (var i = 0; i < snake.body.length; i++) {
            playGroundArray[ snake.body[i][1] ][ snake.body[i][2] ].classList.add(snake.body[i][0]);
            playGroundArray[ snake.bodyOld[i][1] ][ snake.bodyOld[i][2] ].classList.remove(snake.body[i][0]);
        }

        //eating apple
        if (apple.array[1] == snake.body[0][1] && apple.array[2] == snake.body[0][2]) {
            snake.body.push(snake.bodyOld[ snake.bodyOld.length - 1 ]);

            //storing score
            cache.score_value.innerHTML = snake.body.length - snake.startLength;
            if (parseFloat(cache.highscore_value.innerHTML) < parseFloat(cache.score_value.innerHTML)) {
                cache.highscore_value.innerHTML = cache.score_value.innerHTML;
            }

            apple.remove();
            apple.place();
        }
    },
    moveLeftStep: function() {
        if (breakSnake) {
            return;
        }
        snake.bodyOld = arrayClone(snake.body);

        snake.body[0][2] = snake.body[0][2] - 1;
        if (snake.body[0][2] < 0) {
            return error();
        }

        snake.moves();

        timer = setTimeout(snake.moveLeftStep, snake.snakeSpeed);
    },
    moveUpStep: function() {
        if (breakSnake) {
            return;
        }
        snake.bodyOld = arrayClone(snake.body);

        snake.body[0][1] = snake.body[0][1] - 1;
        if (snake.body[0][1] < 0) {
            return error();
        }

        snake.moves();

        timer = setTimeout(snake.moveUpStep, snake.snakeSpeed);
    },
    moveRightStep: function() {
        if (breakSnake) {
            return;
        }
        snake.bodyOld = arrayClone(snake.body);

        snake.body[0][2] = snake.body[0][2] + 1;
        if (snake.body[0][2] > playGroundArray[0].length - 1) {
            return error();
        }

        snake.moves();

        timer = setTimeout(snake.moveRightStep, snake.snakeSpeed);
    },
    moveDownStep: function() {
        if (breakSnake) {
            return;
        }
        snake.bodyOld = arrayClone(snake.body);

        snake.body[0][1] = snake.body[0][1] + 1;
        if (snake.body[0][1] > playGroundArray.length - 1) {
            return error();
        }

        snake.moves();

        timer = setTimeout(snake.moveDownStep, snake.snakeSpeed);
    }
};

for (var i = 0; i < snake.startLength; i++) {
    snake.body[i] = ['snake_body', startCellCoordY - i, startCellCoordX];
}
snake.body[0][0] = 'snake_head'; //constant

var apple = {
    array: [],
    place: function() {
        var appleIsOnSnake;
        do {
            appleIsOnSnake = false;
            this.array[1] = getRandomInt(0, playGroundArray.length); //Y
            this.array[2] = getRandomInt(0, playGroundArray[0].length); //X

            for (var i = 0; i < snake.body.length; i++) {
                if (this.array[1] == snake.body[i][1] && this.array[2] == snake.body[i][2]) {
                    appleIsOnSnake = true;
                    break;
                }
            }
        } while (appleIsOnSnake == true);

        playGroundArray[ this.array[1] ][ this.array[2] ].classList.toggle('apple');
    },
    remove: function() {
        var appleTemp = document.querySelectorAll('.apple');
        appleTemp[0].classList.remove('apple');
    }
};

apple.array[0] = 'apple'; //constant

var timer; //to store setTimeout for curent move
var breakSnake = false; //variable to store if snake bumped into itself or not
//if true - pass it to return function (stop moving in background)

//lose messages
var errorBlock = document.createElement('div');
errorBlock.classList.add('lose_message_wrapper');
errorBlock.innerHTML = '<div class="lose_message"><h2>Sorry, you lose :(</h2></div>';

function error() {
    cache.body.classList.add('error');
    cache.body.insertBefore(errorBlock, cache.body.firstChild);
    breakSnake = true;
}

//game block
snake.init();
apple.place();

var currentKeyCode = 40; //variable to keep current direction
//in order to be unable to move the opposite direction

//detecting pressed key
document.addEventListener("keydown", function(e) {
    if (e.keyCode == 37 && currentKeyCode != 39) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        snake.moveLeftStep();
    } else if (e.keyCode == 38 && currentKeyCode != 40) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        snake.moveUpStep();
    } else if (e.keyCode == 39 && currentKeyCode != 37) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        snake.moveRightStep();
    } else if (e.keyCode == 40 && currentKeyCode != 38) {
        currentKeyCode = e.keyCode;
        clearTimeout(timer);
        snake.moveDownStep();
    } else if (e.keyCode == 13) {
        restartGame();
    }
});

function restartGame() {
    //erasing values from previous game and starting game again
    var error = document.getElementsByClassName('error');
    error[0].classList.toggle('error');
    var lose_mes = document.getElementsByClassName('lose_message_wrapper');
    cache.body.removeChild(lose_mes[0]);
    for (var i = 0; i < cache.playGround.rows.length; i++) {
        for (var j = 0; j < cache.playGround.rows[0].cells.length; j++) {
            playGroundArray[i][j].className = "cell";
        }
    }
    var i = 0;
    snake.body = [];
    for (var i = 0; i < snake.startLength; i++) {
        snake.body[i] = ['snake_body', startCellCoordY - i, startCellCoordX];
    }
    snake.body[0][0] = 'snake_head'; //constant

    snake.init();
    apple.place();
}