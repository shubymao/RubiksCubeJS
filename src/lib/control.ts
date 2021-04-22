import Game from './game';
import {
  Vector2,
  Vector3,
  Raycaster,
  Object3D,
  Mesh,
  BoxBufferGeometry,
  PlaneBufferGeometry,
  Intersection,
  Matrix4,
  MeshBasicMaterial,
} from 'three';
import Block from './block';
const still = -1;
const prep = 0;
const moving = 1;
const finalize = 2;
const invisibleMaterial = new MeshBasicMaterial({
  depthWrite: false,
  transparent: true,
  opacity: 0,
  color: 0x000000,
});
export default class Control {
  //Basic Control Parameter
  private game: Game;
  private state: number = still;
  private group = new Object3D();
  private raycaster = new Raycaster();
  private surface = new Mesh(new PlaneBufferGeometry(15, 15), invisibleMaterial.clone());
  private perimeter = new Mesh(new BoxBufferGeometry(1, 1, 1), invisibleMaterial.clone());
  private xoffset = 0;
  private yoffset = 0;
  //InitDragParameter
  private touch = false;
  private blockarray: Mesh[] = [];
  private piece!: Mesh;
  private layer = false;
  private position = new Vector2();
  private dragcurrent = new Vector3();
  private dragdelta = new Vector3();
  private dragtotal = new Vector3();
  private momentum: { delta: Vector3; time: number }[] = [];
  //Moving parameter
  private flipaxis = new Vector3();
  private flipangle = 0;
  private dragdirection = 0;
  private rotateaxis: number = 0;
  private dragnormal = new Vector3();
  private segment = 0;
  private count = 0;
  private fliplayer: Object3D[] = [];
  /**
   * Create the control frame work
   * @param game
   */
  public constructor(game: Game) {
    this.game = game;
    this.game.scene.add(this.surface);
    this.game.scene.add(this.perimeter);
    this.game.cube.object.add(this.group);
    this.getarr(this.game.cube.blocks);
  }
  public start = (e: MouseEvent | TouchEvent) => {
    if (this.game.state !== 0 || this.state !== still) return;
    if (e instanceof TouchEvent) e.preventDefault();
    this.getposition(e);
    this.touch = e.type === 'touchstart';
    this.initdrag(this.position);
    this.game.canvas.addEventListener(this.touch ? 'touchend' : 'mouseup', this.end, false);
    this.game.canvas.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.move, false);
  };
  /**
   * initialize the Drag step. This function will initialize the parameter for later use in move stage.
   * The parameter include setting up the clicked pieces and getting the surface
   * Some vector like the drag current and drag total is also intialize or reseted here
   * @param position
   */
  private initdrag(position: Vector2) {
    let intersection = this.getintersect(position, this.perimeter);
    if (intersection) {
      if (intersection.face == null) return;
      this.dragnormal = intersection.face.normal.round();
      this.layer = true; //rotate only one layer
      this.attach(this.surface, this.perimeter);
      this.surface.rotation.set(0, 0, 0);
      this.surface.position.set(0, 0, 0);
      this.surface.lookAt(this.dragnormal);
      this.surface.translateZ(0.5);
      this.surface.updateMatrixWorld();
      this.detach(this.surface, this.perimeter);
      let piece = this.getpiece(position, this.blockarray);
      if (piece === false) return;
      this.piece = piece.object.userData.parent;
    } else {
      this.layer = false; //rotate whole cube
      this.group.rotation.set(0, 0, 0);
      this.surface.position.set(0, 0, 0);
      this.surface.rotation.set(0, Math.PI / 4, 0);
      this.surface.updateMatrixWorld();
    }
    let surfaceintersect = this.getintersect(position, this.surface);
    if (surfaceintersect === false) return;
    this.dragcurrent = this.surface.worldToLocal(surfaceintersect.point);
    this.dragtotal = new Vector3(0, 0, 0);
    this.game.state = 2; // 2 stands for using the touch to move
    this.state = prep;
    this.momentum = [];
  }
  public move = (e: TouchEvent | MouseEvent) => {
    if (e instanceof TouchEvent) e.preventDefault();
    this.getposition(e);
    this.onDragMove(this.position);
  };
  private onDragMove(position: Vector2) {
    if (this.state !== prep && this.state !== moving) return;
    let surfaceintersect = this.getintersect(position, this.surface);
    if (surfaceintersect === false) return;
    const point = this.surface.worldToLocal(surfaceintersect.point.clone());
    this.dragdelta = point
      .clone()
      .sub(this.dragcurrent)
      .setZ(0);
    this.dragcurrent = point;
    this.addmomentumpoint(this.dragdelta);
    this.dragtotal.add(this.dragdelta);
    if (this.state === prep && this.dragtotal.length() > 0.05) {
      this.dragdirection = this.getmainaxis(this.dragtotal);
      if (this.layer) {
        const direction = new Vector3();
        direction.setComponent(this.dragdirection, 1);
        const worlddirection = this.surface.localToWorld(direction).sub(this.surface.position);
        const objectdirection = this.perimeter.worldToLocal(worlddirection).round();
        this.flipaxis = objectdirection.cross(this.dragnormal).negate();
        this.getlayer();
        this.selectlayer();
      } else {
        let axis =
          this.dragdirection !== 0
            ? this.dragdirection === 1 && position.x > this.game.width / 2
              ? 2
              : 0
            : 1;
        this.flipaxis = new Vector3();
        this.flipaxis.setComponent(axis, axis === 0 ? -1 : 1);
        this.blockarray.forEach(b => {
          if (b !== null && b.parent !== null) this.group.add(b.parent);
        });
        this.rotateaxis = axis;
      }
      this.flipangle = 0;
      this.state = moving;
    } else if (this.state === moving) {
      const rotation = this.dragdelta.getComponent(this.dragdirection);
      this.group.rotateOnAxis(this.flipaxis, rotation);
      this.flipangle += rotation;
    }
  }

  public end = (e: MouseEvent | TouchEvent) => {
    if (e instanceof TouchEvent) e.preventDefault();
    this.getposition(e);
    this.onDragEnd();
    this.game.canvas.removeEventListener(this.touch ? 'touchmove' : 'mousemove', this.move, false);
    this.game.canvas.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.end, false);
  };
  private onDragEnd = () => {
    if (this.state !== moving) {
      this.game.state = 0;
      this.state = still;
      return;
    }
    const momentum = this.getmomentum().getComponent(this.dragdirection);
    const flip = Math.abs(this.flipangle) < Math.PI / 2 && Math.abs(momentum) > 0.05 && this.flipangle !== 0;
    const angle = flip
      ? this.roundAngle(this.flipangle + Math.sign(this.flipangle) * (Math.PI / 4))
      : this.roundAngle(this.flipangle);
    let delta = angle - this.flipangle;
    this.segment = delta / 30;
    if (flip) {
      let angle = this.flipangle * Math.sign(this.flipaxis.getComponent(this.rotateaxis));
      if (this.layer) {
        let ind = Math.round(
          this.piece.position.getComponent(this.rotateaxis) * this.game.n + (this.game.n - 1) / 2,
        );
        let angle = this.flipangle * Math.sign(this.flipaxis.getComponent(this.rotateaxis));
        this.game.cube.finalize_turn(this.rotateaxis, ind, angle < 0);
      } else {
        this.game.cube.finalize_rotate(this.rotateaxis, angle < 0);
      }
    }
    this.count = 0;
    this.state = finalize;
    this.game.animations.push(this);
  };
  public update() {
    if (this.state !== finalize) return;
    this.group.rotateOnAxis(this.flipaxis, this.segment);
    this.count++;
    if (this.count === 30) {
      this.group.rotation.setFromVector3(this.snaprotation(this.group.rotation.toVector3()));
      if (this.layer) this.deselectlayer();
      else {
        this.group.updateMatrix();
        let matrix = this.group.matrix;
        this.blockarray.forEach(b => {
          if (b.parent !== null) {
            this.group.remove(b.parent);
            this.game.cube.object.add(b.parent);
            b.parent.applyMatrix(matrix);
          }
        });
      }
      this.game.animations.pop();
      this.state = still;
      this.game.state = 0;
      return;
    }
  }
  private getposition(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) {
      const ev = e.touches[0] || e.changedTouches[0];
      this.position.set(ev.pageX - this.xoffset, ev.pageY - this.yoffset);
    } else {
      if (this.xoffset !== undefined) {
        const ev = e;
        this.position.set(ev.pageX - this.xoffset, ev.pageY - this.yoffset);
      }
    }
  }
  private getintersect(position: Vector2, object: Mesh) {
    this.raycaster.setFromCamera(this.convertposition(position.clone()), this.game.camera);
    let intersection: Intersection[];
    intersection = this.raycaster.intersectObject(object);
    return intersection.length > 0 ? intersection[0] : false;
  }
  private getpiece(position: Vector2, objects: Mesh[]) {
    this.raycaster.setFromCamera(this.convertposition(position.clone()), this.game.camera);
    let intersection: Intersection[];
    intersection = this.raycaster.intersectObjects(objects);
    return intersection.length > 0 ? intersection[0] : false;
  }
  private getmainaxis(vector: Vector3) {
    if (Math.abs(vector.getComponent(0)) > Math.abs(vector.getComponent(1))) {
      return Math.abs(vector.getComponent(0)) > Math.abs(vector.getComponent(2)) ? 0 : 2;
    }
    return Math.abs(vector.getComponent(1)) > Math.abs(vector.getComponent(2)) ? 1 : 2;
  }
  private attach(child: Mesh, parent: Mesh) {
    child.applyMatrix(new Matrix4().getInverse(parent.matrixWorld));
    this.game.scene.remove(child);
    parent.add(child);
  }
  private detach(child: Mesh, parent: Mesh) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    this.game.scene.add(child);
  }
  private getlayer() {
    let layer: Object3D[] = [];
    let position = this.piece.position
      .clone()
      .multiplyScalar(this.game.n * 2)
      .round();
    let axis = this.getmainaxis(this.flipaxis);
    this.blockarray.forEach(block => {
      if (block !== null && block.parent !== null) {
        const pos = block.parent.position
          .clone()
          .multiplyScalar(this.game.n * 2)
          .round();
        if (pos.getComponent(axis) === position.getComponent(axis)) {
          layer.push(block.parent);
        }
      }
    });
    this.rotateaxis = axis;
    this.fliplayer = layer;
  }
  private selectlayer() {
    this.group.rotation.set(0, 0, 0);
    this.movepiece(this.fliplayer, this.game.cube.object, this.group);
  }
  private deselectlayer() {
    this.movepiece(this.fliplayer, this.group, this.game.cube.object);
    this.fliplayer = [];
  }
  private movepiece(layer: Object3D[], from: Object3D, to: Object3D) {
    from.updateMatrixWorld();
    to.updateMatrixWorld();
    layer.forEach(p => {
      p.applyMatrix(from.matrixWorld);
      from.remove(p);
      p.applyMatrix(new Matrix4().getInverse(to.matrixWorld));
      to.add(p);
    });
  }
  private getarr(arr: Block[][][]) {
    let res = [];
    for (let ar of arr) for (let a of ar) for (let b of a) res.push(b.block);
    this.blockarray = res;
  }
  private convertposition(position: Vector2) {
    position.x = (position.x / this.game.canvas.width) * 2 - 1;
    position.y = -((position.y / this.game.canvas.height) * 2 - 1);
    return position;
  }
  private roundAngle(angle: number) {
    const round = Math.PI / 2;
    return Math.sign(angle) * Math.round(Math.abs(angle) / round) * round;
  }
  private snaprotation(angle: Vector3) {
    return angle.set(this.roundAngle(angle.x), this.roundAngle(angle.y), this.roundAngle(angle.z));
  }
  private addmomentumpoint(delta: Vector3) {
    let time = Date.now();
    this.momentum = this.momentum.filter(
      (moment: { delta: Vector3; time: number }) => time - moment.time < 500,
    );
    this.momentum.push({ delta, time });
  }
  private getmomentum() {
    const points = this.momentum.length;
    const momentum = new Vector3();
    let t = Date.now();
    this.momentum = this.momentum.filter((moment: { delta: Vector3; time: number }) => t - moment.time < 500);
    this.momentum.forEach((value, index: number) => {
      let pt = value.delta.multiplyScalar(index / points);
      momentum.add(pt);
    });
    return momentum;
  }
  public updateoffset(x: number, y: number) {
    this.xoffset = x;
    this.yoffset = y;
  }
  public reset() {
    this.getarr(this.game.cube.blocks);
    this.game.cube.object.add(this.group);
  }
}
