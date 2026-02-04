class Pistol extends Weapon {
  constructor(x, y, target) {
    super(x, y, target);
    this.maxSpeed = 12;
    this.r = 4;
    this.color = color(255, 255, 0); // yellow
    
    // Calculate direction vector from position to target
    let direction = p5.Vector.sub(target, this.pos);
    direction.normalize();
    direction.mult(this.maxSpeed);
    
    // Set initial velocity to move straight toward target
    this.vel = direction;
  }

  update() {
    // Pistol moves in straight line, doesn't seek target
    // Just update position based on velocity
    this.pos.add(this.vel);
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
    push();
    translate(this.pos.x, this.pos.y);
    
    // Draw bullet trail
    stroke(this.color);
    strokeWeight(2);
    noFill();
    let trailLength = 15;
    let trailDir = this.vel.copy().normalize().mult(-trailLength);
    line(0, 0, trailDir.x, trailDir.y);
    
    // Draw bullet
    fill(this.color);
    noStroke();
    circle(0, 0, this.r * 2);
    
    pop();
  }
}