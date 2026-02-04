class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 16;
    this.rayonZoneDeFreinage = 100;

    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = -Math.PI / 2;
    this.displaceRange = 0.3;

    // pour avoid obstacles
    this.perceptionRadius = 100; // Distance pour détecter les obstacles
  }

  // Permet de rester dans les limites d'une zone rectangulaire.
  boundaries(bx, by, bw, bh, d = 25) {
    let vitesseDesiree = null;

    const xBordGauche = bx + d;
    const xBordDroite = bx + bw - d;
    const yBordHaut = by + d;
    const yBordBas = by + bh - d;

    // si le véhicule est trop à gauche ou trop à droite
    if (this.pos.x < xBordGauche) {
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > xBordDroite) {
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < yBordHaut) {
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > yBordBas) {
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }

    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      const force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);
      return force;
    }

    if (Vehicle.debug) {
      // dessin du cadre de la zone
      push();
      noFill();
      stroke("white");
      strokeWeight(2);
      rect(bx, by, bw, bh);

      // et du rectangle intérieur avec une bordure rouge de d pixels
      stroke("red");
      rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);
      pop();
    }

    // si on est pas près du bord, on renvoie un vecteur nul
    return createVector(0, 0);
  }

  // Avoid obstacles (bombs)
  // Avoid obstacles (bombs)
  avoid(obstacles) {
    let avoidForce = createVector(0, 0);

    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);

      // Si l'obstacle est dans le rayon de perception
      if (d < this.perceptionRadius + obstacle.r) {
        avoidForce.add(this.evade(obstacle));
      }
    }

    return avoidForce;
  }

  wander() {
    // point devant le véhicule, centre du cercle
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    push();
    if (Vehicle.debug) {
      // on dessine le cercle en rouge
      fill("red");
      noStroke();
      circle(pointDevant.x, pointDevant.y, 8);

      // on dessine le cercle autour
      noFill();
      stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      strokeWeight(2);
      stroke(255, 255, 255, 80);
      drawingContext.setLineDash([5, 15]);
      line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);
    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(0, 0);
    pointSurLeCercle.x = this.wanderRadius * cos(theta);
    pointSurLeCercle.y = this.wanderRadius * sin(theta);

    pointSurLeCercle.add(pointDevant);

    if (Vehicle.debug) {
      fill("green");
      noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 16);

      stroke("yellow");
      strokeWeight(1);
      drawingContext.setLineDash([]);
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
    }

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    force.setMag(this.maxForce);

    pop();

    return force;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target, d = 0) {
    return this.seek(target, true, d);
  }

  flee(target) {
    let desired = p5.Vector.sub(this.pos, target);
    desired.setMag(this.maxSpeed);
    let force = p5.Vector.sub(desired, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  seek(target, arrival = false, d = 0) {
    let valueDesiredSpeed = this.maxSpeed;

    if (arrival) {
      if (Vehicle.debug) {
        push();
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, this.rayonZoneDeFreinage);
        pop();
      }

      let distance = p5.Vector.dist(this.pos, target);

      if (distance < this.rayonZoneDeFreinage) {
        valueDesiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    let desiredSpeed = p5.Vector.sub(target, this.pos);
    desiredSpeed.setMag(valueDesiredSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.mag() > 0.2)
      rotate(this.vel.heading());

    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
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