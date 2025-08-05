// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

let gravity = 0.6;
let gameSpeed = 6;

let coins = 0;
let skillReady = true;
let skillCooldown = 5000; // 5 segundos

// Player setup
const player = {
  x: 50,
  y: 0,
  width: 50,
  height: 50,
  color: '#0f0',
  dy: 0,
  onGround: false,
  skillActive: false,
};

// Ground
const groundHeight = 100;

// Obstacles
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 1500;

// Moedas
let coinsArr = [];
let coinTimer = 0;
let coinInterval = 1200;

// Sons
const soundJump = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
const soundCoin = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
const soundSkill = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

function resetGame() {
  coins = 0;
  skillReady = true;
  skillCooldown = 5000;
  obstacles = [];
  coinsArr = [];
  player.y = 0;
  player.dy = 0;
  player.onGround = false;
  player.skillActive = false;
  document.getElementById('coinCount').textContent = coins;
  document.getElementById('skillStatus').textContent = 'Pronto';
}

// Desenha o jogador
function drawPlayer() {
  ctx.fillStyle = player.skillActive ? '#ff0' : player.color; // Amarelo quando a skill ativa
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Desenha o chão
function drawGround() {
  ctx.fillStyle = '#080';
  ctx.fillRect(0, height - groundHeight, width, groundHeight);
}

// Cria obstáculo
function createObstacle() {
  const size = Math.random() * 20 + 30;
  obstacles.push({
    x: width,
    y: height - groundHeight - size,
    width: size,
    height: size,
    color: '#a00',
  });
}

// Desenha obstáculos
function drawObstacles() {
  obstacles.forEach((ob, i) => {
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    ob.x -= gameSpeed;

    // Remove fora da tela
    if (ob.x + ob.width < 0) {
      obstacles.splice(i, 1);
    }
  });
}

// Cria moeda
function createCoin() {
  const size = 20;
  const y = height - groundHeight - size - Math.random() * 80;
  coinsArr.push({
    x: width,
    y: y,
    width: size,
    height: size,
    color: '#ff0',
  });
}

// Desenha moedas
function drawCoins() {
  coinsArr.forEach((c, i) => {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
    ctx.fill();
    c.x -= gameSpeed;

    // Colisão com player
    if (
      player.x < c.x + c.width &&
      player.x + player.width > c.x &&
      player.y < c.y + c.height &&
      player.y + player.height > c.y
    ) {
      coins++;
      document.getElementById('coinCount').textContent = coins;
      soundCoin.play();
      coinsArr.splice(i, 1);
    }

    // Remove fora da tela
    if (c.x + c.width < 0) {
      coinsArr.splice(i, 1);
    }
  });
}

// Atualiza player (física)
function updatePlayer() {
  player.dy += gravity;
  player.y += player.dy;

  // Chão
  if (player.y + player.height >= height - groundHeight) {
    player.y = height - groundHeight - player.height;
    player.dy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }
}

// Função pular
function jump() {
  if (player.onGround) {
    player.dy = -15;
    player.onGround = false;
    soundJump.play();
  }
}

// Ativa habilidade (rastro veloz)
function activateSkill() {
  if (skillReady) {
    skillReady = false;
    player.skillActive = true;
    gameSpeed = 12; // dobra a velocidade
    document.getElementById('skillStatus').textContent = 'Ativada!';
    soundSkill.play();

    setTimeout(() => {
      player.skillActive = false;
      gameSpeed = 6;
      document.getElementById('skillStatus').textContent = 'Recuperando...';
    }, 3000);

    setTimeout(() => {
      skillReady = true;
      document.getElementById('skillStatus').textContent = 'Pronto';
    }, skillCooldown);
  }
}

// Detecta colisão com obstáculos
function checkCollision() {
  for (let ob of obstacles) {
    if (
      player.x < ob.x + ob.width &&
      player.x + player.width > ob.x &&
      player.y < ob.y + ob.height &&
      player.y + player.height > ob.y
    ) {
      return true;
    }
  }
  return false;
}

// Efeito de rastro veloz
function drawSpeedTrail() {
  if (player.skillActive) {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(255,255,0,${0.1 * (5 - i)})`;
      ctx.fillRect(player.x - i * 10, player.y, player.width, player.height);
    }
  }
}

// Loop principal
function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  drawGround();

  drawSpeedTrail();

  drawPlayer();

  drawObstacles();

  drawCoins();

  updatePlayer();

  // Gera obstáculos
  obstacleTimer += 16.67;
  if (obstacleTimer > obstacleInterval) {
    createObstacle();
    obstacleTimer = 0;
  }

  // Gera moedas
  coinTimer += 16.67;
  if (coinTimer > coinInterval) {
    createCoin();
    coinTimer = 0;
  }

  // Checa colisão
  if (checkCollision()) {
    alert('Você bateu! Reiniciando o jogo...');
    resetGame();
  }

  requestAnimationFrame(gameLoop);
}

// Controles do joystick (botão pular)
document.getElementById('btnJump').addEventListener('click', () => jump());

// Ativar habilidade com tecla S
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 's') {
    activateSkill();
  }
});

// Inicia o jogo
resetGame();
gameLoop();
