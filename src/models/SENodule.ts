import { Vector3 } from "three";

let NODE_COUNT = 0;
export abstract class SENodule {
  /* An array to store the parents of the node (i.e. the objects that this node depends on)*/

  public parents: SENodule[] = [];
  /* An array to store the kids of the node (i.e. the objects that depend on this node)*/
  public kids: SENodule[] = [];

  /* A unique identification number for each node */
  public id: number;

  constructor() {
    this.id = NODE_COUNT++;
  }
  /* If the object doesn't exist then exists= false (For example the intersection of two circles
        can exist only if the two circles are close enough to each other, but even when they are 
        far apart and the intersections don't exist, the user might drag the circles back to where
        the intersections exist). If an object doesn't exist then all of the objects that are 
        descendants of the object don't exist. */
  public exists = true;

  /* This boolean is set to indicate that the object is out of date and needs to be updated. */
  public outOfDate = false;

  /* If the object is not visible then showing = true (The user can hide objects)*/
  public showing = true;

  /* A method to update the current SENodule on the unit sphere (used recursively)*/
  public abstract update(): void;

  /**
   * Is the object hit a point at a particular sphere location?
   * @param spherePos
   */
  public abstract isHitAt(spherePos: Vector3): boolean;

  /* Adds a given SENodule, n, to the parent array of the current SENodule */
  public addParent(n: SENodule) {
    this.parents.push(n);
  }
  /* Removes a given SENodule, n, from the parent array of the current SENodule */
  public removeParent(n: SENodule) {
    this.parents.forEach((node, index) => {
      if (node === n) {
        this.parents.splice(index, 1);
      }
    });
  }
  /* Adds a given SENodule, n, to the kids array of the current SENodule */
  public addKid(n: SENodule) {
    this.kids.push(n);
  }
  /* Removes a given SENodule, n, from the kid arry of the current SENodule */
  public removeKid(n: SENodule) {
    this.kids.forEach((item, index) => {
      if (item === n) this.kids.splice(index, 1);
    });
  }
  /* This registers a given SENodule as a child of the current SENodule by 
    1) putting the given SENodule,n ,as an element in the kids array
    2) declaring that the parent of the given SENodule is the current node  
    For example, if we are creating the intersection point P of two circles (C1 and C2) 
    that already exist. Then we would create a point P and call 
    C1.registerChild(P)  
    C2.registerChild(P)
    this would make the kids array of C1 (and C2) contain P and the parent array of P
    contain both C1 and C2.*/
  public registerChild(n: SENodule) {
    this.addKid(n);
    n.addParent(this);
  }

  /* Unregister 1) removes the given SENodule,n, from the kids array and 2) removes the 
    current SENodule from the parents array of the given SENodule. If P was a registeredChild of circles
    C1 and C2, then to unregister it we would call
    C1.unregisterChild(P)
    C2.unregisterChild(P)
    this is never used on its own - it is called as part of a routine for removing an SENodule 
    from the object tree entirely, so all SENodules that are descendants (kids, grand kids, etc.)of 
    P must be recursively removed from object tree and this is accomplished with the remove 
    function. 
    */
  public unregisterChild(n: SENodule) {
    this.removeKid(n);
    n.removeParent(this);
  }

  /* This removes the current node and all descendants (kids, grand kids, etc.) from the 
    object tree by using the unregister function and remove recursively */
  public removeThisNode() {
    //remove the current node from all of its parent SENodules
    this.parents.forEach(item => {
      item.unregisterChild(this);
    });
    while (this.kids.length > 0) {
      this.kids[0].removeThisNode();
    }
  }

  /* This is called to check and see if any of the parents of the current SENodule are outOfDate
    if any of the parents are outOfDate then this function returns false. 
    <SENodule>.updateNow()
    is asking does <SENodule> need to be updated? If there is a parent outOfDate, then <SENodule> should 
    *not* be updated now. It should wait until *all* parents are not outOfDate.  */
  public updateNow() {
    this.parents.forEach(item => {
      if (item.getOutOfDate()) {
        return false;
      }
    });
    return true;
  }

  /* Marks all descendants (kids, grand kids, etc.) of the current SENodule out of date */
  public markKidsOutOfDate() {
    this.kids.forEach(item => {
      item.setOutOfDate(true);
      item.markKidsOutOfDate();
    });
  }

  /* Kids of the current SENodule are updated  */
  public updateKids() {
    this.kids.forEach(item => {
      item.update();
    });
  }

  //Getters and Setters
  public getExists() {
    return this.exists;
  }

  public setExist(b: boolean) {
    this.exists = b;
  }

  public setOutOfDate(b: boolean) {
    this.outOfDate = b;
  }

  public getOutOfDate() {
    return this.outOfDate;
  }

  public getKids() {
    return this.kids;
  }

  public setShowing(b: boolean) {
    this.showing = b;
  }

  public getShowing() {
    return this.showing;
  }
}
