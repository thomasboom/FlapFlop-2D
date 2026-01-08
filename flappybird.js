
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;
let jumpStrength = 6;

function getJumpStrength() {
    let scale = Math.min(boardWidth / 360, boardHeight / 640);
    return jumpStrength * scale;
}

let gameOver = false;
let score = 0;
let bgScroll = 0;

function resizeCanvas() {
    board.width = window.innerWidth;
    board.height = window.innerHeight;
    boardWidth = board.width;
    boardHeight = board.height;
    
    let scale = Math.min(boardWidth / 360, boardHeight / 640);
    
    birdWidth = 34 * scale;
    birdHeight = 24 * scale;
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;
    bird.x = birdX;
    bird.y = birdY;
    pipeWidth = 64 * scale;
    pipeHeight = 512 * scale;
    pipeX = boardWidth;
    pipeY = 0;
    
    velocityX = -2 * scale;
}

window.onload = function() {
    board = document.getElementById("board");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", handleTouch);
    document.addEventListener("mousedown", handleTouch);
    document.getElementById("restart-btn").addEventListener("click", restartGame);
    document.getElementById("restart-btn").addEventListener("touchstart", restartGame);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    bgScroll += velocityX;
    board.style.backgroundPosition = `${bgScroll}px bottom`;
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    document.getElementById("score-value").innerText = Math.floor(score);

    if (gameOver) {
        document.getElementById("game-over").classList.remove("hidden");
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -getJumpStrength();

        //reset game
        if (gameOver && (e.code == "Enter")) {
            restartGame();
        }
    }

    //restart game on Enter
    if (e.code == "Enter" && gameOver) {
        restartGame();
    }
}

function handleTouch(e) {
    if (e.type === "touchstart") {
        e.preventDefault();
    }
    if (gameOver) {
        return;
    }
    velocityY = -getJumpStrength();
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    bgScroll = 0;
    board.style.backgroundPosition = `0px bottom`;
    gameOver = false;
    velocityY = 0;
    document.getElementById("game-over").classList.add("hidden");
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}