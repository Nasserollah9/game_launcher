class Enemy extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 3;
    this.maxForce = 0.15;
    this.r = 15;
    this.color = color(255, 50, 50);
    this.health = 3;
    this.isActive = true;

    this.distanceCercle = 100;
    this.wanderRadius = 50;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.3;

    // SHOOTING SYSTEM
    this.canShoot = true;
    this.shootCooldown = random(120, 180); // 2-3 secondes entre les tirs
    this.shootCooldownCounter = 0;
    this.detectionRange = 300; // Distance pour détecter le joueur
  }

  update() {
    let wanderForce = this.wander();
    this.applyForce(wanderForce);

    super.update();

    this.edges();

    // Update shoot cooldown
    if (this.shootCooldownCounter > 0) {
      this.shootCooldownCounter--;
      if (this.shootCooldownCounter <= 0) {
        this.canShoot = true;
      }
    }
  }

  // Check if can shoot at target
  tryShoot(target) {
    if (!this.canShoot) {
      return null;
    }

    // Check distance to target
    let d = p5.Vector.dist(this.pos, target.pos);

    if (d < this.detectionRange) {
      this.canShoot = false;
      this.shootCooldownCounter = this.shootCooldown;

      // Create enemy bullet

      return new EnemyBullet(this.pos.x, this.pos.y, target.pos);
    }

    return null;
  }

  hit() {
    this.health--;

    if (this.health <= 0) {
      this.isActive = false;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    if (this.vel.mag() > 0.2) {
      rotate(this.vel.heading() + PI / 2);
    }

    // Shadow
    fill(0, 0, 0, 50);
    noStroke();
    ellipse(0, 20, 30, 15);

    // DRONE VISUALS
    stroke(200);
    strokeWeight(1);

    // Body
    fill(255, 100, 0); // Orange
    beginShape();
    vertex(0, -15);
    vertex(10, -5);
    vertex(15, 10);
    vertex(0, 15);
    vertex(-15, 10);
    vertex(-10, -5);
    endShape(CLOSE);

    // Central Eye
    fill(0, 255, 255);
    circle(0, 0, 8);

    // Engine glow
    fill(255, 200, 0, 150);
    noStroke();
    circle(-10, 10, 5);
    circle(10, 10, 5);

    pop();

    // Show detection range in debug mode
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(255, 0, 0, 50);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.detectionRange * 2);
      pop();
    }

    // Show cooldown indicator
    if (this.shootCooldownCounter > 0) {
      push();
      fill(255, 100, 100);
      noStroke();
      let cooldownPercent = this.shootCooldownCounter / this.shootCooldown;
      arc(this.pos.x, this.pos.y, this.r * 2.5, this.r * 2.5,
        -HALF_PI, -HALF_PI + TWO_PI * (1 - cooldownPercent));
      pop();
    }
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