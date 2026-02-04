class Airplane extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 6;
    this.maxForce = 0.3;
    this.r = 20;
    this.currentWeapon = "pistol";
    this.color = color(100, 200, 255);
    this.lives = 3;
    this.isInvincible = false;
    this.invincibilityTime = 120;
    this.invincibilityCounter = 0;

    // DODGE SYSTEM
    this.isDodging = false;
    this.dodgeDuration = 20; // frames
    this.dodgeCounter = 0;
    this.dodgeCooldown = 60; // frames (1 second)
    this.dodgeCooldownCounter = 0;
    this.dodgeSpeed = 15;
    this.dodgeDirection = null;

    // PARRY SYSTEM
    this.parryRadius = 80;
    this.canParry = true;
    this.parryCooldown = 90; // 1.5 seconds
    this.parryCooldownCounter = 0;
  }

  followMouse() {
    let target = createVector(mouseX, mouseY);
    let force = this.arrive(target);
    this.applyForce(force);
  }

  fire(target) {
    if (soundManager) soundManager.playSound('shoot');
    if (this.currentWeapon === "pistol") {
      return new Pistol(this.pos.x, this.pos.y, target);
    } else if (this.currentWeapon === "missile") {
      return new Missile(this.pos.x, this.pos.y, target);
    }
  }

  switchWeapon() {
    if (this.currentWeapon === "pistol") {
      this.currentWeapon = "missile";
    } else {
      this.currentWeapon = "pistol";
    }
  }

  // DODGE FUNCTION
  dodge() {
    if (this.dodgeCooldownCounter <= 0 && !this.isDodging) {
      this.isDodging = true;
      this.dodgeCounter = this.dodgeDuration;
      this.dodgeCooldownCounter = this.dodgeCooldown;

      // Direction du dodge = direction vers la souris
      this.dodgeDirection = createVector(mouseX - this.pos.x, mouseY - this.pos.y);
      this.dodgeDirection.normalize();
      this.dodgeDirection.mult(this.dodgeSpeed);

      // Invincible pendant le dodge
      this.isInvincible = true;
    }
  }

  // PARRY FUNCTION
  parry(enemies) {
    if (!this.canParry || this.parryCooldownCounter > 0) {
      return null;
    }

    // Chercher l'ennemi le plus proche dans le rayon de parry
    let closestEnemy = null;
    let closestDist = this.parryRadius;

    for (let enemy of enemies) {
      let d = p5.Vector.dist(this.pos, enemy.pos);
      if (d < closestDist) {
        closestDist = d;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      this.canParry = false;
      this.parryCooldownCounter = this.parryCooldown;
      return closestEnemy; // Retourne l'ennemi à détruire
    }

    return null;
  }

  update() {
    // Dodge movement
    if (this.isDodging) {
      this.pos.add(this.dodgeDirection);
      this.dodgeCounter--;

      if (this.dodgeCounter <= 0) {
        this.isDodging = false;
        this.isInvincible = false;
      }
    } else {
      // Normal movement
      super.update();
    }

    // Update invincibility (si pas en dodge)
    if (this.isInvincible && !this.isDodging) {
      this.invincibilityCounter--;
      if (this.invincibilityCounter <= 0) {
        this.isInvincible = false;
      }
    }

    // Update dodge cooldown
    if (this.dodgeCooldownCounter > 0) {
      this.dodgeCooldownCounter--;
    }

    // Update parry cooldown
    if (this.parryCooldownCounter > 0) {
      this.parryCooldownCounter--;
      if (this.parryCooldownCounter <= 0) {
        this.canParry = true;
      }
    }
  }

  hit() {
    if (!this.isInvincible) {
      if (soundManager) soundManager.playSound('player_hit');
      this.lives--;
      this.isInvincible = true;
      this.invincibilityCounter = this.invincibilityTime;
      return true;
    }
    return false;
  }

  isDead() {
    return this.lives <= 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    if (this.vel.mag() > 0.2) {
      rotate(this.vel.heading() + PI / 2); // Rotate to face direction (facing up by default)
    }

    // Shadow
    fill(0, 0, 0, 50);
    noStroke();
    ellipse(0, 20, 40, 20);

    // Effet de dodge (traînée)
    if (this.isDodging && frameCount % 3 === 0) {
      fill(255, 255, 255, 100);
      noStroke();
      beginShape();
      vertex(0, -30);
      vertex(-20, 20);
      vertex(0, 10);
      vertex(20, 20);
      endShape(CLOSE);
    }

    // Flash when invincible
    if (this.isInvincible && frameCount % 10 < 5) {
      tint(255, 100);
    }

    // ARCADE AIRPLANE VISUALS
    stroke(200);
    strokeWeight(1);

    // Wings
    fill(100, 100, 255);
    triangle(0, -10, -30, 15, 30, 15);

    // Tail
    fill(80, 80, 200);
    triangle(0, 10, -10, 25, 10, 25);

    // Body
    fill(200, 200, 255);
    ellipse(0, 0, 15, 45);

    // Cockpit
    fill(50, 200, 255);
    ellipse(0, -10, 8, 15);

    // Engine glow
    fill(255, 100, 50, random(150, 255));
    noStroke();
    circle(0, 25, random(5, 8));

    pop();

    // Draw invincibility shield
    if (this.isInvincible) {
      push();
      noFill();
      stroke(100, 200, 255, 100);
      strokeWeight(3);
      circle(this.pos.x, this.pos.y, this.r * 3);
      pop();
    }

    // PARRY CIRCLE
    if (this.canParry && this.parryCooldownCounter <= 0) {
      push();
      noFill();
      stroke(255, 200, 0, 100);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.parryRadius * 2);
      pop();
    }

    push();
    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.currentWeapon.toUpperCase(), this.pos.x, this.pos.y - 30);
    pop();
  }
}