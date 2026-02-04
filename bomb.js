class Bomb extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 1.5; // Slow movement
    this.maxForce = 0.05;
    this.distanceCercle = 80;
    this.wanderRadius = 40;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.1;

    this.r = 30; // Rayon de la bombe
    this.lifetime = 300; // 5 secondes
    this.age = 0;
    this.isActive = true;
    this.color = color(255, 100, 0);
    this.warningTime = 60; // 1 seconde d'avertissement
    this.isExploding = false;
    this.explosionRadius = 100;
    this.explosionCounter = 0;
    this.explosionDuration = 30;
  }

  update() {
    // Move if not exploding
    if (!this.isExploding) {
      let wanderForce = this.wander();
      this.applyForce(wanderForce);
      super.update();
      this.edges();
    }

    this.age++;

    // Explosion après lifetime
    if (this.age >= this.lifetime && !this.isExploding) {
      this.isExploding = true;
      this.explosionCounter = 0;
    }

    // Explosion animation
    if (this.isExploding) {
      this.explosionCounter++;
      if (this.explosionCounter >= this.explosionDuration) {
        this.isActive = false;
      }
    }
  }

  // Check if explosion hits airplane
  explosionHits(airplane) {
    if (!this.isExploding) return false;

    let d = p5.Vector.dist(this.pos, airplane.pos);
    return d < (this.explosionRadius + airplane.r);
  }

  show() {
    push();

    // Explosion effect
    if (this.isExploding) {
      let explosionSize = map(this.explosionCounter, 0, this.explosionDuration, 0, this.explosionRadius * 2);
      let alpha = map(this.explosionCounter, 0, this.explosionDuration, 255, 0);

      // Outer explosion
      fill(255, 100, 0, alpha * 0.5);
      noStroke();
      circle(this.pos.x, this.pos.y, explosionSize * 1.5);

      // Inner explosion
      fill(255, 200, 0, alpha);
      circle(this.pos.x, this.pos.y, explosionSize);

      // Core
      fill(255, 255, 200, alpha);
      circle(this.pos.x, this.pos.y, explosionSize * 0.5);
    } else {
      // Warning flash when about to explode
      let timeLeft = this.lifetime - this.age;
      if (timeLeft < this.warningTime) {
        let flashAlpha = map(sin(frameCount * 0.5), -1, 1, 100, 255);
        fill(255, 0, 0, flashAlpha);
        noStroke();
        circle(this.pos.x, this.pos.y, this.r * 2.5);
      }

      // Bomb body
      fill(this.color);
      stroke(255);
      strokeWeight(2);
      circle(this.pos.x, this.pos.y, this.r * 2);

      // Fuse
      fill(50);
      noStroke();
      rect(this.pos.x - 3, this.pos.y - this.r - 10, 6, 10);

      // Spark at fuse
      if (frameCount % 10 < 5) {
        fill(255, 200, 0);
        circle(this.pos.x, this.pos.y - this.r - 10, 6);
      }

      // Danger symbol
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(20);
      text("💣", this.pos.x, this.pos.y);

      // Timer
      fill(255);
      textSize(12);
      text(Math.ceil((this.lifetime - this.age) / 60), this.pos.x, this.pos.y + this.r + 15);
    }

    pop();
  }
}