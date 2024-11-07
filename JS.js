const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio('assets_audio.mp3');
const backgroundAudio = document.getElementById('background-audio');
const DefeatAudio = document.getElementById('Defeat-audio');
const RecordeAtual = document.querySelector('.recorde-value');

DefeatAudio.loop = false;
let audioPlayed = false;

const size = 30;
let speed = 240;
const minSpeed = 40;
const initialPosition = { x: 270, y: 240 };
let snake = [initialPosition];
let isGameStarted = false;
let direction, nextDirection, loopId;

// Funções de recorde com localStorage
const salvarRecorde = (pontuacao) => {
  localStorage.setItem("recorde", pontuacao);
};

const carregarRecorde = () => {
  return localStorage.getItem("recorde") || "0";
};

const atualizarRecorde = () => {
  let recordeAtual = carregarRecorde();
  RecordeAtual.innerText = recordeAtual;
};

// Inicializa o recorde ao carregar a página
atualizarRecorde();

const incrementScore = () => {
  score.innerText = +score.innerText + 10;
  speed = Math.max(minSpeed, speed - 5);
  if (+score.innerText > +RecordeAtual.innerText) {
    RecordeAtual.innerText = score.innerText;
    salvarRecorde(score.innerText);
  }
};

// Função para gerar posição aleatória
const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size);
  return Math.round(number / 30) * 30;
};

// Função para gerar cor aleatória que não seja branca
const randomColor = () => {
  let red, green, blue;
  do {
    red = randomNumber(0, 255);
    green = randomNumber(0, 255);
    blue = randomNumber(0, 255);
  } while (red > 200 && green > 200 && blue > 200); // Evita tons próximos ao branco

  return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor()
};

// Desenha a comida
const drawFood = () => {
  const { x, y, color } = food;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillStyle = food.color;
  ctx.fillRect(food.x, food.y, size, size);
  ctx.shadowBlur = 0;
};

// Desenha a cobra
const drawSnake = () => {
  ctx.fillStyle = randomColor();
  snake.forEach((position, index) => {
    if (index == snake.length - 1) {
      ctx.fillStyle = randomColor();
    }
    ctx.fillRect(position.x, position.y, size, size);
  });
};

// Define a direção da cobra no início de cada ciclo
const setDirection = () => {
  if (nextDirection) {
    direction = nextDirection;
    nextDirection = null;
  }
};

// Move a cobra
const moveSnake = () => {
  setDirection();
  if (!direction) return;

  const head = snake[snake.length - 1];
  if (direction == 'right') snake.push({ x: head.x + size, y: head.y });
  if (direction == 'left') snake.push({ x: head.x - size, y: head.y });
  if (direction == 'down') snake.push({ x: head.x, y: head.y + size });
  if (direction == 'up') snake.push({ x: head.x, y: head.y - size });

  snake.shift();
};

// Desenha o grid
const drawGrid = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#191919';
  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.lineTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(0, i);
    ctx.lineTo(600, i);
    ctx.stroke();
  }
};

// Verifica se a cobra comeu a comida
const checkEat = () => {
  const head = snake[snake.length - 1];
  if (head.x == food.x && head.y == food.y) {
    incrementScore();
    snake.push(head);
    audio.play();

    let x = randomPosition();
    let y = randomPosition();
    while (snake.find((position) => position.x == x && position.y == y)) {
      x = randomPosition();
      y = randomPosition();
    }

    food.x = x;
    food.y = y;
    food.color = randomColor();
  }
};

// Verifica colisão
const checkCollision = () => {
  const head = snake[snake.length - 1];
  const canvasLimit = canvas.width - size;
  const neckIndex = snake.length - 2;

  const wallCollision = head.x < 0 || head.x > 570 || head.y < 0 || head.y > canvasLimit;

  const selfCollision = snake.find((position, index) => {
    return index < neckIndex && position.x == head.x && position.y == head.y;
  });

  if (wallCollision || selfCollision) {
    gameOver();
  }
};

// Fim de jogo
const gameOver = () => {
  direction = undefined;
  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(4px)";
  backgroundAudio.pause();
  if (!audioPlayed) {
    DefeatAudio.play();
    audioPlayed = true;
  }
};

// Loop principal do jogo
const gameLoop = () => {
  clearInterval(loopId);
  ctx.clearRect(0, 0, 600, 600);

  drawGrid();
  drawFood();
  moveSnake();
  drawSnake();
  checkEat();
  checkCollision();

  loopId = setTimeout(() => {
    gameLoop();
  }, speed);
};

// Inicia o jogo
buttonPlay.addEventListener("click", () => {
  score.innerText = "00";
  menu.style.display = "none";
  canvas.style.filter = "none";

  snake = [initialPosition];
  speed = 240;

  audioPlayed = false;
  backgroundAudio.currentTime = 0;
  backgroundAudio.play();
  gameLoop();
});

// Controla a direção e impede direção oposta
document.addEventListener("keydown", ({ key }) => {
  if ((key === 'ArrowRight' && direction !== 'left') ||
      (key === 'ArrowLeft' && direction !== 'right') ||
      (key === 'ArrowDown' && direction !== 'up') ||
      (key === 'ArrowUp' && direction !== 'down')) {
    nextDirection = key.replace('Arrow', '').toLowerCase();
  }

  if (!isGameStarted) {
    backgroundAudio.play();
    isGameStarted = true;
    gameLoop();
  }
});

gameLoop();
