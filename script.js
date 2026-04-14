const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');
const restartBtn = document.getElementById('restartBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

const state = {
  playerScore: 0,
  cpuScore: 0,
  winningScore: 7,
  gameOver: false,
  keys: new Set(),
  touch: {
    up: false,
    down: false,
  },
  player: {
    x: 24,
    y: canvas.height / 2 - 55,
    width: 14,
    height: 110,
    speed: 8,
  },
  cpu: {
    x: canvas.width - 38,
    y: canvas.height / 2 - 55,
    width: 14,
    height: 110,
    speed: 6.2,
  },
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 14,
    speed: 6,
    vx: 6,
    vy: 4,
  },
};

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  state.ball.x = canvas.width / 2;
  state.ball.y = canvas.height / 2;
  state.ball.speed = 6;
  state.ball.vx = state.ball.speed * direction;
  state.ball.vy = (Math.random() * 4 - 2) || 2;
}

function resetGame() {
  state.playerScore = 0;
  state.cpuScore = 0;
  state.gameOver = false;
  state.player.y = canvas.height / 2 - state.player.height / 2;
  state.cpu.y = canvas.height / 2 - state.cpu.height / 2;
  playerScoreEl.textContent = '0';
  cpuScoreEl.textContent = '0';
  resetBall();
}

function clampPaddles() {
  state.player.y = Math.max(0, Math.min(canvas.height - state.player.height, state.player.y));
  state.cpu.y = Math.max(0, Math.min(canvas.height - state.cpu.height, state.cpu.y));
}

function updatePlayer() {
  if (state.keys.has('ArrowUp') || state.keys.has('w') || state.keys.has('W') || state.touch.up) {
    state.player.y -= state.player.speed;
  }
  if (state.keys.has('ArrowDown') || state.keys.has('s') || state.keys.has('S') || state.touch.down) {
    state.player.y += state.player.speed;
  }
}

function updateCpu() {
  const cpuCenter = state.cpu.y + state.cpu.height / 2;
  const target = state.ball.y;
  if (Math.abs(target - cpuCenter) > 12) {
    state.cpu.y += Math.sign(target - cpuCenter) * state.cpu.speed;
  }
}

function collideWithPaddle(paddle) {
  return (
    state.ball.x < paddle.x + paddle.width &&
    state.ball.x + state.ball.size > paddle.x &&
    state.ball.y < paddle.y + paddle.height &&
    state.ball.y + state.ball.size > paddle.y
  );
}

function handlePaddleCollision(paddle, isPlayer) {
  const relativeIntersect =
    state.ball.y + state.ball.size / 2 - (paddle.y + paddle.height / 2);
  const normalized = relativeIntersect / (paddle.height / 2);
  const bounceAngle = normalized * (Math.PI / 3);
  state.ball.speed += 0.35;
  const direction = isPlayer ? 1 : -1;
  state.ball.vx = Math.cos(bounceAngle) * state.ball.speed * direction;
  state.ball.vy = Math.sin(bounceAngle) * state.ball.speed;
  state.ball.x = isPlayer ? paddle.x + paddle.width + 1 : paddle.x - state.ball.size - 1;
}

function checkScore() {
  if (state.ball.x + state.ball.size < 0) {
    state.cpuScore += 1;
    cpuScoreEl.textContent = String(state.cpuScore);
    if (state.cpuScore >= state.winningScore) state.gameOver = true;
    resetBall(1);
  }

  if (state.ball.x > canvas.width) {
    state.playerScore += 1;
    playerScoreEl.textContent = String(state.playerScore);
    if (state.playerScore >= state.winningScore) state.gameOver = true;
    resetBall(-1);
  }
}

function updateBall() {
  state.ball.x += state.ball.vx;
  state.ball.y += state.ball.vy;

  if (state.ball.y <= 0 || state.ball.y + state.ball.size >= canvas.height) {
    state.ball.vy *= -1;
  }

  if (collideWithPaddle(state.player)) {
    handlePaddleCollision(state.player, true);
  }

  if (collideWithPaddle(state.cpu)) {
    handlePaddleCollision(state.cpu, false);
  }

  checkScore();
}

function drawNet() {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.setLineDash([12, 14]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 16);
  ctx.lineTo(canvas.width / 2, canvas.height - 16);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall() {
  ctx.fillStyle = '#6ee7ff';
  ctx.beginPath();
  ctx.arc(state.ball.x + state.ball.size / 2, state.ball.y + state.ball.size / 2, state.ball.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawWinner() {
  if (!state.gameOver) return;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(state.playerScore > state.cpuScore ? 'You Win!' : 'CPU Wins!', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '24px Arial';
  ctx.fillStyle = '#cfd8ff';
  ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 36);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(state.player.x, state.player.y, state.player.width, state.player.height, '#ffffff');
  drawRect(state.cpu.x, state.cpu.y, state.cpu.width, state.cpu.height, '#ffffff');
  drawBall();
  drawWinner();
}

function gameLoop() {
  if (!state.gameOver) {
    updatePlayer();
    updateCpu();
    updateBall();
    clampPaddles();
  }
  render();
  requestAnimationFrame(gameLoop);
}

function bindTouchControl(button, direction) {
  const start = (event) => {
    event.preventDefault();
    state.touch[direction] = true;
  };
  const end = (event) => {
    event.preventDefault();
    state.touch[direction] = false;
  };

  button.addEventListener('touchstart', start, { passive: false });
  button.addEventListener('touchend', end, { passive: false });
  button.addEventListener('touchcancel', end, { passive: false });
  button.addEventListener('mousedown', start);
  button.addEventListener('mouseup', end);
  button.addEventListener('mouseleave', end);
}

window.addEventListener('keydown', (event) => state.keys.add(event.key));
window.addEventListener('keyup', (event) => state.keys.delete(event.key));
restartBtn.addEventListener('click', resetGame);
bindTouchControl(upBtn, 'up');
bindTouchControl(downBtn, 'down');

resetGame();
gameLoop();
