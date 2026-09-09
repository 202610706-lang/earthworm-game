const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM 요소
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const finalScoreContainer = document.getElementById('finalScoreContainer');
const finalScoreEl = document.getElementById('finalScore');

const topStartBtn = document.getElementById('topStartBtn');
const topPauseBtn = document.getElementById('topPauseBtn');
const centerStartBtn = document.getElementById('centerStartBtn');

// 그리드 설정
const gridSize = 40; 
let cols, rows;

let snake = [];
let food = null;
let dx = gridSize;
let dy = 0;
let currentSessionScore = 0; 
let highScore = localStorage.getItem('snake_grass_high') || 0;

let gameInterval = null;
let gameSpeed = 140;
let isRunning = false;
let isPaused = false;
let changingDirection = false;

highScoreEl.textContent = highScore;

// 이벤트 리스너
window.addEventListener('resize', handleResize);
document.addEventListener('keydown', handleKeyDown);

topStartBtn.addEventListener('click', startGame);
centerStartBtn.addEventListener('click', startGame);
topPauseBtn.addEventListener('click', togglePause);

function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / gridSize);
  rows = Math.floor(canvas.height / gridSize);

  if (!isRunning) {
    initPreviewState();
    render();
  }
}

// 초기 미리보기
function initPreviewState() {
  const midX = Math.floor(cols / 2) * gridSize;
  const midY = Math.floor(rows / 2) * gridSize;
  
  snake = [
    { x: midX, y: midY },
    { x: midX - gridSize, y: midY },
    { x: midX - (gridSize * 2), y: midY },
    { x: midX - (gridSize * 3), y: midY }
  ];
  food = { x: midX + (gridSize * 3), y: midY };
}

// 새 판 시작
function startGame() {
  const midX = Math.floor(cols / 2) * gridSize;
  const midY = Math.floor(rows / 2) * gridSize;

  snake = [
    { x: midX, y: midY },
    { x: midX - gridSize, y: midY },
    { x: midX - (gridSize * 2), y: midY }
  ];
  
  dx = gridSize;
  dy = 0;
  currentSessionScore = 0; 
  gameSpeed = 140;
  currentScoreEl.textContent = currentSessionScore;
  
  isRunning = true;
  isPaused = false;
  
  topPauseBtn.disabled = false;
  topPauseBtn.textContent = "⏸️ 일시정지";
  topStartBtn.textContent = "🔄 다시 시작";

  generateFood(); // 사과 생성
  overlay.classList.add('hidden');
  finalScoreContainer.classList.add('hidden');

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
  if (isPaused) return;

  const status = checkGameStatus();
  if (status.isOver) {
    handleGameOver(status.reason);
    return;
  }

  changingDirection = false;
  moveSnake();
  render();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawOrganicSnake();
}

// 부드러운 곡선 지렁이 (잔디 배경에 잘 보이는 분홍/주황빛 지렁이)
function drawOrganicSnake() {
  if (snake.length === 0) return;

  // 몸통 곡선
  if (snake.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = gridSize - 6;
    ctx.strokeStyle = '#ff9e80'; // 흙/지렁이 색감의 코랄 핑크
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(snake[0].x + gridSize / 2, snake[0].y + gridSize / 2);

    for (let i = 0; i < snake.length - 1; i++) {
      const p1 = snake[i];
      const p2 = snake[i + 1];
      const midX = (p1.x + p2.x) / 2 + gridSize / 2;
      const midY = (p1.y + p2.y) / 2 + gridSize / 2;

      ctx.quadraticCurveTo(p1.x + gridSize / 2, p1.y + gridSize / 2, midX, midY);
    }

    const tail = snake[snake.length - 1];
    ctx.lineTo(tail.x + gridSize / 2, tail.y + gridSize / 2);
    ctx.stroke();
  }

  // 머리
  const head = snake[0];
  ctx.fillStyle = '#ff8a65';
  ctx.beginPath();
  ctx.arc(head.x + gridSize / 2, head.y + gridSize / 2, (gridSize - 4) / 2, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(head);
}

function drawEyes(head) {
  ctx.fillStyle = '#111';
  const radius = 3.5;
  const offset = 10;
  const centerX = head.x + gridSize / 2;
  const centerY = head.y + gridSize / 2;

  let eye1 = { x: centerX, y: centerY };
  let eye2 = { x: centerX, y: centerY };

  if (dx > 0) { 
    eye1 = { x: head.x + gridSize - offset, y: head.y + offset };
    eye2 = { x: head.x + gridSize - offset, y: head.y + gridSize - offset };
  } else if (dx < 0) { 
    eye1 = { x: head.x + offset, y: head.y + offset };
    eye2 = { x: head.x + offset, y: head.y + gridSize - offset };
  } else if (dy < 0) { 
    eye1 = { x: head.x + offset, y: head.y + offset };
    eye2 = { x: head.x + gridSize - offset, y: head.y + offset };
  } else if (dy > 0) { 
    eye1 = { x: head.x + offset, y: head.y + gridSize - offset };
    eye2 = { x: head.x + gridSize - offset, y: head.y + gridSize - offset };
  }

  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, radius, 0, Math.PI * 2);
  ctx.arc(eye2.x, eye2.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawFood() {
  if (!food) return;
  ctx.font = `${gridSize - 4}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🍎", food.x + gridSize / 2, food.y + gridSize / 2);
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // 사과 먹기
  if (food && head.x === food.x && head.y === food.y) {
    currentSessionScore += 10;
    currentScoreEl.textContent = currentSessionScore;
    generateFood(); // 맵이 꽉 찰 때까지 사과 무조건 재생성
    increaseSpeed();
  } else {
    snake.pop();
  }
}

// 사과 무한 생성 보장 로직 (100% 빈자리 계산)
function generateFood() {
  const occupied = new Set();
  for (let part of snake) {
    occupied.add(`${part.x},${part.y}`);
  }

  const emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * gridSize;
      const y = r * gridSize;
      if (!occupied.has(`${x},${y}`)) {
        emptyCells.push({ x, y });
      }
    }
  }

  // 맵이 완전히 꽉 차지 않은 이상 사과는 100% 끊김 없이 나옴
  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    food = emptyCells[randomIndex];
  } else {
    food = null; // 맵 전체 채웠을 때만 null
  }
}

// 게임 종료 판정
function checkGameStatus() {
  const head = snake[0];
  const totalCells = cols * rows;

  // 1. 경기장이 지렁이로 꽉 차서 더 이상 갈 수 없을 때 (승리 종료)
  if (snake.length >= totalCells) {
    return { isOver: true, reason: 'FULL' };
  }

  // 2. 벽 충돌
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return { isOver: true, reason: 'CRASH' };
  }

  // 3. 자기 몸통 충돌
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return { isOver: true, reason: 'CRASH' };
    }
  }

  return { isOver: false };
}

function handleKeyDown(e) {
  const key = e.keyCode;
  const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;

  if (key === SPACE) {
    togglePause();
    return;
  }

  if (changingDirection || isPaused || !isRunning) return;

  const goingUp = dy === -gridSize;
  const goingDown = dy === gridSize;
  const goingRight = dx === gridSize;
  const goingLeft = dx === -gridSize;

  if (key === LEFT && !goingRight) { dx = -gridSize; dy = 0; changingDirection = true; }
  if (key === UP && !goingDown) { dx = 0; dy = -gridSize; changingDirection = true; }
  if (key === RIGHT && !goingLeft) { dx = gridSize; dy = 0; changingDirection = true; }
  if (key === DOWN && !goingUp) { dx = 0; dy = gridSize; changingDirection = true; }
}

function togglePause() {
  if (!isRunning) return;

  isPaused = !isPaused;

  if (isPaused) {
    topPauseBtn.textContent = "▶️ 재개";
    overlayTitle.textContent = "일시 정지";
    overlayMessage.textContent = "우측 상단 [재개] 버튼이나 Spacebar를 누르세요.";
    finalScoreContainer.classList.add('hidden');
    centerStartBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
  } else {
    topPauseBtn.textContent = "⏸️ 일시정지";
    overlay.classList.add('hidden');
    centerStartBtn.classList.remove('hidden');
  }
}

function increaseSpeed() {
  if (gameSpeed > 50) {
    gameSpeed -= 2;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

function handleGameOver(reason) {
  clearInterval(gameInterval);
  isRunning = false;
  topPauseBtn.disabled = true;

  if (currentSessionScore > highScore) {
    highScore = currentSessionScore;
    localStorage.setItem('snake_grass_high', highScore);
    highScoreEl.textContent = highScore;
  }

  if (reason === 'FULL') {
    overlayTitle.textContent = "👑 잔디밭 제패! 👑";
    overlayMessage.textContent = "지렁이가 경기장을 완벽하게 다 채웠습니다!";
  } else {
    overlayTitle.textContent = "게임 종료";
    overlayMessage.textContent = "아쉽네요! 부딪혀서 지렁이가 멈췄습니다.";
  }

  // 이번 게임 점수 표시
  finalScoreEl.textContent = currentSessionScore;
  finalScoreContainer.classList.remove('hidden');

  centerStartBtn.textContent = "다시 도전하기";
  centerStartBtn.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

handleResize();
