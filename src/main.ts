import {vec3, vec4, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh';
import City from './City';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  showTerrainMap: true,
  simpleTerrain: true,
  showPopulationDensity: true
};

let square: Square;
let screenQuad: ScreenQuad;
let densityMap: ScreenQuad;
let city: City;
let highwayGeom: Mesh;
let roadGeom: Mesh;
let time: number = 0.0;

let currTerrain : boolean = true;
let currSimple : boolean = true;
let currDensity : boolean = true;

function loadScene() {
  square = new Square();
  square.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  densityMap = new ScreenQuad();
  densityMap.create();

  city = new City();
  let highways : mat4[] = city.drawHighways();
  let roads : mat4[] = city.drawNeighborhoods();

  let obj : string = readTextFile('../resources/road.obj');
  highwayGeom = new Mesh(obj, vec3.fromValues(0.0, 0.0, 0.0));
  highwayGeom.create();

  roadGeom = new Mesh(obj, vec3.fromValues(0.0, 0.0, 0.0));
  roadGeom.create();

  let bOffsetArr = [];
  let bRotArr = [];
  let bScaleArr = [];
  let bColorArr = [];
  for (var i = 0; i < highways.length; ++i) {
    let curr : mat4 = highways[i];

    let t : vec3 = vec3.create(); 
    mat4.getTranslation(t, curr);
    t[2] = 0.0;
    vec3.scale(t, t, 0.5);
  
    bOffsetArr.push(t[0]);
    bOffsetArr.push(t[1]);
    bOffsetArr.push(t[2]);

    let r : quat = quat.create();
    mat4.getRotation(r, curr);
    bRotArr.push(r[0]);
    bRotArr.push(r[1]);
    bRotArr.push(r[2]);
    bRotArr.push(r[3]);

    let s : vec3 = vec3.create();
    mat4.getScaling(s, curr);
    bScaleArr.push(s[0]);
    bScaleArr.push(s[1]);
    bScaleArr.push(s[2]);

    bColorArr.push(0.1);
    bColorArr.push(0.1);
    bColorArr.push(0.1);
    bColorArr.push(1.0); // Alpha
  }

  let sOffsetArr = [];
  let sRotArr = [];
  let sScaleArr = [];
  let sColorArr = [];
  for (let i = 0; i < roads.length; ++i) {
    let curr : mat4 = roads[i];

    let t : vec3 = vec3.create(); 
    mat4.getTranslation(t, curr);
    vec3.scale(t, t, 0.008);
  
    sOffsetArr.push(t[0]);
    sOffsetArr.push(t[1]);
    sOffsetArr.push(t[2]);

    let r : quat = quat.create();
    mat4.getRotation(r, curr);
    sRotArr.push(r[0]);
    sRotArr.push(r[1]);
    sRotArr.push(r[2]);
    sRotArr.push(r[3]);

    let s : vec3 = vec3.create();
    mat4.getScaling(s, curr);
    sScaleArr.push(s[0]);
    sScaleArr.push(s[1]);
    sScaleArr.push(s[2]);

    sColorArr.push(Math.random());
    sColorArr.push(Math.random());
    sColorArr.push(Math.random());
    sColorArr.push(1.0);
  }

  // Set up instanced rendering data arrays here.
  let bOffsets : Float32Array = new Float32Array(bOffsetArr);
  let bRots : Float32Array = new Float32Array(bRotArr);
  let bScales : Float32Array = new Float32Array(bScaleArr);
  let bColors : Float32Array = new Float32Array(bColorArr);
  highwayGeom.setInstanceVBOs(bOffsets, bRots, bScales, bColors);
  highwayGeom.setNumInstances(highways.length);

  let sOffsets : Float32Array = new Float32Array(sOffsetArr);
  let sRots : Float32Array = new Float32Array(sRotArr);
  let sScales : Float32Array = new Float32Array(sScaleArr);
  let sColors : Float32Array = new Float32Array(sColorArr);
  // roadGeom.setInstanceVBOs(sOffsets, sRots, sScales, sColors);
  // roadGeom.setNumInstances(roads.length);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'showTerrainMap');
  gui.add(controls, 'simpleTerrain');
  gui.add(controls, 'showPopulationDensity');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);

  // If we want to show both the terrain and density maps, turn on interpolative blending
  // otherwise, use depth sorting
  if (currTerrain && currDensity) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Interpolative blending
  }
  else {
    gl.enable(gl.DEPTH_TEST);
  }

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const density = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/density-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/density-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    // Immediately update scene when the user interacts with the GUI
    if (controls.showPopulationDensity != currDensity || controls.simpleTerrain != currSimple || controls.showTerrainMap != currTerrain) {
      currDensity = controls.showPopulationDensity;
      currSimple = controls.simpleTerrain;
      currTerrain = controls.showTerrainMap;

      // If both shaders are enabled, blend the outputs for an overlay effect
      if (currTerrain && currDensity) {
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Interpolative blending
      }
      else {
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
      }

      loadScene();
    }

    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // Turn background shaders on and off as appropriate
    renderer.clear();
    if (currTerrain) {
      renderer.render(camera, flat, [screenQuad], currSimple);
    }
    if (currDensity) {
      renderer.render(camera, density, [densityMap], currSimple);
    }

    renderer.render(camera, instancedShader, [highwayGeom], currSimple);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
