import {vec2, vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
    position: vec2;
    orient: number;
    type: number;
    recDepth: number;
    stack: Turtle[];
    worldVecs : vec2[] = [vec2.fromValues(1, 0), vec2.fromValues(0, 1), 
                          vec2.fromValues(-1, 0), vec2.fromValues(0, -1)];

    // Pass position and orientation as optional parameters so we can
    // appropriately save state 
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

    // Draw branch style roads
    branchingRoads() : mat4 {
        // Just in case something goes *very* wrong
        if (this.type == 1) {
            this.rasterRoads();
        }

        // Read surrounding 8(?) pixels from population density map
        // Calculate gradient between each wrt current pixel
            // If 2+ pixels have similar gradient values, branch
            // Push state to stack and recursively call this function(?)
        // Move in direction of maximum gradient value
        // Update position and orient fields (not sure how to just move one pixel?)

        let m : mat4 = mat4.create();
        return m;
    }

    // Draw raster style roads
    rasterRoads() : mat4 {
        // Again, just to be safe
        if (this.type == 0) {
            this.branchingRoads();
        }

        // Compare orient to (+/- 1, 0) and (0, +/- 1), the world vectors
        // Set to the closest one based on current orientation value (if orient < 0, y value of global *= -1)
        // 

        let m : mat4 = mat4.create();
        return m;
    }

    rotatePos() : mat4 {
        // let rand : number = Math.random();
        // let angle : number = Math.random() * this.theta * 0.01745329251;
        let r : mat4 = mat4.create();
        // let o : vec3 = vec3.create();
        // vec3.add(o, vec3.clone(this.orient), vec3.fromValues(0, 0, 0));
        // if (rand < 0.33) {
        //     vec3.rotateX(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromXRotation(r, angle);
        //     return r;
        // }
        // else if (rand < 0.67) {
        //     vec3.rotateY(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromYRotation(r, angle);
        //     return r;
        // }
        // else {
        //     vec3.rotateZ(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromZRotation(r, angle);
        //     return r;
        // }
        return r;
    }

    rotateNeg() : mat4 {
        // let rand : number = Math.random();
        // let angle : number = -Math.random() * this.theta * 0.01745329251;
        let r : mat4 = mat4.create();
        // let o : vec3 = vec3.create();
        // vec3.add(o, vec3.clone(this.orient), vec3.fromValues(0, 0, 0));
        // mat4.identity(r);
        // if (rand < 0.33) {
        //     vec3.rotateX(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromXRotation(r, angle);
        //     return r;
        // }
        // else if (rand < 0.67) {
        //     vec3.rotateY(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromYRotation(r, angle);
        //     return r;
        // }
        // else {
        //     vec3.rotateZ(this.orient, vec3.clone(this.position), o, angle);
        //     mat4.fromZRotation(r, angle);
        //     return r;
        // }
        return r;
    }

    saveState() : mat4 {
        this.recDepth++;
        this.stack.push(new Turtle(this.type.valueOf()));
        let i : mat4 = mat4.create();
        return i;
    }

    restoreState() : mat4 {
        this.recDepth--;
        let temp : Turtle = this.stack.pop();
        this.position = temp.position;
        this.orient = temp.orient;
        this.type = temp.type;
        let i : mat4 = mat4.create();
        return i;
    }

}