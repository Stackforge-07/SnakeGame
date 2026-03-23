const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = 20;

// Awesome meme audio choices!
const eatSound = new Audio('eat.mp3'); // Rename your eat sound too just to be safe!
const gameOverSound = new Audio("gameover.mp3");

const btn = document.getElementById("Start");

let snake = [{x: 10, y: 10}];
let direction = 'RIGHT';
let food = {x: 15, y: 10};
let score = 0;
let gamespeed = 200;
let loopTimeout; // Variable to track our game loop so we don't double-start it

let highScore = localStorage.getItem('snakeHighScore') || 0;

function draw() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00FF00';
  snake.forEach(segment => {
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });

  ctx.fillStyle = '#FF0000';
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize - 2,
    gridSize - 2
  );

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 10, 25);
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 120, 25);
}

function move() {
  let head = { x: snake[0].x, y: snake[0].y };

  if (direction === 'UP') head.y--;
  if (direction === 'DOWN') head.y++;
  if (direction === 'LEFT') head.x--;
  if (direction === 'RIGHT') head.x++;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    
    // Play eating sound properly
    eatSound.currentTime = 0;
    eatSound.play().catch(() => { });
    
    placeFood();
  } else {
    snake.pop(); 
  }
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
  const key = event.key;

  if (key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }

  return false;
}

function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

btn.addEventListener("click", () => {
  // Prevent the game from running twice if they spam the start button
  clearTimeout(loopTimeout); 
  
  snake = [{x: 10, y: 10}];
  direction = 'RIGHT';
  score = 0;
  placeFood();
  gameLoop();
});

function gameLoop() {
  move();

  if (checkCollision()) {
    // 1. Play the game over meme sound!
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch((e) => { console.log("Audio Error:", e) });

    // 2. Draw the board one last time so the snake doesn't vanish
    draw();

    // 3. Draw a cool dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 4. Draw the Game Over text directly on the canvas
    ctx.textAlign = 'center'; 

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      
      ctx.font = '24px Arial';
      ctx.fillStyle = 'yellow';
      ctx.fillText(`🏆 NEW HIGH SCORE: ${highScore} 🏆`, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }

    // Reset alignment for the next game
    ctx.textAlign = 'left';

    // Stop the game loop completely so the audio can play out
    return; 
  }

  draw();

  // Save the timeout ID so we can cancel it if the user clicks Start again
  loopTimeout = setTimeout(gameLoop, gamespeed);
}
