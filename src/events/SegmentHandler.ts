import { Vector3, Camera, Scene } from "three";
import LineHandler from "./LineHandler";
// import Arrow from "@/3d-objs/Arrow";
import Vertex from "@/3d-objs/Point";
import SETTINGS from "@/global-settings";

export default class SegmentHandler extends LineHandler {
  private tmpVector: Vector3;
  constructor({
    camera,
    scene
  }: {
    canvas: HTMLCanvasElement;
    camera: Camera;
    scene: Scene;
  }) {
    super({ camera, scene });
    this.tmpVector = new Vector3();
    const redDot = new Vertex(0.05, 0xff0000);
    redDot.position.set(1.0, 0, 0);
    // const greenDot = new Vertex(0.05, 0x00ff44);
    // greenDot.position.set(0, 1.0, 0);
    // this.geodesicRing.add(redDot);
    // this.geodesicRing.add(greenDot);
  }

  activate = () => {
    this.rayCaster.layers.enable(SETTINGS.layers.sphere);
    this.rayCaster.layers.enable(SETTINGS.layers.point);
    // The following line automatically calls Line setter function
    this.geodesicRing.isSegment = true;
  };
}
