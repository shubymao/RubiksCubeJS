import { RoundedPlaneGeometry } from './RoundedPlaneGeometry';
import { MeshLambertMaterial, ExtrudeBufferGeometry, Mesh, DoubleSide } from 'three';
export default class Sticker {
  private plane: ExtrudeBufferGeometry;
  private material: MeshLambertMaterial;
  private sticker: Mesh;
  public constructor(size: number, side: number, offset: number, color: string, depth: number) {
    this.plane = RoundedPlaneGeometry(size, 0.15, depth);
    this.material = new MeshLambertMaterial({ color: color, side: DoubleSide });
    this.sticker = new Mesh(this.plane, this.material);
    //top
    if (side === 0) {
      this.sticker.rotateX((-1 * Math.PI) / 2);
      this.sticker.position.y += offset;
    }
    //bot
    else if (side === 1) {
      this.sticker.rotateX(Math.PI / 2);
      this.sticker.position.y -= offset;
    }
    //left
    else if (side === 2) {
      this.sticker.rotateY((-1 * Math.PI) / 2);
      this.sticker.position.x -= offset;
    }
    //right
    else if (side === 3) {
      this.sticker.rotateY(Math.PI / 2);
      this.sticker.position.x += offset;
    }
    //front
    else if (side === 4) {
      this.sticker.position.z += offset;
    }
    //back
    else if (side === 5) {
      this.sticker.rotateY(Math.PI);
      this.sticker.position.z -= offset;
    }
  }
  public getsticker() {
    return this.sticker;
  }
  public clean() {
    this.plane.dispose();
    this.material.dispose();
  }
}
