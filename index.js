const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const jumpSound = new Audio("img/salto.mp3");
const scoreSound = new Audio("img/efectoTodou.mp3");

const initialGameSpeed = 5;
const gravity = 0.5;
const highScoreKey = "dinoHighScore";

let gameSpeed = initialGameSpeed;
let gameOver = false;
let score = 0;
let highScore = Number(localStorage.getItem(highScoreKey)) || 0;

const dino = {
    x: 50,
    y: canvas.height - 57,
    width: 54,
    height: 57,
    vy: 0,
    isJumping: false
};

const obstacle = {
    x: canvas.width,
    y: canvas.height - 40,
    width: 25,
    height: 40
};

const dinoImg = new Image();
dinoImg.src = "img/dino.png";

const dinoJumpImg = new Image();
dinoJumpImg.src = "img/dinoRojo.png";

const cactusImg = new Image();
cactusImg.src = "img/cactus.png";

const restartBtn = document.getElementById("restartBtn");
const manualRestartBtn = document.getElementById("manualRestartBtn");

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }
}

function update() {
    score++;

    if (score > highScore) {
        highScore = score;
    }

    if (score % 100 === 0) {
        gameSpeed += 1.5;
        scoreSound.currentTime = 0;
        scoreSound.play();
    }

    if (dino.isJumping) {
        dino.vy += gravity;
        dino.y += dino.vy;

        if (dino.y >= canvas.height - dino.height) {
            dino.y = canvas.height - dino.height;
            dino.isJumping = false;
            dino.vy = 0;
        }
    }

    obstacle.x -= gameSpeed;

    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width + Math.random() * 200;
    }

    if (collision(dino, obstacle)) {
        gameOver = true;
        saveHighScore();
        restartBtn.hidden = false;
    }
}

function saveHighScore() {
    localStorage.setItem(highScoreKey, String(highScore));
}

function collision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Puntaje: " + score, 10, 25);
    ctx.textAlign = "right";
    ctx.fillText("Récord: " + highScore, canvas.width - 10, 25);
    ctx.textAlign = "left";

    const currentDinoImg = dino.isJumping ? dinoJumpImg : dinoImg;
    if (currentDinoImg.complete && currentDinoImg.naturalWidth > 0) {
        ctx.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);
    } else {
        ctx.fillStyle = dino.isJumping ? "red" : "green";
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }

    if (cactusImg.complete && cactusImg.naturalWidth > 0) {
        ctx.drawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
        ctx.fillStyle = "brown";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function jump() {
    if (!dino.isJumping && !gameOver) {
        dino.isJumping = true;
        dino.vy = -10;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
}

function restartGame() {
    const shouldStartLoop = gameOver;
    saveHighScore();
    gameOver = false;
    score = 0;
    gameSpeed = initialGameSpeed;
    dino.y = canvas.height - dino.height;
    dino.isJumping = false;
    dino.vy = 0;
    obstacle.x = canvas.width;
    restartBtn.hidden = true;
    draw();

    if (shouldStartLoop) {
        gameLoop();
    }
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }
});

restartBtn.addEventListener("click", restartGame);
manualRestartBtn.addEventListener("click", restartGame);

window.addEventListener("pagehide", saveHighScore);
window.addEventListener("load", gameLoop);
