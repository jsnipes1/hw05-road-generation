import {vec2, vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
    position: vec2;
    orient: number;
    type: number;
    recDepth: number;
    stack: Turtle[];
    segmentLength: number = 0.05;
    worldOrients : number[] = [0, 90, 180, 270];

    // Pass position and orientation as optional parameters so we can
    // appropriately save state when necessary
    constructor(type: number, pos?: vec2, orient?: number) {
        if (pos == undefined) {
            this.position = vec2.fromValues(this.randomScreenPt(), this.randomScreenPt());
        }
        else {
            this.position = pos;
        }

        if (orient == undefined) {
            this.orient = 360.0 * this.randomScreenPt();
        }
        else {
            this.orient = orient;
        }

        // Type of road network: 0 -> branch, 1 -> raster
        this.type = type;

        this.recDepth = 0;
        this.stack = [];
    }

    // Get a random number on [-1, 1]
    randomScreenPt() : number {
        return 2.0 * Math.random() - 1.0;
    }

    // Move in direction of greatest population density
    branchingRoads() : mat4[] {
        // Just in case something goes *very* wrong
        if (this.type == 1) {
            this.rasterRoads();
        }

        // Each road will attempt to branch
        let branchThreshold : number = 0.6;
        let mArr : mat4[] = [];
        for (let i = -1; i <= 1; i += 0.5) {
            let tempOrient : number = this.orient + i * 30.0;

            let tempPos : vec2 = vec2.create();
            vec2.add(tempPos, vec2.clone(this.position), vec2.fromValues(this.segmentLength * Math.cos(tempOrient), this.segmentLength * Math.sin(tempOrient)));
            
            // Found a path to a higher density area -> branch
            let m : mat4 = mat4.create();
            let q : quat = quat.create();
            if (this.getPopulationDensity(tempPos) > branchThreshold && !this.isWater(tempPos)) {
                this.saveState();
                this.position = tempPos;
                this.orient = tempOrient;

                quat.fromEuler(q, 0.0, 0.0, tempOrient);
                mat4.fromRotationTranslation(m, q, vec3.fromValues(tempPos[0], tempPos[1], 0.0));
            }
            // Not high enough density -> Done with this turtle; pop stack
            else {
                if (this.stack.length > 0) {
                    this.restoreState();
                }
                let q : quat = quat.create();
                quat.fromEuler(q, 0.0, 0.0, this.orient.valueOf());
                mat4.fromRotationTranslation(m, q, vec3.fromValues(this.position[0].valueOf(), this.position[1].valueOf(), 0.0));
            }
            mArr.push(m);
        }

        return mArr;
    }

    // Draw raster style roads
    rasterRoads() : mat4 {
        // Again, just to be safe
        if (this.type == 0) {
            this.branchingRoads();
        }

        // Compare orient to the world orients and set to closest
        let orientSign : number = Math.sign(this.orient);
        let orientIdx : number = Math.floor(Math.abs(this.orient) / 45.0);
        this.orient = this.worldOrients[orientIdx] * orientSign;

        // Move by set "parallel" distance, move to next orient in array, move by set "normal" distance
        let distX : number = 0.5;
        let distY : number = 0.2;
        // Move to previous orient, move parallel distance, move to previous orient, move normal distance
            // This moves in a snake-like pattern to draw a grid (where to do this?)
        // Oriented in the X direction
        if (orientIdx % 2 == 0) {
            this.translateTurtle(distX, distY);
        }
        // Y direction
        else {
            this.translateTurtle(distY, distX);
        }
        let m : mat4 = mat4.create();
        return m;
    }

    saveState() : void {
        this.recDepth++;
        this.stack.push(new Turtle(this.type.valueOf(), vec2.clone(this.position), this.orient.valueOf()));
    }

    restoreState() : void {
        this.recDepth--;
        let temp : Turtle = this.stack.pop();
        this.position = temp.position;
        this.orient = temp.orient;
        this.type = temp.type;
    }

    translateTurtle(xScale: number, yScale: number) : void {
        this.position[0] += xScale * Math.cos(this.orient);
        this.position[1] += yScale * Math.sin(this.orient);
    }

    // Adapted from density-frag shader to access population density info on CPU
    hash2D(x: vec2) : number {
        let i : number = vec2.dot(x, vec2.fromValues(123.4031, 46.5244876));
        let j : number = Math.sin(i * 7.13) * 268573.103291;
        return j - Math.floor(j);
    }
    
    fade(t: number) : number {
      return 6.0 * Math.pow(t, 5.0) - 15.0 * Math.pow(t, 4.0) + 10.0 * Math.pow(t, 3.0);
    }

    vecFract(a: vec2) : vec2 {
        return vec2.fromValues(a[0] - Math.floor(a[0]), a[1] - Math.floor(a[1]));
    }

    mix(a: number, b: number, t: number) : number {
        return a * (1.0 - t) + b * t;
    }
    
    // Population density map computed using 2D Perlin noise
      // Source: https://flafla2.github.io/2014/08/09/perlinnoise.html
    getPopulationDensity(q: vec2) : number {
      let grads : vec2[] = [vec2.fromValues(1, 1), vec2.fromValues(-1, 1), vec2.fromValues(1, -1), vec2.fromValues(-1, -1)];
      let p : vec2 = vec2.create();
      vec2.scale(p, q, 5.0);
      let inCell : vec2 = this.vecFract(p);
    
      let x0y0 : vec2 = vec2.create();
      vec2.floor(x0y0, vec2.clone(p));
      let x1y0 : vec2 = vec2.create(); 
      vec2.add(x1y0, vec2.clone(x0y0), vec2.fromValues(1.0, 0.0));
      let x0y1 : vec2 = vec2.create();
      vec2.add(x0y1, vec2.clone(x0y0), vec2.fromValues(0.0, 1.0));
      let x1y1 : vec2 = vec2.create(); 
      vec2.add(x1y1, vec2.clone(x0y0), vec2.fromValues(1.0, 1.0));
    
      let sw2p : vec2 = vec2.create();
      vec2.subtract(sw2p, vec2.clone(p), vec2.clone(x0y0));
      let se2p : vec2 = vec2.create();
      vec2.subtract(se2p, vec2.clone(p), vec2.clone(x1y0));
      let nw2p : vec2 = vec2.create();
      vec2.subtract(nw2p, vec2.clone(p), vec2.clone(x0y1));
      let ne2p : vec2 = vec2.create();
      vec2.subtract(ne2p, vec2.clone(p), vec2.clone(x1y1));
    
      let grad00 : vec2 = grads[Math.floor(this.hash2D(x0y0) * 4.0)];
      let grad10 : vec2 = grads[Math.floor(this.hash2D(x1y0) * 4.0)];
      let grad01 : vec2 = grads[Math.floor(this.hash2D(x0y1) * 4.0)];
      let grad11 : vec2 = grads[Math.floor(this.hash2D(x1y1) * 4.0)];
    
      let infSW : number = vec2.dot(sw2p, grad00);
      let infSE : number = vec2.dot(se2p, grad10);
      let infNW : number = vec2.dot(nw2p, grad01);
      let infNE : number = vec2.dot(ne2p, grad11);
    
      let b : number = this.mix(infSW, infSE, this.fade(inCell[0]));
      let t : number = this.mix(infNW, infNE, this.fade(inCell[0]));
      return this.mix(b, t, this.fade(inCell[1]));
    }

    // 2D noise
    noise(p: vec2) : number {
        let corner : vec2 = vec2.create();
        vec2.floor(corner, p);
        let inCell : vec2 = this.vecFract(p);

        let brCorner : vec2 = vec2.create();
        vec2.add(brCorner, vec2.clone(corner), vec2.fromValues(1.0, 0.0));

        let bL : number = this.hash2D(corner);
        let bR : number = this.hash2D(brCorner);
        let bottom : number = this.mix(bL, bR, inCell[0]);

        let tCorner : vec2 = vec2.create();
        vec2.add(tCorner, vec2.clone(corner), vec2.fromValues(0.0, 1.0));
        let trCorner : vec2 = vec2.create();
        vec2.add(trCorner, tCorner, vec2.fromValues(1.0, 0.0));

        let tL : number = this.hash2D(tCorner);
        let tR : number = this.hash2D(trCorner);
        let top : number = this.mix(tL, tR, inCell[0]);

        return this.mix(bottom, top, inCell[0]);
    }

    fbm(q: vec2) : number {
        let acc : number = 0.0;
        let freqScale : number = 2.0;
        let invScale : number = 1.0 / freqScale;
        let freq : number = 1.0;
        let amp : number = 1.0;

        for (let i = 0; i < 3; ++i) {
            freq *= freqScale;
            amp *= invScale;
            let qScale : vec2 = vec2.create();
            vec2.scale(qScale, q, freq);
            acc += this.noise(qScale) * amp;
        }
        return acc;
    }

    // Terrain height map computed using multi-octave 2D FBM
    getTerrain(q: vec2) : number {
        let fbm1 : vec2 = vec2.create();
        vec2.subtract(fbm1, vec2.clone(q), vec2.fromValues(0.2, 0.2));

        let fbm2 : vec2 = vec2.create();
        vec2.add(fbm2, vec2.clone(q), vec2.fromValues(25.2, -22.8));

        let p : vec2 = vec2.fromValues(this.fbm(fbm1), this.fbm(fbm2));
        return Math.min(Math.max(2.0 * this.fbm(p) - 0.3, 0.0), 1.0);
    }

    // Check if terrain ahead is water or land
    isWater(q: vec2) : boolean {
        return (this.getTerrain(q) < 0.57);
    }
}
