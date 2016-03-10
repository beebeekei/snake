var helpers = {
    //http://blog.andrewray.me/how-to-clone-a-nested-array-in-javascript/
    arrayClone: function(arr) {
        var i, copy;

        if (Array.isArray(arr)) {
            copy = arr.slice(0);
            for (i = 0; i < copy.length; i++) {
                copy[i] = helpers.arrayClone(copy[i]);
            }
            return copy;
        } else if (typeof arr === 'object') {
            throw 'Cannot clone array containing an object!';
        } else {
            return arr;
        }
    },
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    //disabling arrow and space keys scrolling in browser
    //http://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser/8916697#8916697
    scrollDisable: function() {
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
    }
};

helpers.scrollDisable();

//caching DOM elements
var cache = {
    body: document.body,
    playGround: document.getElementById('playground-table'),
    scoreValue: document.getElementById('score_value'),
    highscoreValue: document.getElementById('highscore_value'),
    restartButton: document.getElementById('restart'),
    error: document.getElementsByClassName('error'),
    lose_message: document.getElementsByClassName('lose_message_wrapper')
};

//initial value
cache.highscoreValue.innerHTML = 0;

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

var timer; //to store setTimeout for current move
var breakSnake = false; //variable to store if snake bumped into itself or not
//if true - pass it to return function (stop moving in background)

//lose messages
var errorBlock = document.createElement('div');
errorBlock.classList.add('lose_message_wrapper');
errorBlock.innerHTML = '<div class="card-reveal"><h2>Sorry, you lose :(</h2></div>';

function error() {
    cache.body.classList.add('error');
    cache.body.insertBefore(errorBlock, cache.body.firstChild);
    breakSnake = true;
}

var snake = {
    body: [], //each subarray will consist of [class, row number, column number] / [class, y, x]
    bodyOld: [], //to store old values of snake coordinates
    startLength: 4,
    startSpeed: 150,
    //making array of snake
    creating: function() {
        for (var i = 0; i < snake.startLength; i++) {
            snake.body[i] = ['snake_body', startCellCoordY - i, startCellCoordX];
        }
        snake.body[0][0] = 'snake_head'; //constant
    },
    //placing snake on a playground
    //counters: i - Y coordinate (as a snake is placed vertically) stands for starting point
    //snake builds from head to tail;
    //j - each part (subarray) of snake; k - loop works as many times as the length of snake is.
    placing: function() {
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
            //increasing body of a snake by adding part to end (tail coords of snake after eating apple equal to tail coords of old snake)
            snake.body.push(snake.bodyOld[ snake.bodyOld.length - 1 ]);

            //storing score
            cache.scoreValue.innerHTML = snake.body.length - snake.startLength;
            if (parseFloat(cache.highscoreValue.innerHTML) < parseFloat(cache.scoreValue.innerHTML)) {
                cache.highscoreValue.innerHTML = cache.scoreValue.innerHTML;
            }

            apple.remove();
            apple.place();

            //acceleration of snake with every apple eaten
            if (snakeSpeed > 0) {
                snakeSpeed = snakeSpeed - 2;
            }
        }
    },
    step: function(direction) {
        if (breakSnake) {
            return;
        }

        snake.bodyOld = helpers.arrayClone(snake.body);

        if (direction == 'left') {
            snake.body[0][2] = snake.body[0][2] - 1;
            if (snake.body[0][2] < 0) {
                return error();
            }
        } else if (direction == 'up') {
            snake.body[0][1] = snake.body[0][1] - 1;
            if (snake.body[0][1] < 0) {
                return error();
            }
        } else if (direction == 'right') {
            snake.body[0][2] = snake.body[0][2] + 1;
            if (snake.body[0][2] > playGroundArray[0].length - 1) {
                return error();
            }
        } else if (direction == 'down') {
            snake.body[0][1] = snake.body[0][1] + 1;
            if (snake.body[0][1] > playGroundArray.length - 1) {
                return error();
            }
        }

        snake.moves();

        timer = setTimeout(function() {
            snake.step(direction);
        }, snakeSpeed);
    }
};

var apple = {
    array: [], //array will consist of [class, row number, column number] / [class, y, x]
    //we need to place apple on board with random coords - but not to place on a snake
    place: function() {
        apple.array[0] = 'apple'; //constant

        var appleIsOnSnake;

        do {
            appleIsOnSnake = false;
            this.array[1] = helpers.getRandomInt(0, playGroundArray.length); //Y
            this.array[2] = helpers.getRandomInt(0, playGroundArray[0].length); //X

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
        var appleCell = document.querySelectorAll('.apple');
        appleCell[0].classList.remove('apple');
    }
};

function restartGame() {
    //erasing values from previous game and starting game again
    clearTimeout(timer);
    previousKeyCode = 40;
    cache.scoreValue.innerHTML = 0;
    if (cache.error[0] != undefined) {
        cache.error[0].classList.toggle('error');
        cache.body.removeChild(cache.lose_message[0]);
    }
    for (var i = 0; i < cache.playGround.rows.length; i++) {
        for (var j = 0; j < cache.playGround.rows[0].cells.length; j++) {
            playGroundArray[i][j].className = "cell";
        }
    }
    snake.body = [];
    for (var i = 0; i < snake.startLength; i++) {
        snake.body[i] = ['snake_body', startCellCoordY - i, startCellCoordX];
    }
    breakSnake = false;

    snake.creating();
    snake.placing();
    snakeSpeed = snake.startSpeed;
    apple.place();
}

//restart button
cache.restartButton.addEventListener("click", restartGame);

var previousKeyCode = 40; //variable to keep previous direction
//in order to be unable to move the opposite direction

//detecting pressed key
document.addEventListener("keydown", function(e) {
    function arrowKey(direction) {
        previousKeyCode = e.keyCode;
        clearTimeout(timer);
        snake.step(direction);
    }
    if (e.keyCode == 37 && previousKeyCode != 39) {
        arrowKey('left');
    } else if (e.keyCode == 38 && previousKeyCode != 40) {
        arrowKey('up');
    } else if (e.keyCode == 39 && previousKeyCode != 37) {
        arrowKey('right');
    } else if (e.keyCode == 40 && previousKeyCode != 38) {
        arrowKey('down');
    } else if (e.keyCode == 13) {
        restartGame();
    }
});

//game block
snake.creating();
snake.placing();
var snakeSpeed = snake.startSpeed;
apple.place();
