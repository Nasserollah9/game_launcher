class Missile extends Weapon {
  constructor(x, y, target) {
    super(x, y, target);
    this.maxSpeed = 7;
    this.maxForce = 0.25;
    this.r = 6;
    this.color = color(255, 100, 0); // orange/red
    
    // Initial velocity pointing forward
    this.vel = createVector(0, -1);
    this.vel.mult(this.maxSpeed / 2);
    
    this.smokeTrail = [];
  }

  update() {
    // Missile actively seeks and follows the target
    let seekForce = this.seek(this.target);
    this.applyForce(seekForce);
    
    // Update position and velocity
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    
    // Add smoke trail
    if (frameCount % 3 === 0) {
      this.smokeTrail.push(this.pos.copy());
      if (this.smokeTrail.length > 10) {
        this.smokeTrail.shift();
      }
    }
    
    this.age++;
    
    // Check if weapon has expired
    if (this.age > this.lifetime) {
      this.isActive = false;
    }

    // Check if weapon is off screen
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
      this.isActive = false;
    }
  }

  show() {
    // Draw smoke trail
    for (let i = 0; i < this.smokeTrail.length; i++) {
      let alpha = map(i, 0, this.smokeTrail.length, 0, 150);
      let size = map(i, 0, this.smokeTrail.length, 2, 8);
      push();
      fill(150, 150, 150, alpha);
      noStroke();
      circle(this.smokeTrail[i].x, this.smokeTrail[i].y, size);
      pop();
    }

    // Draw missile
    push();
    translate(this.pos.x, this.pos.y);
    
    if (this.vel.mag() > 0.2) {
      rotate(this.vel.heading());
    }
    
    // Missile body
    fill(this.color);
    stroke(255);
    strokeWeight(1);
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r * 1.5, 0);
    
    // Missile fins
    fill(200, 50, 0);
    triangle(-this.r, -this.r / 2, -this.r - 3, -this.r, -this.r, 0);
    triangle(-this.r, this.r / 2, -this.r - 3, this.r, -this.r, 0);
    
    pop();

    // Draw line to target if in debug mode
    if (Vehicle.debug) {
      push();
      stroke(255, 100, 0, 100);
      strokeWeight(1);
      line(this.pos.x, this.pos.y, this.target.x, this.target.y);
      pop();
    }
  }
}