import {
  Vector3,
  EllipseCurve,
  BufferGeometry,
  Intersection,
  Line,
  LineBasicMaterial,
  Quaternion,
  Camera,
  Scene
} from "three";
import CursorHandler from "./CursorHandler";
// import Arrow from "@/3d-objs/Arrow";
import Vertex from "@/3d-objs/Vertex";
import SETTINGS from "@/global-settings";

// This circle is on the XY-plane
const UNIT_CIRCLE = new EllipseCurve(0, 0, 1, 1, 0, 2 * Math.PI, false, 0);

export default class LineHandler extends CursorHandler {
  private startPoint: Vector3;
  private endPoint: Vector3;
  private currentSurfacePoint: Vector3;
  private circleQuaternion: Quaternion;
  // private normalArrow: Arrow;
  private isMouseDown: boolean;
  // private isOnSphere: boolean;
  private isCircleAdded: boolean;
  private geodesic: Line;
  private startDot: Vertex;
  constructor({
    canvas,
    camera,
    scene
  }: {
    canvas: HTMLCanvasElement;
    camera: Camera;
    scene: Scene;
  }) {
    super({ canvas, camera, scene });
    this.startPoint = new Vector3();
    this.endPoint = new Vector3();
    this.startDot = new Vertex();
    this.currentSurfacePoint = new Vector3();
    this.circleQuaternion = new Quaternion();
    // this.normalArrow = new Arrow(1.5, 0xff6600);
    this.isMouseDown = false;
    this.isOnSphere = false;
    this.isCircleAdded = false;
    this.geodesic = new Line(
      // Subdivide the circle into 60 points
      new BufferGeometry().setFromPoints(UNIT_CIRCLE.getPoints(60)),
      new LineBasicMaterial({ color: 0xff0000 })
    );
  }
  activate = () => {
    this.canvas.addEventListener("mousemove", this.moveHandler);
    this.canvas.addEventListener("mousedown", this.downHandler);
    this.canvas.addEventListener("mouseup", this.upHandler);
    this.rayCaster.layers.disableAll();
    this.rayCaster.layers.enable(SETTINGS.layers.sphere);
    this.rayCaster.layers.enable(SETTINGS.layers.vertex);
  };

  deactivate = () => {
    this.canvas.removeEventListener("mousemove", this.moveHandler);
    this.canvas.removeEventListener("mousedown", this.downHandler);
    this.canvas.removeEventListener("mouseup", this.upHandler);
  };

  moveHandler = (/*event: MouseEvent*/) => {
    this.isOnSphere = false;
    const result: Intersection[] = []; //this.intersectionWithSphere(event);
    if (result.length > 0) {
      // console.debug("Linehandler mousemove", result);
      this.isOnSphere = true;
      const hitTarget = result[0];
      if (this.isLayerEnable(hitTarget.object.layers, SETTINGS.layers.vertex)) {
        this.currentSurfacePoint.copy(hitTarget.object.position);
        this.endPoint.copy(hitTarget.object.position);
      } else {
        this.currentSurfacePoint.copy(hitTarget.point);
        this.endPoint.copy(hitTarget.point);
      }
      if (this.isMouseDown) {
        if (!this.isCircleAdded) {
          this.isCircleAdded = true;
          this.scene.add(this.geodesic);
          // this.scene.add(this.startDot);
        }
        // Reorient the geodesic circle using the cross product
        // of the start and end points
        const tmp = new Vector3();
        // Use the cross product to determine the desired orientation of geodesic circle
        tmp.crossVectors(this.startPoint, this.endPoint);
        // The circle is on XY-plane, its default orientation is the Z-axis
        // Determine the quaternion to rotate the circle to the desired orientation
        this.circleQuaternion.setFromUnitVectors(this.Z_AXIS, tmp.normalize());
        this.geodesic.rotation.set(0, 0, 0);
        this.geodesic.applyQuaternion(this.circleQuaternion);
      }
    }
    if (this.isCircleAdded && !this.isOnSphere) {
      this.scene.remove(this.geodesic);
      this.scene.remove(this.startDot);
      this.isCircleAdded = false;
    }
  };

  downHandler = (/*event: MouseEvent*/) => {
    this.isMouseDown = true;
    if (this.isOnSphere && this.hitObject) {
      const selected = this.hitObject;
      // Record the first point of the geodesic circle
      if (this.isLayerEnable(selected.layers, SETTINGS.layers.sphere)) {
        // Click on the sphere
        this.startDot.position.copy(this.currentSurfacePoint);
        this.scene.add(this.startDot);
        this.startPoint.copy(this.currentSurfacePoint);
      } else if (this.isLayerEnable(selected.layers, SETTINGS.layers.vertex)) {
        // Click on a vertex
        // Use that vertex as the starting point of the geodesic line
        this.startPoint.copy(selected.position);
      }
    }
  };

  upHandler = (/*event: MouseEvent*/) => {
    this.isMouseDown = false;
    if (this.isOnSphere) {
      // Record the second point of the geodesic circle
      this.scene.remove(this.geodesic);
      this.scene.remove(this.startDot);
      this.isCircleAdded = false;
      this.endPoint.copy(this.currentSurfacePoint);
    }
  };
}
