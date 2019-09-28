import { RoundedBoxGeometry } from './RoundedBoxGeometry';
import { MeshLambertMaterial, Mesh, Object3D } from 'three';
import Sticker from './Sticker';
export default class Block {
  //primary object to pass down
  public object = new Object3D();
  public stickers: Sticker[] = new Array(6);
  public core: any;
  public mat: MeshLambertMaterial;
  public block: Mesh;
  //parameters
  public constructor(x: number, y: number, z: number, n: number, size: number) {
    let width = size * 0.72;
    let offset = size * 0.5015;
    let depth = size * 0.03;
    this.core = new RoundedBoxGeometry(size, 0.12, 3); //make the shape
    this.mat = new MeshLambertMaterial({ color: 0x000015 }); //make the material
    this.block = new Mesh(this.core, this.mat); //combine together
    this.block.userData.parent = this.object;
    this.object.add(this.block); //add it to the output scene
    //add sticker if it is close to the edge
    if (y === 0) {
      //bottom
      this.stickers[0] = new Sticker(width, 1, offset, 'rgb(255, 255, 0)', depth);
      this.object.add(this.stickers[0].getsticker());
    }
    if (y === n - 1) {
      //top
      this.stickers[1] = new Sticker(width, 0, offset, 'rgb(255, 255, 255)', depth);
      this.object.add(this.stickers[1].getsticker());
    }
    if (x === 0) {
      //left
      this.stickers[2] = new Sticker(width, 2, offset, 'rgb(0, 255, 0)', depth);
      this.object.add(this.stickers[2].getsticker());
    }
    if (x === n - 1) {
      //right
      this.stickers[3] = new Sticker(width, 3, offset, 'rgb(0, 0, 255)', depth);
      this.object.add(this.stickers[3].getsticker());
    }
    if (z === 0) {
      //back
      this.stickers[4] = new Sticker(width, 5, offset, 'rgb(255, 140, 0)', depth);
      this.object.add(this.stickers[4].getsticker());
    }
    if (z === n - 1) {
      //front
      this.stickers[5] = new Sticker(width, 4, offset, 'rgb(255, 0, 0)', depth);
      this.object.add(this.stickers[5].getsticker());
    }
  }
  public getblock(): Object3D {
    return this.object;
  }
  public clean() {
    this.object.remove(this.block);
    for (let i = 0; i < 6; i++) {
      if (this.stickers[i] !== undefined) {
        this.object.remove(this.stickers[i].getsticker());
        this.stickers[i].clean();
      }
    }
    this.core.dispose();
    this.mat.dispose();
  }
}
