class EnemyBullet extends Vehicle {
  constructor(x, y, target) {
    super(x, y);
    this.target = target.copy();
    this.maxSpeed = 8;
    this.r = 6;
    this.lifetime = 180; // 3 seconds
    this.age = 0;
    this.isActive = true;
    this.color = color(255, 0, 0);
    
    // Calculate direction to target
    let direction = p5.Vector.sub(target, this.pos);
    direction.normalize();
    direction.mult(this.maxSpeed);
    this.vel = direction;
  }

  update() {
    // Move in straight line
    this.pos.add(this.vel);
    this.age++;
    
    // Check if bullet has expired
    if (this.age > this.lifetime) {
      this.isActive = false;
    }

    // Check if bullet is off screen
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
      this.isActive = false;
    }
  }

  // Check collision with airplane
  hits(airplane) {
    let d = p5.Vector.dist(this.pos, airplane.pos);
    return d < (this.r + airplane.r);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Draw bullet trail
    stroke(this.color);
    strokeWeight(2);
    noFill();
    let trailLength = 12;
    let trailDir = this.vel.copy().normalize().mult(-trailLength);
    line(0, 0, trailDir.x, trailDir.y);
    
    // Draw bullet
    fill(this.color);
    stroke(255, 100, 100);
    strokeWeight(1);
    circle(0, 0, this.r * 2);
    
    // Inner glow
    fill(255, 200, 200);
    noStroke();
    circle(0, 0, this.r);
    
    pop();
  }
}