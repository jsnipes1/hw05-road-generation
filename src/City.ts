import {vec2, vec3, mat4} from 'gl-matrix';
import Turtle from './Turtle';

export default class City {
    currState: Turtle;
    depthLimit: number;
    drawRules: Map<number, any>;
    roads: Road[];
    intersections: Intersection[];

    constructor(lim: number) {
        this.currState = new Turtle(0);
        this.depthLimit = lim;

        this.drawRules = new Map();
        this.drawRules.set(0, this.currState.branchingRoads.bind(this.currState));
        this.drawRules.set(1, this.currState.rasterRoads.bind(this.currState));

        this.roads = [];
        this.intersections = [];
    }

    drawHighways() : mat4[] {
        let transfs : mat4[] = [];
        // Can we just hardcode how many times we want the roads to branch?
        let start : vec2 = this.currState.position;
        this.intersections.push(new Intersection(start));

        let branch : mat4[] = this.currState.branchingRoads();
        for (let j = 0; j < branch.length; ++j) {
            transfs.push(branch[j]);
            let transl : vec3 = vec3.create();
            mat4.getTranslation(transl, branch[j]); 
            let end : vec2 = vec2.fromValues(transl[0], transl[1]);
            this.roads.push(new Road(start, end));
        }

        return transfs;
    }

    drawNeighborhoods() : mat4[] {
        let transfs : mat4[] = [];

        return transfs;
    }
}

class Road {
    start: vec2;
    end: vec2;
    roadVec: vec2; // Can calculate orientation as Math.atan2(roadVec[1], roadVec[0])
    outOfScreen: vec3 = vec3.fromValues(0, 0, 1);

    constructor(start?: vec2, end?: vec2) {
        if (start == undefined) {
            this.start = vec2.fromValues(0, 0);
        }
        else {
            this.start = start;
        }

        if (end == undefined) {
            this.end = vec2.fromValues(0, 0);
        }
        else {
            this.end = end;
        }

        this.roadVec = vec2.create();
        vec2.subtract(this.roadVec, vec2.clone(this.end), vec2.clone(this.start));
    }

    // Length of the road segment
    length() : number {
        return vec2.length(this.roadVec);
    }

    // Vector in the screen plane that is normal to the road; negate for other direction
    inPlaneNormal() : vec2 {
        let roadVec3 : vec3 = vec3.fromValues(this.roadVec[0], this.roadVec[1], 0.0);
        let xProd : vec3 = vec3.create();
        vec3.cross(xProd, this.outOfScreen, roadVec3);
        return vec2.fromValues(xProd[0], xProd[1]);
    }
}

class Intersection {
    screenPos: vec2;

    constructor(pos?: vec2) {
        if (pos == undefined) {
            this.screenPos = vec2.fromValues(0, 0);
        }
        else {
            this.screenPos = pos;
        }
    }
}