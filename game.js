var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var game, snake, food;

game = {
  score: 0,
  fps: 5,
  over: true,
  message: 'Press Space to Start',

  start: function () {
    game.over = false;
    game.message = null;
    game.score = 0;
    game.fps = 8;
    snake.init();
    food.set();
  },

  stop: function () {
    game.over = true;
    game.message = 'GAME OVER';
  },

  drawScore: function () {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = 'Errors: ' + game.score;
    }
  },

  drawMessage: function () {
    if (game.message !== null) {
      context.fillStyle = '#00F';
      context.strokeStyle = '#FFF';
      context.font = (canvas.height / 12) + 'px Impact';
      context.textAlign = 'center';
      context.fillText(game.message, canvas.width / 2, canvas.height / 2);
      context.strokeText(game.message, canvas.width / 2, canvas.height / 2);
    }
  },

  resetCanvas: function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
};

snake = {
  size: canvas.width / 40,
  direction: 'left',
  sections: [],
  headImage: new Image(),
  bodyImage: new Image(),
  tailImage: new Image(),

  init: function () {
    snake.sections = [];
    snake.direction = 'left';

    const startX = canvas.width / 2 + snake.size / 2;
    const startY = canvas.height / 2 + snake.size / 2;

    snake.sections.push({ x: startX - 2 * snake.size, y: startY, type: 'tail' });
    snake.sections.push({ x: startX - snake.size, y: startY, type: 'body' });
    snake.sections.push({ x: startX, y: startY, type: 'head' });

    snake.headImage.src = 'head.png';
    snake.bodyImage.src = 'body.png';
    snake.tailImage.src = 'tail.png';
  },

  move: function () {
    if (!game.over) {
      const head = snake.sections[0];
      let newX = head.x;
      let newY = head.y;

      switch (snake.direction) {
        case 'up': newY -= snake.size; break;
        case 'down': newY += snake.size; break;
        case 'left': newX -= snake.size; break;
        case 'right': newX += snake.size; break;
      }

      if (snake.isCollision(newX, newY)) {
        game.stop();
        return;
      }

      snake.sections.unshift({ x: newX, y: newY, type: 'head' });

      if (snake.sections.length > 1) {
        snake.sections[1].type = 'body';
      }

      if (newX === food.x && newY === food.y) {
        game.score++;
        if (game.score % 5 === 0 && game.fps < 60) game.fps++;
        food.set();
      } else {
        snake.sections.pop();
      }

      if (snake.sections.length > 1) {
        snake.sections[snake.sections.length - 1].type = 'tail';
      }
    }
  },

  draw: function () {
    for (let i = 0; i < snake.sections.length; i++) {
      const part = snake.sections[i];
      let img;
      let flipX = false;
      let flipY = false;
      let rotation = 0; // Default rotation is 0 degrees
  
      switch (part.type) {
        case 'head':
          img = snake.headImage;
          switch (snake.direction) {
            case 'right': 
              flipX = true;  // Flip the head horizontally to go right
              flipY = false; 
              rotation = 0;  // No rotation for right
              break;
  
            case 'left':  
              flipX = false;  // No horizontal flip for left
              flipY = false; 
              rotation = 0;  // No rotation for left
              break;
  
            case 'up':    
              flipX = false;  // No horizontal flip for up
              flipY = false; 
              rotation = 90; // Rotate 90 degrees counterclockwise for up
              break;
  
            case 'down':  
              flipX = false;  // No horizontal flip for down
              flipY = false; 
              rotation = -90;  // Rotate 90 degrees clockwise for down
              break;
          }
          snake.drawRotatedImage(img, part.x, part.y, flipX, flipY, rotation);
          break;
  
        case 'body':
          img = snake.bodyImage;

          // Handle rotation and flip based on previous segment direction
          const prev = snake.sections[i - 1];
          const dx = part.x - prev.x;
          const dy = part.y - prev.y;
  
          if (dx > 0) { flipX = true; flipY = false; rotation = 0; } // right
          else if (dx < 0) { flipX = false; flipY = false; rotation = 0; } // left
          else if (dy < 0) { flipX = false; flipY = false; rotation = -90; } // up
          else if (dy > 0) { flipX = false; flipY = false; rotation = 90; }  // down
  
          snake.drawRotatedImage(img, part.x, part.y, flipX, flipY, rotation);
          break;
  
        case 'tail':
          img = snake.tailImage;
  
          if (i > 0) {
            const prev = snake.sections[i - 1];
            const dx = part.x - prev.x;
            const dy = part.y - prev.y;
  
            if (dx > 0) { flipX = false; flipY = false; rotation = 0; } // right
            else if (dx < 0) { flipX = true; flipY = false; rotation = 0; } // left
            else if (dy < 0) { flipX = false; flipY = false; rotation = -90; } // up
            else if (dy > 0) { flipX = false; flipY = false; rotation = 90; }  // down
          }
  
          snake.drawRotatedImage(img, part.x, part.y, flipX, flipY, rotation);
          break;
      }
    }
  },

  drawFlippedImage: function (image, x, y, flipX, flipY) {
    context.save();
    context.translate(x, y);
    context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    context.drawImage(
      image,
      -snake.size / 2 * (flipX ? -1 : 1),
      -snake.size / 2 * (flipY ? -1 : 1),
      snake.size * (flipX ? -1 : 1),
      snake.size * (flipY ? -1 : 1)
    );
    context.restore();
  },
  
  drawRotatedImage: function (image, x, y, flipX, flipY, rotation) {
    context.save();
    context.translate(x, y);
  
    // Apply flip if necessary
    context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  
    // Apply rotation
    context.rotate(rotation * Math.PI / 180);
  
    // Draw the image
    context.drawImage(
      image,
      -snake.size / 2,
      -snake.size / 2,
      snake.size,
      snake.size
    );
    context.restore();
  },

  drawSection: function (x, y, image) {
    context.drawImage(image, x - snake.size / 2, y - snake.size / 2, snake.size, snake.size);
  },

  isCollision: function (x, y) {
    if (
      x < snake.size / 2 || x >= canvas.width ||
      y < snake.size / 2 || y >= canvas.height
    ) return true;

    return snake.sections.some((s, i) => i !== 0 && s.x === x && s.y === y);
  }
};

food = {
  size: null,
  x: null,
  y: null,
  image: new Image(),

  set: function () {
    food.size = snake.size;
    food.x = (Math.ceil(Math.random() * 10) * snake.size * 4) - snake.size / 2;
    food.y = (Math.ceil(Math.random() * 10) * snake.size * 3) - snake.size / 2;
    food.image.src = 'error.png';
  },

  draw: function () {
    while (snake.sections.some(s => s.x === food.x && s.y === food.y)) {
      food.set();
    }
    context.drawImage(food.image, food.x - food.size / 2, food.y - food.size / 2, food.size, food.size);
  }
};

var inverseDirection = {
  'up': 'down',
  'left': 'right',
  'right': 'left',
  'down': 'up'
};

var keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76],
  start_game: [13, 32]
};

function getKey(value) {
  for (var key in keys) {
    if (keys[key].includes(value)) return key;
  }
  return null;
}

var CanPressButton = true;

addEventListener("keydown", function (e) {
  var lastKey = getKey(e.keyCode);
  if (['up', 'down', 'left', 'right'].includes(lastKey) &&
    lastKey !== inverseDirection[snake.direction] && CanPressButton) {
    snake.direction = lastKey;
    CanPressButton = false;
  } else if (lastKey === 'start_game' && game.over) {
    game.start();
  }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame;

function loop() {
  game.resetCanvas();

  if (!game.over) {
    snake.move();
    food.draw();
    snake.draw();
  }

  game.drawScore();
  game.drawMessage();

  setTimeout(function () {
    requestAnimationFrame(loop);
    CanPressButton = true;
  }, 1000 / game.fps);
}

requestAnimationFrame(loop);
