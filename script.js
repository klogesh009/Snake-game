// Snake game logic written in plain JavaScript.
// This file handles drawing the snake, moving it, spawning food,
// handling input (keyboard, on‑screen buttons, and touch swipes),
// and managing game over and restart logic.

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  // Number of tiles on each axis. The board will be tileCount × tileCount.
  const tileCount = 20;
  // Size of each tile in pixels. Calculated on resize.
  let tileSize;
  // The snake is represented as an array of segments, each with an x and y coordinate.
  let snake;
  // The direction of movement, represented as a velocity vector.
  let velocity;
  // The food's position on the board.
  let food;
  // The player's current score.
  let score;
  // Interval ID for the game loop.
  let gameInterval;

  /**
   * Resize the canvas to fit within the viewport while maintaining a square shape.
   * This function also recalculates the tile size based on the new dimensions.
   */
  function resizeCanvas() {
    // Add some margin so the canvas isn't flush against the screen edges.
    const margin = 40;
    // Use the smaller of the viewport width and 80% of height for the canvas size.
    const availableSize = Math.min(window.innerWidth, window.innerHeight * 0.8) - margin;
    // Guarantee a minimum canvas size for better playability.
    const boardSize = Math.max(300, Math.floor(availableSize));
    // Compute tile size so we fit exactly tileCount tiles.
    tileSize = Math.floor(boardSize / tileCount);
    // Set canvas width and height accordingly (ensure square dimensions).
    canvas.width = tileSize * tileCount;
    canvas.height = tileSize * tileCount;
  }

  /**
   * Randomly place the food on the board, ensuring it does not coincide with the snake.
   */
  function placeFood() {
    let newPosition;
    do {
      newPosition = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (snake.some((seg) => seg.x === newPosition.x && seg.y === newPosition.y));
    food = newPosition;
  }

  /**
   * Update the score display on the page.
   */
  function updateScoreDisplay() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.textContent = String(score);
    }
  }

  /**
   * Draw the snake, food, and background on the canvas.
   */
  function draw() {
    // Fill background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
    // Draw snake segments
    ctx.fillStyle = '#2ecc71';
    snake.forEach((seg, index) => {
      // Make the head a slightly brighter color
      if (index === 0) {
        ctx.fillStyle = '#27ae60';
      } else {
        ctx.fillStyle = '#2ecc71';
      }
      ctx.fillRect(seg.x * tileSize, seg.y * tileSize, tileSize, tileSize);
    });
  }

  /**
   * Core game loop. This function updates the snake's position,
   * checks for collisions, handles food consumption, and triggers drawing.
   */
  function update() {
    // Compute new head position based on current velocity.
    const newHead = {
      x: snake[0].x + velocity.x,
      y: snake[0].y + velocity.y,
    };
    // Check for collisions with walls
    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= tileCount ||
      newHead.y >= tileCount
    ) {
      endGame();
      return;
    }
    // Check for collisions with self
    if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      endGame();
      return;
    }
    // Add new head to the beginning of the snake array
    snake.unshift(newHead);
    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      score += 1;
      updateScoreDisplay();
      placeFood();
    } else {
      // Remove tail segment if no food consumed
      snake.pop();
    }
    // Draw the updated game state
    draw();
  }

  /**
   * Change the direction of the snake's movement.
   * Prevents reversing direction directly to avoid instant game over.
   * @param {number} dx Horizontal velocity change
   * @param {number} dy Vertical velocity change
   */
  function setDirection(dx, dy) {
    // Prevent the snake from reversing on itself
    if (velocity.x === -dx && velocity.y === -dy) return;
    velocity.x = dx;
    velocity.y = dy;
  }

  /**
   * Start or restart the game by resetting all state variables and kicking off the loop.
   */
  function startGame() {
    // Initialize snake in the center moving to the right
    const startX = Math.floor(tileCount / 2);
    const startY = Math.floor(tileCount / 2);
    snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    velocity = { x: 1, y: 0 };
    score = 0;
    updateScoreDisplay();
    placeFood();
    // Clear any existing game loop
    if (gameInterval) clearInterval(gameInterval);
    // Hide game over overlay
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.classList.add('hidden');
    // Draw initial state
    draw();
    // Start game loop at 120ms per step (~8.3 frames per second)
    gameInterval = setInterval(update, 120);
  }

  /**
   * Show the game over overlay and stop the game loop.
   */
  function endGame() {
    if (gameInterval) clearInterval(gameInterval);
    // Show overlay with final score
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.textContent = String(score);
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.classList.remove('hidden');
  }

  /**
   * Register event listeners for keyboard, on-screen buttons and touch gestures.
   */
  function registerControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setDirection(0, -1);
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setDirection(0, 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setDirection(-1, 0);
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setDirection(1, 0);
          e.preventDefault();
          break;
      }
    });
    // On‑screen button controls (both touch and mouse)
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const addPressListener = (el, handler) => {
      if (!el) return;
      // For touch screens
      el.addEventListener('touchstart', (e) => {
        handler();
        // Prevent default to avoid ghost clicks
        e.preventDefault();
      });
      // For mouse or other pointer devices
      el.addEventListener('mousedown', (e) => {
        handler();
        e.preventDefault();
      });
    };
    addPressListener(upBtn, () => setDirection(0, -1));
    addPressListener(downBtn, () => setDirection(0, 1));
    addPressListener(leftBtn, () => setDirection(-1, 0));
    addPressListener(rightBtn, () => setDirection(1, 0));
    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
      });
    }
    // Touch swipe controls on the canvas
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Determine if the swipe is more horizontal or vertical
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (Math.abs(dx) > 30) {
            if (dx > 0) {
              setDirection(1, 0);
            } else {
              setDirection(-1, 0);
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(dy) > 30) {
            if (dy > 0) {
              setDirection(0, 1);
            } else {
              setDirection(0, -1);
            }
          }
        }
      }
    }, { passive: true });
  }

  /**
   * Initialize the game by setting up event listeners and starting the first game.
   */
  function init() {
    resizeCanvas();
    registerControls();
    startGame();
    // Recalculate canvas size when the window is resized or orientation changes.
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Redraw after resizing to avoid visual glitches
      draw();
    });
    window.addEventListener('orientationchange', () => {
      // Delay resizing slightly to wait for orientation adjustments
      setTimeout(() => {
        resizeCanvas();
        draw();
      }, 200);
    });
  }

  // Run init when the DOM is fully loaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();