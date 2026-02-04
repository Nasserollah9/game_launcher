class PlayerRocket extends Vehicle {
    constructor(x, y, enemies, boss) {
        super(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.setMag(random(2, 4));
        this.acc = createVector(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 6;
        this.r = 6;
        this.enemies = enemies;
        this.boss = boss;
        this.isActive = true;

        // Flocking weights
        this.alignWeight = 1.0;
        this.cohesionWeight = 1.0;
        this.separationWeight = 2.0;
        this.seekWeight = 2.0;

        // Perception
        this.perceptionRadius = 50;

        // Life
        this.lifespan = 400;
    }

    flock(rockets) {
        let alignment = this.align(rockets);
        let cohesion = this.cohesion(rockets);
        let separation = this.separation(rockets);

        alignment.mult(this.alignWeight);
        cohesion.mult(this.cohesionWeight);
        separation.mult(this.separationWeight);

        this.applyForce(alignment);
        this.applyForce(cohesion);
        this.applyForce(separation);
    }

    // Find nearest enemy and seek it
    findAndSeekTarget() {
        let closest = null;
        let closestD = Infinity;

        // Check enemies
        if (this.enemies) {
            for (let enemy of this.enemies) {
                let d = this.pos.dist(enemy.pos);
                if (d < closestD) {
                    closestD = d;
                    closest = enemy;
                }
            }
        }

        // Check boss
        if (this.boss && this.boss.isActive) {
            let d = this.pos.dist(this.boss.pos);
            if (d < closestD) {
                closestD = d;
                closest = this.boss;
            }
        }

        // Seek if target found
        if (closest) {
            let seekForce = this.seek(closest.pos);
            seekForce.mult(this.seekWeight);
            this.applyForce(seekForce);
        }
    }

    align(rockets) {
        let perceptionRadius = this.perceptionRadius;
        let steering = createVector();
        let total = 0;

        for (let other of rockets) {
            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.vel);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(rockets) {
        let perceptionRadius = this.perceptionRadius;
        let steering = createVector();
        let total = 0;

        for (let other of rockets) {
            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.div(d * d);
                steering.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(rockets) {
        let perceptionRadius = this.perceptionRadius * 2;
        let steering = createVector();
        let total = 0;

        for (let other of rockets) {
            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.pos);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.sub(this.pos);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    update() {
        super.update();
        this.lifespan--;
        if (this.lifespan <= 0) this.isActive = false;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Draw Rocket (Blue/Green for player)
        noStroke();

        // Flame
        fill(0, 255, 255, 100 + random(155));
        triangle(-10, -3, -10, 3, -15 - random(5), 0);

        // Body
        fill(200);
        rectMode(CENTER);
        rect(0, 0, 16, 6, 2);

        // Head
        fill(0, 100, 255);
        triangle(8, -3, 8, 3, 14, 0);

        pop();
    }
}
