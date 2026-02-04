class Weapon extends Vehicle {
  constructor(x, y, target) {
    super(x, y);
    this.target = target.copy();
    this.maxSpeed = 8;
    this.maxForce = 0.4;
    this.r = 5;
    this.lifetime = 300; // frames before weapon disappears
    this.age = 0;
    this.isActive = true;
  }

  update() {
    super.update();
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

  // Check collision with enemy
  hits(enemy) {
    let d = p5.Vector.dist(this.pos, enemy.pos);
    return d < (this.r + enemy.r);
  }

  show() {
    push();
    fill(255, 0, 0);
    stroke(255);
    strokeWeight(1);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}