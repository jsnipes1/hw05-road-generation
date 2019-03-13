import {vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
    position: vec3;
    orient: vec3;
    worldUp: vec3;
    recDepth: number;
    theta: number;
    stack: Turtle[];

    constructor(pos: vec3, ori: vec3, theta: number) {
        this.position = pos;
        this.orient = ori;
        this.theta = theta;
        this.worldUp = vec3.fromValues(0, 1, 0);
        this.recDepth = 0;
        this.stack = [];
    }

    // Drawing functions, including probabilistic functionality
    moveForward() : mat4 {
        let s : number = 2.0 / (this.recDepth + 1.0);
        let m : mat4 = mat4.create();
        let q : quat = quat.create();
        // quat.rotationTo(q, this.orient, this.worldUp);

        let o : vec3 = vec3.create();
        vec3.scale(o, this.orient, 0.5);
        vec3.add(this.position, this.position, o);

        mat4.fromRotationTranslationScale(m, q, vec3.clone(this.position), vec3.fromValues(0.2, s, 0.2));
        return m;
    }

    drawFlower() : mat4 {
        let s : number = 1.0 / (this.recDepth + 2.0);
        let m : mat4 = mat4.create();
        let q : quat = quat.create();
        // quat.rotationTo(q, this.orient, this.worldUp);
        mat4.fromRotationTranslationScale(m, q, vec3.clone(this.position), vec3.fromValues(1, s, 1));
        return m;
    }

    rotatePos() : mat4 {
        let rand : number = Math.random();
        let angle : number = Math.random() * this.theta * 0.01745329251;
        let r : mat4 = mat4.create();
        let o : vec3 = vec3.create();
        vec3.add(o, vec3.clone(this.orient), vec3.fromValues(0, 0, 0));
        if (rand < 0.33) {
            vec3.rotateX(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromXRotation(r, angle);
            return r;
        }
        else if (rand < 0.67) {
            vec3.rotateY(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromYRotation(r, angle);
            return r;
        }
        else {
            vec3.rotateZ(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromZRotation(r, angle);
            return r;
        }
    }

    rotateNeg() : mat4 {
        let rand : number = Math.random();
        let angle : number = -Math.random() * this.theta * 0.01745329251;
        let r : mat4 = mat4.create();
        let o : vec3 = vec3.create();
        vec3.add(o, vec3.clone(this.orient), vec3.fromValues(0, 0, 0));
        mat4.identity(r);
        if (rand < 0.33) {
            vec3.rotateX(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromXRotation(r, angle);
            return r;
        }
        else if (rand < 0.67) {
            vec3.rotateY(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromYRotation(r, angle);
            return r;
        }
        else {
            vec3.rotateZ(this.orient, vec3.clone(this.position), o, angle);
            mat4.fromZRotation(r, angle);
            return r;
        }
    }

    saveState() : mat4 {
        this.recDepth++;
        this.stack.push(new Turtle(vec3.clone(this.position),
                                   vec3.clone(this.orient),
                                   this.theta.valueOf()));
        let i : mat4 = mat4.create();
        return i;
    }

    restoreState() : mat4 {
        this.recDepth--;
        let temp : Turtle = this.stack.pop();
        this.position = temp.position;
        this.orient = temp.orient;
        this.theta = temp.theta;
        let i : mat4 = mat4.create();
        return i;
    }

}