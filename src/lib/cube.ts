import * as p from 'three';
import Block from './block';
import { Vector3 } from 'three';
import Game from './game';
const xaxis = new Vector3(1, 0, 0).normalize();
const yaxis = new Vector3(0, 1, 0).normalize();
const zaxis = new Vector3(0, 0, 1).normalize();
export default class Cube {
  //basic access to class
  private game: Game;
  private n: number;
  //main cube object
  public object = new p.Object3D();
  private group = new p.Object3D();
  private cur = 0;
  //block array to keep orientation of the cube
  public blocks: Block[][][];
  //states to keep track of current status
  private moves = 0;
  private scramble = false;
  private turning = false;
  private lastmove = this.getrandommove();
  private raxis: number = 0;
  private clockwise: boolean = false;
  //Speed elements
  private count: number = 48;
  private speed: number = Math.PI / this.count;
  private sspeed: number = this.speed * 2; //scramble speed is double normal speed
  public constructor(game: Game, n: number) {
    this.game = game;
    this.n = n;
    this.blocks = new Array(this.n);
    this.initcube();
    this.initspeed();
  }
  private initcube() {
    let n = this.n;
    let offset = n * 0.5 - 0.5;
    let size = 1 / n;
    for (let i = 0; i < n; i++) {
      this.blocks[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        this.blocks[i][j] = new Array(n);
        for (let k = 0; k < n; k++) {
          let block = new Block(i, j, k, n, size);
          let b = block.getblock();
          this.object.add(b);
          b.position.x = (i - offset) * size;
          b.position.y = (j - offset) * size;
          b.position.z = (k - offset) * size;
          this.blocks[i][j][k] = block;
        }
      }
    }
  }
  private initspeed() {
    this.count = [200, 80, 72, 60, 48, 40][this.n - 1];
    this.speed = Math.PI / this.count;
    this.sspeed = this.speed * 2;
  }
  public getcube() {
    return this.object;
  }
  public update() {
    if (!this.turning) return;
    this.animate(this.raxis);
    this.cur += 1;
    if (this.scramble) this.cur += 1;
    if (this.cur === this.count / 2) {
      this.finalize_animate();
      if (this.scramble) {
        if (this.moves === 0) this.scramble = false;
        else {
          this.moves--;
          let next = this.getrandommove();
          this.lastmove[2] = !this.lastmove[2];
          while (next === this.lastmove) {
            next = this.getrandommove();
          }
          this.turn(next[0], next[1], next[2]);
        }
      }
    }
  }

  private animate(axis: number) {
    let speed = this.scramble ? this.sspeed : this.speed;
    switch (axis) {
      case 0:
        this.group.rotateOnAxis(xaxis, this.clockwise ? -1 * speed : speed);
        break;
      case 1:
        this.group.rotateOnAxis(yaxis, this.clockwise ? -1 * speed : speed);
        break;
      case 2:
        this.group.rotateOnAxis(zaxis, this.clockwise ? -1 * speed : speed);
        break;
      default:
        break;
    }
  }
  private finalize_animate() {
    let blocks = [];
    for (let b of this.group.children) {
      blocks.push(b);
    }
    this.group.updateMatrix();
    let matrix = this.group.matrix.clone();
    this.object.remove(this.group);
    for (let block of blocks) {
      this.object.add(block);
      block.applyMatrix(matrix);
    }
    this.turning = false;
    this.game.state = 0;
  }
  public rotate(axis: number, clockwise: boolean) {
    if (this.turning || this.game.state !== 0) return;
    this.game.state = 1;
    this.group = new p.Object3D();
    this.object.add(this.group);
    this.raxis = axis;
    this.turning = true;
    this.cur = 0;
    this.clockwise = clockwise;
    this.finalize_rotate(axis, clockwise);
  }
  public finalize_rotate(axis: number, clockwise: boolean) {
    let n = this.n;
    for (let i = 0; i < n; i++) {
      let face = this.getface(axis, i);
      if (this.turning) for (let blocks of face) for (let b of blocks) this.group.add(b.getblock());
      this.putface(axis, i, this.rotateface(face, clockwise));
    }
  }
  public turn(axis: number, index: number, clockwise: boolean) {
    if (this.turning || this.game.state !== 0 || index >= this.n) return;
    this.game.state = 1;
    this.group = new p.Object3D();
    this.object.add(this.group);
    this.raxis = axis;
    this.turning = true;
    this.cur = 0;
    this.clockwise = clockwise;
    this.finalize_turn(axis, index, clockwise);
  }
  public finalize_turn(axis: number, i: number, clockwise: boolean) {
    let face = this.getface(axis, i);
    if (this.turning) for (let blocks of face) for (let b of blocks) this.group.add(b.getblock());
    this.putface(axis, i, this.rotateface(face, clockwise));
  }
  public scramble_cube(moves: number) {
    if (this.game.state !== 0 || this.turning || this.scramble) return;
    this.moves = moves;
    this.scramble = true;
    let fmove = this.getrandommove();
    this.turn(fmove[0], fmove[1], fmove[2]);
  }
  private getrandommove(): [number, number, boolean] {
    return [Math.floor(Math.random() * 3), Math.floor(Math.random() * this.n), Math.random() > 0.5];
  }
  private putface(axis: number, i: number, face: Block[][]) {
    let n = this.n;
    if (axis === 0) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          this.blocks[i][n - j - 1][n - k - 1] = face[j][k];
        }
      }
    }
    //y axis
    else if (axis === 1) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          this.blocks[k][i][j] = face[j][k];
        }
      }
    }
    //z axis
    else {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          this.blocks[k][n - j - 1][i] = face[j][k];
        }
      }
    }
  }
  private getface(axis: number, i: number) {
    let n = this.n;
    let res: Block[][] = new Array(n);
    //x axs
    if (axis === 0) {
      for (let j = 0; j < n; j++) {
        res[j] = new Array(n);
        for (let k = 0; k < n; k++) {
          res[j][k] = this.blocks[i][n - j - 1][n - k - 1];
        }
      }
    }
    //y axis
    else if (axis === 1) {
      for (let j = 0; j < n; j++) {
        res[j] = new Array(n);
        for (let k = 0; k < n; k++) {
          res[j][k] = this.blocks[k][i][j];
        }
      }
    }
    //z axis
    else {
      for (let j = 0; j < n; j++) {
        res[j] = new Array(n);
        for (let k = 0; k < n; k++) {
          res[j][k] = this.blocks[k][n - j - 1][i];
        }
      }
    }
    return res;
  }
  private rotateface(face: Block[][], clockwise: boolean) {
    let n = this.n;
    if (clockwise)
      for (let i = 0; i < n / 2; i++) {
        for (let j = i; j < n - i - 1; j++) {
          // store lt in temp variable
          let temp = face[i][j];
          // move values from left to top
          face[i][j] = face[n - 1 - j][i];
          // move values from bottom to left
          face[n - 1 - j][i] = face[n - 1 - i][n - 1 - j];
          // move values from right to bottom
          face[n - 1 - i][n - 1 - j] = face[j][n - 1 - i];
          // assign temp to right
          face[j][n - 1 - i] = temp;
        }
      }
    else
      for (let i = 0; i < n / 2; i++) {
        for (let j = i; j < n - i - 1; j++) {
          // store current cell in temp variable
          let temp = face[i][j];
          // move values from right to top
          face[i][j] = face[j][n - 1 - i];
          // move values from bottom to right
          face[j][n - 1 - i] = face[n - 1 - i][n - 1 - j];
          // move values from left to bottom
          face[n - 1 - i][n - 1 - j] = face[n - 1 - j][i];
          // assign temp to left
          face[n - 1 - j][i] = temp;
        }
      }
    return face;
  }
  public clean() {
    for (let w of this.blocks) {
      for (let l of w) {
        for (let b of l) {
          b.clean();
          this.object.remove(b.getblock());
        }
      }
    }
  }
}
