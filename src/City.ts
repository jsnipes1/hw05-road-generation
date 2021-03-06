import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Turtle from './Turtle';

export default class City {
    currState: Turtle;
    roads: Road[];
    intersections: Intersection[];
    nHwy : number;

    constructor(nHwy : number) {
        this.currState = new Turtle();

        this.roads = [];
        this.intersections = [];

        this.nHwy = nHwy;
    }

    drawHighways() : mat4[] {
        let transfs : mat4[] = [];
        let start : vec2 = this.currState.position;
        this.intersections.push(new Intersection(start));

        for (let i = 0; i < this.nHwy; ++i) {
            this.currState = new Turtle();
            let branch : mat4[] = this.currState.branchingRoads();
            for (let j = 0; j < branch.length; ++j) {
                transfs.push(branch[j]);

                let transl : vec3 = vec3.create();
                mat4.getTranslation(transl, branch[j]); 
                let r : quat = quat.create();
                mat4.getRotation(r, branch[j]);
                let t : number = quat.getAxisAngle(vec3.create(), r);
                let end : vec2 = vec2.fromValues(transl[0] * Math.cos(t), transl[1] * Math.sin(t));

                this.roads.push(new Road(start, end));
                this.intersections.push(new Intersection(end));
            }
        }

        return transfs;
    }

    drawNeighborhoods() : mat4[] {
        let transfs : mat4[] = [];

        for (let i = 0; i < this.roads.length; ++i) {
            let n : vec2 = this.roads[i].inPlaneNormal();
            let theta = Math.atan2(n[1], n[0]);
            let blockDrawer : Turtle = new Turtle(this.roads[i].start, theta);
            let block : mat4[] = blockDrawer.rasterRoads();
            for (let j = 0; j < block.length; ++j) {
                transfs.push(block[j]);
            }
        }

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
            this.start = vec2.create();
            vec2.copy(this.start, start);
        }

        if (end == undefined) {
            this.end = vec2.fromValues(0, 0);
        }
        else {
            this.end = vec2.create();
            vec2.copy(this.end, end);
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
        vec3.normalize(xProd, xProd);
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
            this.screenPos = vec2.create();
            vec2.copy(this.screenPos, pos);
        }
    }
}