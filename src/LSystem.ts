import {vec3, mat4} from 'gl-matrix';
import Turtle from './Turtle';

export default class LSystem {
    currState: Turtle;
    depthLimit: number;
    drawRules: Map<number, any>;
    // expRules: Map<number, any>; // Store expansion rules?

    constructor(lim: number, angle: number, roadType: number) {
        this.currState = new Turtle(roadType);
        this.depthLimit = lim;

        this.drawRules = new Map();
        this.drawRules.set(0, this.currState.branchingRoads.bind(this.currState));
        this.drawRules.set(1, this.currState.rasterRoads.bind(this.currState));
        // this.drawRules.set('-', this.currState.rotateNeg.bind(this.currState));
        // this.drawRules.set('[', this.currState.saveState.bind(this.currState));
        // this.drawRules.set(']', this.currState.restoreState.bind(this.currState));
    }

    // Appropriately expand the grammar
    // expand(depth : number, expanded : string) {
    //     // Stop after a certain recursion depth is reached and set the member variable
    //     if (depth > this.depthLimit) {
    //         this.grammar = expanded;
    //         return;
    //     }

    //     // Create a new string to store the expansion of the current input
    //     let newStr : string = '';

    //     // Loop over all characters in the input string and add them to the new one
    //     for (var i = 0; i < expanded.length; ++i) {
    //         let currChar : string = expanded.charAt(i);
    //         let rand : number = Math.random();
    //         switch (currChar) {
    //             case 'F': {
    //                 if (rand < 0.4) {
    //                     newStr = newStr.concat('FX[X[FX+X]+FX]X');
    //                 }
    //                 else {
    //                     newStr = newStr.concat('X[FX[+XF]]X');
    //                 }
    //                 break;
    //             }
    //             case '+': {
    //                 if (rand < 0.33) {
    //                     newStr = newStr.concat('[X+F[-FXX]]');
    //                 }
    //                 else if (rand < 0.67) {
    //                     newStr = newStr.concat('XFX');
    //                 }
    //                 else {
    //                     newStr = newStr.concat('[XFX[+FFX]XF]+FX');
    //                 }
    //                 break;
    //             }
    //             default: {
    //                 break;
    //             }
    //         }
    //     }

    //     // Recursively expand the grammar
    //     this.expand(depth + 1, newStr);
    // }

    // Get the current state, find the corresponding drawing
    // rule, and call the associated function
    drawBranch() : mat4[] {
        let transfs : mat4[] = [];
        // for (var i = 0; i < this.grammar.length; ++i) {
        //     let curr : string = this.grammar.charAt(i);
        //     let func = this.drawRules.get(curr);
        //     if (func) {
        //         let m : mat4 = func();
        //         if (curr != 'F') {
        //             continue;
        //         }
        //         transfs.push(m);
        //     }
        // }

        return transfs;
    }

    drawLeaf() : mat4[] {
        let transfs : mat4[] = [];
        // for (var i = 0; i < this.grammar.length; ++i) {
        //     let curr : string = this.grammar.charAt(i);
        //     let func = this.drawRules.get(curr);
        //     if (func) {
        //         if (curr != 'X') {
        //             continue;
        //         }
        //         let m : mat4 = func();
        //         transfs.push(m);
        //     }
        // }
        return transfs;
    }
}