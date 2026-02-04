class Boss extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 2;
    this.maxForce = 0.1;
    this.r = 40;
    this.color = color(150, 0, 150); // Violet phase 1
    this.health = 20;
    this.maxHealth = 20;
    this.isActive = true;

    // PHASE SYSTEM
    this.phase = 1; // Phase 1 or 2
    this.phase2Triggered = false;

    // Movement
    this.distanceCercle = 150;
    this.wanderRadius = 70;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.2;

    // LASER SYSTEM
    this.isChargingLaser = false;
    this.isFiringLaser = false;
    this.chargeTime = 60;
    this.chargeCounter = 0;
    this.laserDuration = 30;
    this.laserCounter = 0;
    this.laserCooldown = 90;
    this.laserCooldownCounter = 0;
    this.laserAngle = 0;
    this.laserWidth = 40;
    this.laserLength = 1500;
    this.targetAngle = 0;
    this.bombCooldown = 240; // 4 seconds
    this.bombCooldownCounter = 0;
    // PHASE 2: VERTICAL LASERS
    this.verticalLasers = [];
    this.isChargingVerticalLasers = false;
    this.isFiringVerticalLasers = false;
    this.verticalLaserChargeTime = 90; // 1.5 seconds
    this.verticalLaserChargeCounter = 0;
    this.verticalLaserDuration = 60; // 1 second
    this.verticalLaserCounter = 0;
    this.verticalLaserCooldown = 300; // 5 seconds
    this.verticalLaserCooldownCounter = 0;
    this.numVerticalLasers = 5;
    this.verticalLaserWidth = 80;

    // ROCKET ATTACK
    this.rocketCooldown = 300; // 5 seconds
    this.rocketCooldownCounter = 0;
    this.numRockets = 5;

    // Visual effects
    this.glowSize = 0;
    this.warningFlash = 0;
  }

  enterPhase2() {
    this.phase = 2;
    this.phase2Triggered = true;
    this.color = color(0, 255, 0); // Green in phase 2
    this.health = 30; // Restore health for phase 2
    this.maxHealth = 30;
    this.maxSpeed = 3; // Faster movement
    this.verticalLaserCooldownCounter = this.verticalLaserCooldown; // Start cooldown
  }

  update() {
    // Phase 2 movement - more aggressive
    if (this.phase === 2) {
      let wanderForce = this.wander();
      wanderForce.mult(1.5); // More erratic
      this.applyForce(wanderForce);
    } else {
      let wanderForce = this.wander();
      this.applyForce(wanderForce);
    }

    super.update();

    this.edges();

    // Update laser cooldown
    if (this.laserCooldownCounter > 0) {
      this.laserCooldownCounter--;
    }
    if (this.bombCooldownCounter > 0) {
      this.bombCooldownCounter--;
    }
    if (this.rocketCooldownCounter > 0) {
      this.rocketCooldownCounter--;
    }

    // Phase 2: Vertical laser cooldown
    if (this.phase === 2 && this.verticalLaserCooldownCounter > 0) {
      this.verticalLaserCooldownCounter--;
    }

    // Laser charging (horizontal)
    if (this.isChargingLaser) {
      this.chargeCounter++;
      this.glowSize = map(this.chargeCounter, 0, this.chargeTime, 0, 100);
      this.warningFlash = sin(frameCount * 0.3) * 255;

      if (this.chargeCounter >= this.chargeTime) {
        this.isChargingLaser = false;
        this.isFiringLaser = true;
        this.laserCounter = 0;
        this.laserAngle = this.targetAngle;

      }
    }

    // Laser firing (horizontal)
    if (this.isFiringLaser) {
      this.laserCounter++;

      if (this.laserCounter >= this.laserDuration) {
        this.isFiringLaser = false;
        this.laserCooldownCounter = this.laserCooldown;
        this.glowSize = 0;
      }
    }

    // PHASE 2: Vertical laser charging
    if (this.isChargingVerticalLasers) {
      this.verticalLaserChargeCounter++;

      if (this.verticalLaserChargeCounter >= this.verticalLaserChargeTime) {
        // Generate laser positions
        this.generateVerticalLasers();
        this.isChargingVerticalLasers = false;
        this.isFiringVerticalLasers = true;
        this.verticalLaserCounter = 0;
      }
    }

    // PHASE 2: Vertical laser firing
    if (this.isFiringVerticalLasers) {
      this.verticalLaserCounter++;

      if (this.verticalLaserCounter >= this.verticalLaserDuration) {
        this.isFiringVerticalLasers = false;
        this.verticalLaserCooldownCounter = this.verticalLaserCooldown;
        this.verticalLasers = [];
      }
    }
  }

  // Generate random vertical laser positions with safe spaces
  generateVerticalLasers() {
    this.verticalLasers = [];
    let usedPositions = [];

    for (let i = 0; i < this.numVerticalLasers; i++) {
      let x = random(100, width - 100);

      // Make sure lasers aren't too close to each other
      let tooClose = false;
      for (let pos of usedPositions) {
        if (abs(x - pos) < this.verticalLaserWidth + 100) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        usedPositions.push(x);
        this.verticalLasers.push(x);
      }
    }
  }
  dropBomb(bombsArray) {
    if (this.bombCooldownCounter <= 0) {
      // Drop bomb at boss position
      let bomb = new Bomb(this.pos.x - 50, this.pos.y);
      bombsArray.push(bomb);
      this.bombCooldownCounter = this.bombCooldown;
      return bomb;
    }
    return null;
  }

  // Fire a swarm of flocking rockets
  fireRockets(rocketsArray) {
    if (this.rocketCooldownCounter <= 0) {
      for (let i = 0; i < this.numRockets; i++) {
        let rocket = new Rocket(this.pos.x + random(-50, 50), this.pos.y + random(-50, 50));
        rocketsArray.push(rocket);
      }
      this.rocketCooldownCounter = this.rocketCooldown;
      return true;
    }
    return false;
  }

  // Start charging vertical lasers (Phase 2 attack)
  chargeVerticalLasers() {
    if (this.phase === 2 &&
      !this.isChargingVerticalLasers &&
      !this.isFiringVerticalLasers &&
      this.verticalLaserCooldownCounter <= 0) {
      this.isChargingVerticalLasers = true;
      this.verticalLaserChargeCounter = 0;
    }
  }

  // Check if vertical lasers hit airplane
  verticalLasersHitAirplane(airplane) {
    if (!this.isFiringVerticalLasers) return false;

    for (let laserX of this.verticalLasers) {
      let distance = abs(airplane.pos.x - laserX);
      if (distance < (this.verticalLaserWidth / 2 + airplane.r)) {
        return true;
      }
    }
    return false;
  }

  // Start charging laser towards target
  chargeLaser(target) {
    if (!this.isChargingLaser && !this.isFiringLaser && this.laserCooldownCounter <= 0) {
      this.isChargingLaser = true;
      this.chargeCounter = 0;


      let direction = createVector(target.x - this.pos.x, target.y - this.pos.y);
      this.targetAngle = direction.heading();
    }
  }

  // Spawn a normal enemy
  spawnEnemy(enemiesArray) {
    let spawnX = this.pos.x - 100;
    let spawnY = this.pos.y + random(-100, 100);
    let enemy = new Enemy(spawnX, spawnY);
    enemiesArray.push(enemy);
  }

  // Spawn a shooting enemy
  spawnShootingEnemy(enemiesArray) {
    let spawnX = this.pos.x - 100;
    let spawnY = this.pos.y + random(-100, 100);
    let enemy = new Enemy(spawnX, spawnY);
    enemy.shootCooldown = 60;
    enemy.detectionRange = 400;
    enemy.color = color(255, 100, 0);
    enemiesArray.push(enemy);
  }

  laserHitsAirplane(airplane) {
    if (!this.isFiringLaser) return false;

    let laserEnd = createVector(
      this.pos.x + cos(this.laserAngle) * this.laserLength,
      this.pos.y + sin(this.laserAngle) * this.laserLength
    );

    let distance = this.distanceToLine(airplane.pos, this.pos, laserEnd);

    let toAirplane = createVector(airplane.pos.x - this.pos.x, airplane.pos.y - this.pos.y);
    let laserDir = createVector(cos(this.laserAngle), sin(this.laserAngle));
    let dot = toAirplane.dot(laserDir);

    return distance < (this.laserWidth / 2 + airplane.r) && dot > 0;
  }

  distanceToLine(point, lineStart, lineEnd) {
    let line = p5.Vector.sub(lineEnd, lineStart);
    let pointToStart = p5.Vector.sub(point, lineStart);

    let lineLength = line.mag();
    line.normalize();

    let projection = pointToStart.dot(line);
    projection = constrain(projection, 0, lineLength);

    let closest = p5.Vector.add(lineStart, p5.Vector.mult(line, projection));
    return p5.Vector.dist(point, closest);
  }

  hit() {
    this.health--;

    if (this.health <= 0) {
      if (this.phase === 1 && !this.phase2Triggered) {
        // Don't die, enter phase 2
        this.enterPhase2();
      } else {
        // Phase 2 complete, boss dies
        this.isActive = false;
      }
    }
  }

  show() {
    // PHASE 2: Draw vertical laser warnings
    if (this.isChargingVerticalLasers) {
      push();
      let alpha = map(sin(frameCount * 0.2), -1, 1, 100, 255);

      // Show warning zones
      for (let x = 0; x <= width; x += this.verticalLaserWidth + 100) {
        fill(255, 0, 0, alpha * 0.3);
        noStroke();
        rect(x, 0, this.verticalLaserWidth, height);
      }
      pop();

      // Warning text
      push();
      fill(255, 0, 0, alpha);
      textSize(40);
      textAlign(CENTER);
      text("⚠ VERTICAL LASERS INCOMING! ⚠", width / 2, height / 2);
      pop();
    }

    // PHASE 2: Draw vertical lasers
    if (this.isFiringVerticalLasers) {
      push();
      for (let laserX of this.verticalLasers) {
        // Outer glow
        fill(0, 255, 0, 50);
        noStroke();
        rect(laserX - this.verticalLaserWidth / 2 - 10, 0,
          this.verticalLaserWidth + 20, height);

        // Main beam
        fill(0, 255, 0, 200);
        rect(laserX - this.verticalLaserWidth / 2, 0,
          this.verticalLaserWidth, height);

        // Core beam
        fill(200, 255, 200);
        rect(laserX - this.verticalLaserWidth / 4, 0,
          this.verticalLaserWidth / 2, height);
      }
      pop();
    }

    // Draw charging warning indicator (horizontal laser)
    if (this.isChargingLaser) {
      push();
      stroke(255, 0, 0, this.warningFlash);
      strokeWeight(3);
      let warningEnd = createVector(
        this.pos.x + cos(this.targetAngle) * 500,
        this.pos.y + sin(this.targetAngle) * 500
      );
      line(this.pos.x, this.pos.y, warningEnd.x, warningEnd.y);

      fill(255, 0, 0, 100);
      noStroke();
      circle(this.pos.x, this.pos.y, this.glowSize);
      pop();
    }

    // Draw laser beam (horizontal)
    if (this.isFiringLaser) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.laserAngle);

      fill(255, 0, 255, 50);
      noStroke();
      rect(0, -this.laserWidth, this.laserLength, this.laserWidth * 2);

      fill(255, 50, 255, 200);
      rect(0, -this.laserWidth / 2, this.laserLength, this.laserWidth);

      fill(255, 200, 255);
      rect(0, -this.laserWidth / 4, this.laserLength, this.laserWidth / 2);

      pop();
    }

    // Draw boss body
    push();
    translate(this.pos.x, this.pos.y);

    if (this.vel.mag() > 0.2) {
      rotate(this.vel.heading());
    }

    // Phase 2 glow effect
    if (this.phase === 2) {
      fill(0, 255, 0, 100);
      noStroke();
      circle(0, 0, this.r * 4);
    } else if (this.laserCooldownCounter <= 0 && !this.isChargingLaser && !this.isFiringLaser) {
      fill(150, 0, 150, 100);
      noStroke();
      circle(0, 0, this.r * 3);
    }

    // GIANT MACHINE BOSS VISUALS

    // Main Body
    if (this.phase === 2) {
      fill(50, 200, 50); // Bio-mech Green
    } else {
      fill(100, 50, 150); // Dark Purple
    }
    stroke(200);
    strokeWeight(2);

    // Center Hexagon
    beginShape();
    let r = this.r;
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);

    // Rotating Turrets / Wings
    push();
    rotate(frameCount * 0.05);
    noFill();
    stroke(255, 100);
    strokeWeight(5);
    arc(0, 0, r * 2.5, r * 2.5, 0, PI * 1.5);
    pop();

    // Core Eye
    if (this.phase === 2) {
      fill(255, 0, 0);
    } else {
      fill(255, 0, 255);
    }
    noStroke();
    circle(0, 0, r * 0.6);

    // Eye Glow
    fill(255, 255, 255, 100 + sin(frameCount * 0.2) * 100);
    circle(0, 0, r * 0.3);

    pop();

    // Health bar
    push();
    let barWidth = 80;
    let barHeight = 8;
    let barX = this.pos.x - barWidth / 2;
    let barY = this.pos.y - this.r - 20;

    fill(50);
    noStroke();
    rect(barX, barY, barWidth, barHeight);

    let healthPercent = this.health / this.maxHealth;
    if (this.phase === 2) {
      fill(0, 255, 0);
    } else if (healthPercent > 0.5) {
      fill(0, 255, 0);
    } else if (healthPercent > 0.25) {
      fill(255, 200, 0);
    } else {
      fill(255, 0, 0);
    }
    rect(barX, barY, barWidth * healthPercent, barHeight);

    noFill();
    stroke(255);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight);

    // Text
    fill(255);
    noStroke();
    textSize(12);
    textAlign(CENTER);
    let phaseText = this.phase === 2 ? " [PHASE 2]" : "";
    text("BOSS: " + this.health + "/" + this.maxHealth + phaseText, this.pos.x, barY - 5);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}