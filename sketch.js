let airplane;
let enemies = [];
let weapons = [];
let enemyBullets = [];
let bombs = []; // NOUVEAU
let boss = null;
let score = 0;
let gameStarted = false;
let gameOver = false;
let youWon = false;
let waveNumber = 1;
let enemiesKilledThisWave = 0;

let stars = [];
let victorySoundPlayed = false;
let gameOverSoundPlayed = false;
let bossEnemiesSpawned = 0;
let maxBossEnemiesPerMinute = 2;
let bossSpawnTimer = 0;
let bossSpawnInterval = 3600;

// BOUNDARIES
let boundaryMargin = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);



  // Initialize stars
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.5, 2)
    });
  }

  airplane = new Airplane(width / 2, height / 2);

  // Spawn boss at start on the right side
  spawnBoss();
}

function spawnBoss() {
  // Boss fixe sur le côté droit au milieu verticalement
  boss = new Boss(width - 100, height / 2);
}

function draw() {
  // Background changes based on boss phase
  if (boss && boss.phase === 2) {
    background(20, 0, 40); // Darker Purple background for phase 2
  } else {
    background(10, 10, 30); // Deep space background
  }

  // Draw Stars
  noStroke();
  fill(255, 255, 255, 150);
  for (let star of stars) {
    ellipse(star.x, star.y, star.size);
    star.x -= star.speed;
    if (star.x < 0) star.x = width;
  }

  if (!gameStarted) {
    displayStartScreen();
    return;
  }

  if (gameOver) {
    if (youWon) {
      if (!victorySoundPlayed) {

        victorySoundPlayed = true;
      }
      displayVictory();
    } else {
      if (!gameOverSoundPlayed) {

        gameOverSoundPlayed = true;
      }
      displayGameOver();
    }
    return;
  }

  // Update and show airplane
  airplane.followMouse();

  // Apply boundaries to airplane
  let boundaryForce = airplane.boundaries(0, 0, width, height, boundaryMargin);
  airplane.applyForce(boundaryForce);

  // Avoid bombs
  if (bombs.length > 0) {
    let avoidForce = airplane.avoid(bombs);
    avoidForce.mult(2); // Make avoid force stronger
    airplane.applyForce(avoidForce);
  }

  airplane.update();
  airplane.show();

  // Check if airplane is dead
  if (airplane.isDead()) {
    gameOver = true;
    youWon = false;
    return;
  }

  // BOSS LOGIC - Boss is always present
  if (boss) {
    boss.update();
    boss.show();

    // Update boss spawn timer
    bossSpawnTimer++;
    if (bossSpawnTimer >= bossSpawnInterval) {
      // Reset every minute
      bossSpawnTimer = 0;
      bossEnemiesSpawned = 0;
    }

    // Boss AI - Different attacks based on phase
    if (boss.phase === 1) {
      // PHASE 1 LOGIC
      if (frameCount % 180 === 0) { // Every 3 seconds
        // Check if we can spawn enemies (limit 2 per minute)
        if (bossEnemiesSpawned < maxBossEnemiesPerMinute) {
          let attackType = floor(random(4)); // 0, 1, 2, or 3

          if (attackType === 0) {
            boss.chargeLaser(airplane.pos);
          } else if (attackType === 1) {
            boss.spawnEnemy(enemies);
            bossEnemiesSpawned++;
          } else if (attackType === 2) {
            boss.spawnShootingEnemy(enemies);
            bossEnemiesSpawned++;
          } else {
            // Drop bomb
            boss.dropBomb(bombs);
          }
        } else {
          // If spawn limit reached, choose between laser and bomb
          let attackType = floor(random(2));
          if (attackType === 0) {
            boss.chargeLaser(airplane.pos);
          } else {
            boss.dropBomb(bombs);
          }
        }
      }
    } else if (boss.phase === 2) {
      // PHASE 2 LOGIC - More aggressive with lasers and bombs

      // Vertical lasers every 5 seconds
      if (frameCount % 300 === 0) {
        if (boss.chargeVerticalLasers) {
          boss.chargeVerticalLasers();
        }
      }

      // Horizontal laser attacks and bombs every 2 seconds
      if (frameCount % 120 === 0) {
        let attackType = floor(random(3)); // 0, 1, or 2

        if (attackType === 0 || attackType === 1) {
          boss.chargeLaser(airplane.pos);
        } else {
          boss.dropBomb(bombs);
        }
      }

      // Check if vertical lasers hit airplane
      if (boss.verticalLasersHitAirplane && boss.verticalLasersHitAirplane(airplane) && !airplane.isDodging) {
        if (airplane.hit()) {
          push();
          fill(0, 255, 0, 200);
          noStroke();
          circle(airplane.pos.x, airplane.pos.y, 80);
          pop();
        }
      }
    }

    // Check if horizontal laser hits airplane
    if (boss.laserHitsAirplane(airplane) && !airplane.isDodging) {
      if (airplane.hit()) {
        // Visual feedback
        push();
        fill(255, 0, 255, 200);
        noStroke();
        circle(airplane.pos.x, airplane.pos.y, 80);
        pop();
      }
    }

    // Check collision with airplane
    if (!airplane.isDodging) {
      let d = p5.Vector.dist(airplane.pos, boss.pos);
      if (d < (airplane.r + boss.r)) {
        if (airplane.hit()) {
          push();
          fill(255, 0, 0, 150);
          noStroke();
          circle(airplane.pos.x, airplane.pos.y, 60);
          pop();
        }
      }
    }

    // Check if boss is dead
    if (!boss.isActive) {
      gameOver = true;
      youWon = true;
      score += 1000; // Boss bonus
      return;
    }
  }

  // Update and show enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    // Apply boundaries
    let boundaryForce = enemies[i].boundaries(0, 0, width, height, boundaryMargin);
    enemies[i].applyForce(boundaryForce);

    // Avoid bombs
    if (bombs.length > 0) {
      let avoidForce = enemies[i].avoid(bombs);
      enemies[i].applyForce(avoidForce);
    }

    enemies[i].update();
    enemies[i].show();

    // ENEMY SHOOTING
    let bullet = enemies[i].tryShoot(airplane);
    if (bullet) {
      enemyBullets.push(bullet);
    }

    // Check collision with airplane (seulement si pas en dodge)
    if (!airplane.isDodging) {
      let d = p5.Vector.dist(airplane.pos, enemies[i].pos);
      if (d < (airplane.r + enemies[i].r)) {
        if (airplane.hit()) {
          enemies.splice(i, 1);
          enemiesKilledThisWave++;

          push();
          fill(255, 0, 0, 150);
          noStroke();
          circle(airplane.pos.x, airplane.pos.y, 60);
          pop();
        }
        continue;
      }
    }

    // Remove inactive enemies
    if (!enemies[i].isActive) {
      enemies.splice(i, 1);
      enemiesKilledThisWave++;
      score += 10;

      // Increase wave every 10 enemies killed
      if (enemiesKilledThisWave >= 10) {
        waveNumber++;
        enemiesKilledThisWave = 0;
        // Boss gets stronger
        if (boss) {
          boss.health += 5;
          boss.maxHealth += 5;
        }
      }
    }
  }

  // Update and show weapons
  for (let i = weapons.length - 1; i >= 0; i--) {
    weapons[i].update();
    weapons[i].show();

    // Check collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (weapons[i].hits(enemies[j])) {
        enemies[j].hit();
        weapons[i].isActive = false;

        push();
        fill(255, 255, 0, 150);
        noStroke();
        circle(enemies[j].pos.x, enemies[j].pos.y, 30);
        pop();
      }
    }

    // Check collision with boss
    if (boss && weapons[i].hits(boss)) {
      boss.hit();
      weapons[i].isActive = false;

      push();
      fill(255, 255, 0, 150);
      noStroke();
      circle(boss.pos.x, boss.pos.y, 50);
      pop();
    }

    // Remove inactive weapons
    if (!weapons[i].isActive) {
      weapons.splice(i, 1);
    }
  }

  // Update and show ENEMY BULLETS
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].update();
    enemyBullets[i].show();

    // Check collision with airplane (sauf si dodge ou invincible)
    if (!airplane.isDodging && !airplane.isInvincible) {
      if (enemyBullets[i].hits(airplane)) {
        if (airplane.hit()) {
          enemyBullets.splice(i, 1);

          push();
          fill(255, 0, 0, 200);
          noStroke();
          circle(airplane.pos.x, airplane.pos.y, 50);
          pop();
          continue;
        }
      }
    }

    // Remove inactive bullets
    if (!enemyBullets[i].isActive) {
      enemyBullets.splice(i, 1);
    }
  }

  // Update and show BOMBS
  for (let i = bombs.length - 1; i >= 0; i--) {
    bombs[i].update();
    bombs[i].show();

    // Check if explosion hits airplane
    if (bombs[i].explosionHits(airplane) && !airplane.isDodging) {
      if (airplane.hit()) {
        bombs.splice(i, 1);

        push();
        fill(255, 100, 0, 200);
        noStroke();
        circle(airplane.pos.x, airplane.pos.y, 80);
        pop();
        continue;
      }
    }

    // Remove inactive bombs
    if (!bombs[i].isActive) {
      bombs.splice(i, 1);
    }
  }

  displayUI();
}

function displayStartScreen() {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("AIRPLANE BOSS BATTLE", width / 2, height / 2 - 140);

  textSize(24);
  text("Controls:", width / 2, height / 2 - 60);
  text("MOUSE - Move airplane", width / 2, height / 2 - 20);
  text("CLICK - Fire weapon", width / 2, height / 2 + 15);
  text("R - Switch weapon", width / 2, height / 2 + 50);
  text("C - Dodge (invincible dash)", width / 2, height / 2 + 85);
  text("SPACE - Parry (destroy nearby enemy)", width / 2, height / 2 + 120);

  textSize(20);
  fill(255, 100, 100);
  text("⚠ Boss spawns enemies, shoots lasers & drops bombs!", width / 2, height / 2 + 155);

  fill(255, 0, 255);
  textSize(22);
  text("💀 Survive PHASE 2 to win!", width / 2, height / 2 + 190);

  textSize(32);
  fill(0, 255, 0);
  text("Click to Start", width / 2, height / 2 + 240);
  pop();
}

function displayUI() {
  push();
  fill(255);
  textAlign(LEFT);
  textSize(20);

  // Score
  text("Score: " + score, 20, 30);

  // Wave
  text("Wave: " + waveNumber, 20, 60);

  // Lives
  text("Lives: ", 20, 90);
  for (let i = 0; i < airplane.lives; i++) {
    fill(255, 100, 100);
    noStroke();
    triangle(60 + i * 25, 85, 60 + i * 25 + 8, 75, 60 + i * 25 + 16, 85);
  }

  // Weapon type
  fill(255);
  text("Weapon: " + airplane.currentWeapon.toUpperCase(), 20, 120);
  text("Press R to switch", 20, 145);

  // Enemy count
  fill(255);
  text("Enemies: " + enemies.length, 20, 175);

  // Bomb count
  fill(255, 100, 0);
  text("Bombs: " + bombs.length, 20, 205);

  // DODGE COOLDOWN
  if (airplane.dodgeCooldownCounter > 0) {
    fill(255, 150, 150);
    text("Dodge: " + Math.ceil(airplane.dodgeCooldownCounter / 60) + "s", 20, 235);
  } else {
    fill(150, 255, 150);
    text("Dodge: Ready (C)", 20, 235);
  }

  // PARRY STATUS
  if (airplane.parryCooldownCounter > 0) {
    fill(255, 150, 150);
    text("Parry: " + Math.ceil(airplane.parryCooldownCounter / 60) + "s", 20, 265);
  } else {
    fill(255, 200, 0);
    text("Parry: Ready (SPACE)", 20, 265);
  }

  // Boss spawn limit
  if (boss && boss.phase === 1) {
    let spawnsLeft = maxBossEnemiesPerMinute - bossEnemiesSpawned;
    let timeLeft = Math.ceil((bossSpawnInterval - bossSpawnTimer) / 60);
    if (spawnsLeft > 0) {
      fill(255, 200, 0);
      text("Boss can spawn: " + spawnsLeft + " more", 20, 295);
    } else {
      fill(255, 100, 100);
      text("Boss spawn limit: " + timeLeft + "s", 20, 295);
    }
  }

  // Boss warning
  if (boss && boss.isChargingLaser) {
    push();
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER);
    text("⚠ LASER CHARGING! DODGE NOW! ⚠", width / 2, 60);
    pop();
  }

  // Boss phase indicator
  if (boss) {
    push();
    textAlign(RIGHT);
    textSize(24);

    if (boss.phase === 2) {
      fill(255, 0, 255);
      text("⚡ PHASE 2 ⚡", width - 20, 30);
    } else {
      fill(255, 200, 0);
      text("PHASE 1", width - 20, 30);
    }

    // Boss health bar
    let barWidth = 300;
    let barHeight = 30;
    let barX = width - barWidth - 20;
    let barY = 50;

    // Background
    fill(50);
    noStroke();
    rect(barX, barY, barWidth, barHeight);

    // Health
    let healthPercent = boss.health / boss.maxHealth;
    if (boss.phase === 2) {
      fill(255, 0, 255);
    } else {
      fill(255, 0, 0);
    }
    rect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(barX, barY, barWidth, barHeight);

    // Text
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text("BOSS: " + Math.ceil(boss.health) + "/" + boss.maxHealth, barX + barWidth / 2, barY + barHeight / 2);

    // Vertical laser cooldown in phase 2
    if (boss.phase === 2 && boss.verticalLaserCooldownCounter > 0) {
      fill(255, 0, 0);
      textSize(14);
      textAlign(RIGHT);
      text("Next Vertical Laser: " + Math.ceil(boss.verticalLaserCooldownCounter / 60) + "s",
        width - 20, barY + barHeight + 20);
    }
    pop();
  }

  // Controls reminder
  textSize(14);
  fill(200);
  text("CLICK: Fire | R: Weapon | C: Dodge | SPACE: Parry | D: Debug", 20, height - 20);

  pop();
}

function displayGameOver() {
  push();
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(72);
  text("GAME OVER", width / 2, height / 2 - 100);

  fill(255);
  textSize(36);
  text("Final Score: " + score, width / 2, height / 2);

  textSize(24);
  fill(200);
  text("You reached Wave " + waveNumber, width / 2, height / 2 + 60);

  if (boss) {
    fill(255, 100, 100);
    text("Boss Phase: " + boss.phase, width / 2, height / 2 + 90);
  }

  textSize(32);
  fill(0, 255, 0);
  text("Click to Restart", width / 2, height / 2 + 140);
  pop();
}

function displayVictory() {
  push();
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(72);
  text("VICTORY!", width / 2, height / 2 - 100);

  fill(255);
  textSize(36);
  text("You defeated the BOSS!", width / 2, height / 2 - 20);

  fill(255, 0, 255);
  textSize(28);
  text("Survived BOTH PHASES!", width / 2, height / 2 + 20);

  fill(0, 255, 0);
  textSize(48);
  text("Final Score: " + score, width / 2, height / 2 + 70);

  textSize(24);
  fill(200);
  text("Waves Completed: " + waveNumber, width / 2, height / 2 + 120);

  textSize(32);
  fill(255, 200, 0);
  text("Click to Play Again", width / 2, height / 2 + 170);
  pop();
}

function mousePressed() {
  if (!gameStarted) {
    // Start game
    // Start game
    gameStarted = true;
  } else if (gameOver) {
    console.log("Restarting game...");
    // Restart game
    victorySoundPlayed = false;
    gameOverSoundPlayed = false;
    gameOver = false;
    youWon = false;
    score = 0;
    enemies = [];
    weapons = [];
    enemyBullets = [];
    bombs = []; // RESET BOMBS
    waveNumber = 1;
    enemiesKilledThisWave = 0;
    bossEnemiesSpawned = 0;
    bossSpawnTimer = 0;
    airplane = new Airplane(width / 2, height / 2);
    spawnBoss();
  } else {
    // SHOOT - during game
    let target = createVector(mouseX, mouseY);
    let weapon = airplane.fire(target);
    weapons.push(weapon);
  }
}

function keyPressed() {
  if (!gameStarted || gameOver) return;

  // SPACE to PARRY
  if (key === ' ') {
    let parriedEnemy = airplane.parry(enemies);
    if (parriedEnemy) {
      let index = enemies.indexOf(parriedEnemy);
      if (index > -1) {
        enemies.splice(index, 1);
        enemiesKilledThisWave++;
        score += 20;

        push();
        fill(255, 200, 0, 200);
        noStroke();
        circle(parriedEnemy.pos.x, parriedEnemy.pos.y, 60);
        pop();
      }
    }
  }

  // R to switch weapon
  if (key === 'r' || key === 'R') {
    airplane.switchWeapon();
  }

  // C to DODGE
  if (key === 'c' || key === 'C') {
    airplane.dodge();
  }

  // D for debug mode
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}