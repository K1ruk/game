let character;
let health = 1000;
let monsters = [];
let rocks = [];
let potions = [];

let gameIsOver = false;
let easing = 0.03;
let numRocks = 7;
let score = 0;
let highScore = 0;
let canvasWidth = 600;
let canvasHeight = 600;

// Grid variables
let gridSize = 50; // Size of each grid cell
let grassImage1; // Variable to hold the first grass image
let smallRockImage; // Variable to hold the small rock image

// Game states
let gameState = "title"; // Initial state is the title screen

function preload() {
  // Load the tile and rock images  
  grassImage1 = loadImage('/bg/grass.png');  
  RockImage = loadImage('rockImg.png'); 
  zombieHand = loadImage('zombieHand.png');
  
  skyImg = loadImage('sky.jpg');
  soundFormats('mp3');
  themeSong = loadSound('/music/menu.mp3');
  zombieGrowl = loadSound('zombieGrowl.mp3');
  zombieEat = loadSound('zombieEat.mp3');
  font = loadFont('/Fonts/title.TTF');
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  // Create random rocks
  for (let i = 0; i < numRocks; i++) {
    rocks.push(createRandomRock());
  }

  character = new Character();

  setInterval(spawnMonster, 5000);
  setInterval(spawnPotion, 10000); // Spawn a health potion every 5 seconds

  // Initialize high score from localStorage
  if (localStorage.getItem("highScore")) {
    highScore = parseInt(localStorage.getItem("highScore"));
  }  
  
  themeSong.setVolume(0.02);
  themeSong.play();
  themeSong.loop();
  
  
}

function draw() {
  textFont(font);

  if (gameState === "title") 
  {
    drawTitleScreen();
  } 
  else if (gameState === "instructions")
  {
    drawInstructionScreen();    
    loop()
  } 
  else if (gameState === "game")
  {
    drawGame();
  } 
  else if (gameState === "gameOver")
  {
    gameOver();
  }
}

function drawTitleScreen() {
  background(skyImg);  
  zombieHand.resize(315, 445);
  image(zombieHand, width/2 - zombieHand.width / 2, height/2 - zombieHand.height/4);
  textAlign(CENTER);
  textSize(50);
  stroke(0);
  fill(255);
  text("The Chase", width / 2, height / 6);
  textSize(20);
  text("Click to Start", width / 2, height / 2 + 50);
}

function drawInstructionScreen() {
  background(skyImg);  
  textAlign(LEFT);
  textSize(30);
  fill(255);
  text("Instructions", width / 10, height / 3);
  textSize(15);
  text("Use the mouse to move \nyour character", width / 10, height / 2);
  text("Avoid monsters and\nCollect health potions", width / 10, height/2 + 50);
  textAlign(CENTER);
  textSize(20);
  text("Click to Start Game", width / 2, height / 2 + 100);
}

function drawGame() {
  themeSong.stop();
  
  drawGrid();

  character.update();
  character.display();

  monsters.forEach((monster) => {
    monster.update();
    monster.display();
    if (character.collidesWith(monster)) {
      health -= 10;
      if (health <= 0) gameState = "gameOver";
    }
  });
  let characterStopped = false;
  rocks.forEach((rock) => {
    rock.display();
    if (character.collidesWith(rock)) {
      characterStopped = true;
    }
  });

  if (characterStopped) {
    character.stop();
  } else {
    character.resume();
    score++;
  }

  for (let i = potions.length - 1; i >= 0; i--) {
    let potion = potions[i];
    potion.update();
    potion.display();
    if (character.collidesWith(potion)) {
      health = min(1000, health + 100); // Ensure health doesn't exceed 100
      potions.splice(i, 1); // Remove potion after collision
    } else if (potion.timer <= 0) {
      potions.splice(i, 1); // Remove potion after timer reaches 0
    }
  }
  displayHealthBar();
  displayScore();
}

function drawGrid() {
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      image(grassImage1, x, y, gridSize, gridSize); // Draw the image at each grid cell
    }
  }
}

function displayHealthBar() {
  let totalHealth = health / 5;
  textAlign(LEFT);
  fill(255);  
  text(`Health: ${totalHealth}`, 10, 50);
  
  //Back
  stroke(255, 0, 0, 2);
  rect(10, 10, 200, 20, 0, 20, 20, 0);
  
  //Health
  fill(136, 8, 8);
  rect(10, 10, totalHealth, 20, 0, 20, 20, 0);
}

function displayScore() {
  noStroke();
  fill(255);
  textSize(15);
  text(`Score: ${score}`, 400, 25);
  text(`High Score: ${highScore}`, 400, 45);
}

function gameOver() {
  background(0,0,0,0,0.9);
  gameIsOver = true;

  if (health == 0) {
    noLoop();
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  fill(255, 0, 0);  
  text(`Your Score: ${score}`, width / 2, height / 2 - 100);

  textAlign(CENTER);
  textSize(50);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(30);
  text("Click to Restart", width / 2, height / 2 + 50);

}

function resetGame() {
  health = 1000;
  score = 0;
  monsters = [];
  rocks = [];
  gameIsOver = false;
  for (let i = 0; i < numRocks; i++) {
    rocks.push(createRandomRock());
  }
  character.x = width / 2;
  character.y = height / 2;
  potions = [];
  gameState = "title"; // Reset to title screen
  loop();
}

function spawnMonster() {
  if (gameState === "game") {
    let speed = random(2, 3);
    monsters.push(new Monster(speed));
    
        monsters.forEach((monster) => {
          zombieGrowl.setVolume(0.01)
          zombieGrowl.play();
    });
  }
}

function createRandomRock() {
  let rock;
  let validPosition = false;

  while (!validPosition) {
    let x = floor(random(2, 10)) * gridSize;
    let y = floor(random(2, 10)) * gridSize;

    let validRock = true;
    for (let i = 0; i < rocks.length; i++) {
      let d = dist(x, y, rocks[i].x, rocks[i].y);
      if (d < rocks[i].size + 20) {
        // Ensure the distance is more than rock size plus some padding
        validRock = false;
        break;
      }
    }
    if (validRock && dist(x, y, width / 2, height / 2) > 200) {
      rock = new Rock(x, y, random(40, 55));
      validPosition = true;
    }
  }
  return rock;
}

function spawnPotion() {
  if (gameState === "game") {
    let validPosition = false;
    let x, y;

    while (!validPosition) {
      x = floor(random(0, width / gridSize)) * gridSize;
      y = floor(random(0, height / gridSize)) * gridSize;

      validPosition = true;
      for (let i = 0; i < rocks.length; i++) {
        let d = dist(x, y, rocks[i].x, rocks[i].y);
        if (d < rocks[i].size / 2 + 20) {
          validPosition = false;
          break;
        }
      }
    }

    potions.push(new HealthPotion(x, y)); // Spawn potion
  }
}

class Character {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.size = 50;
    this.speed = easing;
  }

  update() {
    let targetX = mouseX;
    let targetY = mouseY;
    let stepX = (targetX - this.x) * this.speed;
    let stepY = (targetY - this.y) * this.speed;
    this.x += stepX;
    this.y += stepY;

    rocks.forEach((rock) => {
      if (this.collidesWith(rock)) {
        this.x -= stepX;
        this.y -= stepY;
      }
    });
  }

  display() {
    fill(0);
    ellipse(this.x, this.y, this.size);
  }

  collidesWith(entity) {
    let d = dist(this.x, this.y, entity.x, entity.y);
    return d < this.size / 2 + entity.size / 2;
  }
  

  stop() {
    this.speed = 0;
  }

  resume() {
    this.speed = easing;
  }
}

class Monster {
  constructor(speed) {
    this.x = random(width);
    this.y = random(height);
    this.size = 30;
    this.speed = speed;
  }

  update() {
    let angle = atan2(character.y - this.y, character.x - this.x);
    let dx = cos(angle) * this.speed;
    let dy = sin(angle) * this.speed;

    let targetX = this.x + dx;
    let targetY = this.y + dy;

    let adjusted = false;
    rocks.forEach((rock) => {
      if (this.collidesWith(rock)) {
        let rockAngle = atan2(this.y - rock.y, this.x - rock.x);
        dx = cos(rockAngle) * this.speed;
        dy = sin(rockAngle) * this.speed;
        targetX = this.x + dx;
        targetY = this.y + dy;
        adjusted = true;
      }
    });

    monsters.forEach((other) => {
      if (other !== this && this.collidesWith(other)) {
        let otherAngle = atan2(this.y - other.y, this.x - other.x);
        dx = cos(otherAngle) * this.speed;
        dy = sin(otherAngle) * this.speed;
        targetX = this.x + dx;
        targetY = this.y + dy;
        adjusted = true;
        
      }
    });

    if (!adjusted) {
      this.x = targetX;
      this.y = targetY;
    } 
    else {
      // Move a small step in the adjusted direction to avoid overlap
      this.x += dx * 0.5;
      this.y += dy * 0.5;
    }
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size);
  }

  collidesWith(entity) {
    let d = dist(this.x, this.y, entity.x, entity.y);
    return d < this.size / 2 + entity.size / 2;
  }
}

class Rock {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.image = RockImage;
  }

  display() {
    // Draw the appropriate rock image
    image(
      this.image,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }

  collidesWith(entity) {
    let d = dist(this.x, this.y, entity.x, entity.y);
    return d < this.size / 2 + entity.size / 2;
  }
}

class HealthPotion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.timer = 120;
  }

  update() {
    this.timer--;
  }
  display() {
    fill(0, 255, 0);
    ellipse(this.x, this.y, this.size);
  }
}

function mousePressed() {
  if (gameState === "title")
  {
    gameState = "instructions";
  } 
  else if (gameState === "instructions")
  {
    gameState = "game";
  } 
  else if (gameState === "gameOver")
  {
    resetGame();
  }
}
