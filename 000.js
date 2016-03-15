var game = {
    helpers: {
        //http://blog.andrewray.me/how-to-clone-a-nested-array-in-javascript/
        arrayClone: function(arr) {
            var i, copy;

            if (Array.isArray(arr)) {
                copy = arr.slice(0);
                for (i = 0; i < copy.length; i++) {
                    copy[i] = game.helpers.arrayClone(copy[i]);
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
    },
    //caching DOM elements
    cache: {
        body: document.body,
        playGround: document.getElementById('playground-table'),
        scoreValue: document.getElementById('score_value'),
        highscoreValue: document.getElementById('highscore_value'),
        restartButton: document.getElementById('restart'),
        error: document.getElementsByClassName('error'),
        lose_message: document.getElementsByClassName('lose_message_wrapper')
    },
    playGroundArray: [],
    //calculating starting coordinates of snake head
    startCellCoordX: function() {
        return Math.floor(game.playGroundArray[0].length / 2);
    },
    startCellCoordY: function() {
        return Math.floor(game.playGroundArray.length / 2);
    },
    timer: null, //to store setTimeout for current move
    breakSnake: false, //variable to store if snake bumped into itself or not
    //if true - pass it to return function (stop moving in background)
    error: function() {
        //lose messages
        var errorBlock = document.createElement('div');
        errorBlock.classList.add('lose_message_wrapper');
        errorBlock.innerHTML = '<div class="card-reveal"><h2>Sorry, you lose :(</h2></div>';

        game.cache.body.classList.add('error');
        game.cache.body.insertBefore(errorBlock, game.cache.body.firstChild);
        game.breakSnake = true;
    },
    previousKeyCode: 40, //variable to keep previous direction
    //in order to be unable to move the opposite direction
    start: function() {
        game.helpers.scrollDisable();

        game.cache.highscoreValue.innerHTML = 0; //initial value

        //moving cells of playground into multidimensional arrays
        for (var i = 0; i < game.cache.playGround.rows.length; i++) {
            game.playGroundArray[i] = [];

            for (var j = 0; j < game.cache.playGround.rows[0].cells.length; j++) {
                game.playGroundArray[i][j] = game.cache.playGround.rows[i].cells[j];
            }
        }
        game.snake.creating();
        game.snake.placing();
        //variable to keep current snake speed, which increases with every apple eaten
        game.snake.snakeSpeed = game.snake.startSpeed;
        game.apple.place();

        //restart button
        game.cache.restartButton.addEventListener("click", game.restart);

        //detecting pressed key
        document.addEventListener("keydown", function(e) {
            function arrowKey(direction) {
                game.previousKeyCode = e.keyCode;
                clearTimeout(game.timer);
                game.snake.step(direction);
            }
            if (e.keyCode == 37 && game.previousKeyCode != 39) {
                arrowKey('left');
            } else if (e.keyCode == 38 && game.previousKeyCode != 40) {
                arrowKey('up');
            } else if (e.keyCode == 39 && game.previousKeyCode != 37) {
                arrowKey('right');
            } else if (e.keyCode == 40 && game.previousKeyCode != 38) {
                arrowKey('down');
            } else if (e.keyCode == 13) {
                game.restart();
            }
        });
    },
    snake: {
        body: [], //each subarray will consist of [class, row number, column number] / [class, y, x]
        bodyOld: [], //to store old values of snake coordinates
        startLength: 4,
        startSpeed: 150,
        snakeSpeed: null,
        //making array of snake
        creating: function() {
            for (var i = 0; i < game.snake.startLength; i++) {
                game.snake.body[i] = ['snake_body', game.startCellCoordY() - i, game.startCellCoordX()];
            }
            game.snake.body[0][0] = 'snake_head'; //constant
        },
        //placing snake on a playground
        //counters: i - Y coordinate (as a snake is placed vertically) stands for starting point
        //snake builds from head to tail;
        //j - each part (subarray) of snake; k - loop works as many times as the length of snake is.
        placing: function() {
            for (var i = game.startCellCoordY(), j = 0, k = game.snake.body.length; k > 0; i--, j++, k--) {
                game.playGroundArray[i][game.startCellCoordX()].classList.add(game.snake.body[j][0]);
            }
        },
        moves: function() {
            //changing snake coordinates in subarrays
            for (var i = 1; i < game.snake.body.length; i++) {
                for (var j = 1; j < game.snake.body[i].length; j++) {
                    game.snake.body[i][j] = game.snake.bodyOld[i - 1][j];
                }
            }

            //checking if snake doesn't bump into itself
            for (var i = 1; i < game.snake.body.length; i++) {
                if (game.snake.body[0][1] == game.snake.body[i][1] && game.snake.body[0][2] == game.snake.body[i][2]) {
                    return game.error();
                }
            }

            //applying classes to build new snake
            //counters:
            //i - snake/snake.bodyOld part number; [1] stands for Y coordinate - [2] for X
            for (var i = 0; i < game.snake.body.length; i++) {
                game.playGroundArray[ game.snake.body[i][1] ][ game.snake.body[i][2] ].classList.add(game.snake.body[i][0]);
                game.playGroundArray[ game.snake.bodyOld[i][1] ][ game.snake.bodyOld[i][2] ].classList.remove(game.snake.body[i][0]);
            }

            //eating apple
            if (game.apple.array[1] == game.snake.body[0][1] && game.apple.array[2] == game.snake.body[0][2]) {
                //increasing body of a snake by adding part to end (tail coords of snake after eating apple equal to tail coords of old snake)
                game.snake.body.push(game.snake.bodyOld[ game.snake.bodyOld.length - 1 ]);

                //storing score
                game.cache.scoreValue.innerHTML = game.snake.body.length - game.snake.startLength;
                if (parseFloat(game.cache.highscoreValue.innerHTML) < parseFloat(game.cache.scoreValue.innerHTML)) {
                    game.cache.highscoreValue.innerHTML = game.cache.scoreValue.innerHTML;
                }

                game.apple.remove();
                game.apple.place();

                //acceleration of snake with every apple eaten
                if (game.snake.snakeSpeed > 0) {
                    game.snake.snakeSpeed = game.snake.snakeSpeed - 2;
                }
            }
        },
        step: function(direction) {
            if (game.breakSnake) {
                return;
            }

            game.snake.bodyOld = game.helpers.arrayClone(game.snake.body);

            if (direction == 'left') {
                game.snake.body[0][2] = game.snake.body[0][2] - 1;
                if (game.snake.body[0][2] < 0) {
                    return game.error();
                }
            } else if (direction == 'up') {
                game.snake.body[0][1] = game.snake.body[0][1] - 1;
                if (game.snake.body[0][1] < 0) {
                    return game.error();
                }
            } else if (direction == 'right') {
                game.snake.body[0][2] = game.snake.body[0][2] + 1;
                if (game.snake.body[0][2] > game.playGroundArray[0].length - 1) {
                    return game.error();
                }
            } else if (direction == 'down') {
                game.snake.body[0][1] = game.snake.body[0][1] + 1;
                if (game.snake.body[0][1] > game.playGroundArray.length - 1) {
                    return game.error();
                }
            }

            game.snake.moves();

            game.timer = setTimeout(function() {
                game.snake.step(direction);
            }, game.snake.snakeSpeed);
        }
    },
    apple: {
        array: [], //array will consist of [class, row number, column number] / [class, y, x]
        //we need to place apple on board with random coords - but not to place on a snake
        place: function() {
            game.apple.array[0] = 'apple'; //constant

            var appleIsOnSnake;

            do {
                appleIsOnSnake = false;
                game.apple.array[1] = game.helpers.getRandomInt(0, game.playGroundArray.length); //Y
                game.apple.array[2] = game.helpers.getRandomInt(0, game.playGroundArray[0].length); //X

                for (var i = 0; i < game.snake.body.length; i++) {
                    if (game.apple.array[1] == game.snake.body[i][1] && game.apple.array[2] == game.snake.body[i][2]) {
                        appleIsOnSnake = true;
                        break;
                    }
                }
            } while (appleIsOnSnake == true);

            game.playGroundArray[ game.apple.array[1] ][ game.apple.array[2] ].classList.toggle('apple');
        },
        remove: function() {
            var appleCell = document.querySelectorAll('.apple');
            appleCell[0].classList.remove('apple');
        }
    },
    restart: function() {
        //erasing values from previous game and starting game again
        clearTimeout(game.timer);
        game.previousKeyCode = 40;
        game.cache.scoreValue.innerHTML = 0;
        if (game.cache.error[0] != undefined) {
            game.cache.error[0].classList.toggle('error');
            game.cache.body.removeChild(game.cache.lose_message[0]);
        }
        for (var i = 0; i < game.cache.playGround.rows.length; i++) {
            for (var j = 0; j < game.cache.playGround.rows[0].cells.length; j++) {
                game.playGroundArray[i][j].className = "cell";
            }
        }
        game.snake.body = [];
        for (var i = 0; i < game.snake.startLength; i++) {
            game.snake.body[i] = ['snake_body', game.startCellCoordY - i, game.startCellCoordX];
        }
        game.breakSnake = false;

        game.snake.creating();
        game.snake.placing();
        game.snakeSpeed = game.snake.startSpeed;
        game.apple.place();
    }
};

game.start();
