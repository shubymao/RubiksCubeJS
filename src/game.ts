import Cube from './cube';
import Stats from 'stats.js';
import Control from './control';
import {
  Vector3,
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Object3D,
  AmbientLight,
  DirectionalLight,
} from 'three';
const still = 0;
export default class Game {
  //Element to render the game
  public control: Control;
  public n: number;
  private frameId = -1;
  private renderer: WebGLRenderer;
  public camera: PerspectiveCamera = new PerspectiveCamera(10, 1, 0.1, 10000);
  public width: number = 500;
  public height: number = 500;
  public cube: Cube;
  public scene: Scene;
  public canvas!: HTMLCanvasElement; //will be initalized in initcanvas
  public animations: (Cube | Control)[] = []; //element list to update
  //A map for remembering the key and the coresponding commands
  private arrowkey = new Map();
  private key = new Map();
  //State for checking if move is ongoing
  public state: number = still;
  //stat.js componenet
  public fpsMonitor = new Stats();
  public fpsdom: HTMLElement = this.fpsMonitor.dom;
  //constructor to initalize component
  public constructor(n: number, width: number) {
    this.n = n;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.cube = new Cube(this, this.n);
    this.control = new Control(this);
    this.initcanvas(width);
    this.initcube();
    this.createLight();
    this.initkeys();
    this.initcontrol();
    this.initstat();
    this.start();
  }
  private start() {
    requestAnimationFrame(this.animate);
  }
  public stop() {
    cancelAnimationFrame(this.frameId);
  }
  private animate() {
    this.fpsMonitor.begin();
    for (let animation of this.animations) animation.update();
    this.renderScene();
    this.fpsMonitor.end();
    this.frameId = window.requestAnimationFrame(this.animate);
  }
  private keypress = (ev: KeyboardEvent) => {
    ev.preventDefault();
    if (this.arrowkey.has(ev.code)) {
      let op = this.arrowkey.get(ev.code);
      this.cube.rotate(op[0], op[1]);
    } else if (this.key.has(ev.code)) {
      let i = this.key.get(ev.code);
      let ax = i < 6 ? 0 : i < 12 ? 1 : 2;
      this.cube.turn(ax, i % 6, !ev.shiftKey);
    } else if (ev.code === 'Space') this.cube.scramble_cube(this.n * this.n + 20);
  };
  private initcanvas(width: number) {
    //make function into variable to pass down
    this.animate = this.animate.bind(this);
    this.animations = [];
    this.width = width < 500 ? 300 : width < 900 ? 500 : 700;
    this.height = this.width;
    //initalize renderer and scene
    this.renderer.setClearColor('#ffffff');
    this.renderer.setSize(this.width, this.height);
    this.frameId = -1;
    //change camera setup
    this.camera.position.set(3, 3, 3);
    this.camera.fov = 20;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(new Vector3(0, 0, 0));
    //canvas
    let canvas = this.renderer.domElement;
    this.canvas = canvas;
    canvas.tabIndex = 1;
  }
  private initcontrol() {
    this.canvas.addEventListener('keydown', this.keypress);
    this.canvas.addEventListener('mousedown', this.control.start);
    this.canvas.addEventListener('touchstart', this.control.start);
  }
  private createLight() {
    let lights = {
      holder: new Object3D(),
      ambient: new AmbientLight(0xffffff, 0.75),
      front: new DirectionalLight(0xffffff, 0.38),
      back: new DirectionalLight(0xffffff, 0.2),
    };
    lights.front.position.set(1, 3, 3);
    lights.back.position.set(-1, -3, -3);
    lights.holder.add(lights.ambient);
    lights.holder.add(lights.front);
    lights.holder.add(lights.back);
    this.scene.add(lights.holder);
  }
  private initkeys() {
    let frow = 'QWERTY';
    let srow = 'ASDFGH';
    let trow = 'ZXCVBN';
    this.arrowkey.set('ArrowUp', [0, true]);
    this.arrowkey.set('ArrowDown', [0, false]);
    this.arrowkey.set('ArrowLeft', [1, true]);
    this.arrowkey.set('ArrowRight', [1, false]);
    for (let i = 0; i < 6; i++) this.key.set(`Key${frow.charAt(i)}`, i);
    for (let i = 0; i < 6; i++) this.key.set(`Key${srow.charAt(i)}`, 6 + i);
    for (let i = 0; i < 6; i++) this.key.set(`Key${trow.charAt(i)}`, 12 + i);
  }
  private initstat() {
    this.fpsMonitor.showPanel(0);
    this.fpsdom.style.position = 'absolute';
  }
  private initcube() {
    this.scene.add(this.cube.getcube());
    this.animations.push(this.cube);
  }
  private renderScene() {
    this.renderer.render(this.scene, this.camera);
  }
  public updateoffset(x: number, y: number) {
    this.control.updateoffset(x, y);
  }
  public reset(n: number) {
    //Initialize First Cube
    this.n = n;
    // this.stop();
    this.cube.clean();
    this.scene.remove(this.cube.getcube());
    this.cube = new Cube(this, n);
    this.scene.add(this.cube.getcube());
    this.state = still;
    this.animations.push(this.cube);
    this.control.reset();
    // this.start();
  }
}
