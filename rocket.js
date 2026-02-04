class Rocket extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.setMag(random(2, 4));
        this.acc = createVector(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 5;
        this.r = 6;

        // Flocking weights
        this.alignWeight = 1.5;
        this.cohesionWeight = 1;
        this.separationWeight = 2;
        this.boundariesWeight = 10;

        // Perception for flocking
        this.perceptionRadius = 50;

        // Life of the rocket
        this.lifespan = 300; // 5 seconds
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
                diff.div(d * d); // Weight by distance squared
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
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Draw Rocket
        noStroke();

        // Flame
        fill(255, 100 + random(155), 0);
        triangle(-10, -3, -10, 3, -15 - random(5), 0);

        // Body
        fill(200);
        rectMode(CENTER);
        rect(0, 0, 20, 8, 2);

        // Head
        fill(255, 0, 0);
        triangle(10, -4, 10, 4, 18, 0);

        pop();

        // Debug
        if (Vehicle.debug) {
            noFill();
            stroke(255, 0, 0, 50);
            circle(this.pos.x, this.pos.y, this.perceptionRadius * 2);
        }
    }
}
