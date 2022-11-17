<template>
  <div @mouseenter="onListEnter"
    @mouseleave="onListLeave">
    <v-text-field v-model="search"
      label="Search"
      clearable>
    </v-text-field>
    <v-treeview :items="items"
      :search="search"
      open-all>
      <template v-slot:label="{ item }">
        <v-hover v-slot:default="{ hover }">
          <div @mouseover.capture="onItemHover(item)">
            <span>
              {{ item.description }}
              {{ item.objectCount }} objects,
              {{ item.dateCreated.substring(0,10) }}
              {{ item.author }}
            </span>
            <v-overlay v-if="hover"
              absolute
              class="_test_constructionOverlay"
              opacity="0.3">
              <v-row align="center">
                <v-col>
                  <v-btn rounded
                    id="_test_loadfab"
                    fab
                    small
                    color="secondary">
                    <v-icon @click="loadPreview(item.id)">
                      $downloadConstruction
                    </v-icon>
                  </v-btn>
                </v-col>
                <v-col v-if="allowSharing">
                  <v-btn rounded
                    id="_test_sharefab"
                    fab
                    small
                    color="secondary"
                    @click="$emit('share-requested', {docId: item.id})">
                    <v-icon>$shareConstruction</v-icon>
                  </v-btn>
                </v-col>
                <v-col v-if="item.author === userEmail">
                  <v-btn rounded
                    id="_test_deletefab"
                    fab
                    small
                    color="red"
                    @click="$emit('delete-requested', {docId: item.id})">
                    <v-icon>$deleteConstruction</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-overlay>
          </div>
        </v-hover>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { SphericalConstruction } from "@/types";
import { FirebaseAuth } from "node_modules/@firebase/auth-types";
import { Matrix4 } from "three";
import axios, { AxiosResponse } from "axios";
import { mapState, mapWritableState } from "pinia";
import { useSEStore } from "@/stores/se";

@Component({
  computed: {
    ...mapState(useSEStore, ["svgCanvas"]),
    ...mapWritableState(useSEStore, ["inverseTotalRotationMatrix"])
  }
})
export default class extends Vue {
  @Prop() readonly items!: Array<SphericalConstruction>;

  @Prop({ type: Boolean })
  readonly allowSharing!: boolean;

  readonly svgCanvas!: HTMLDivElement | null;

  inverseTotalRotationMatrix!: Matrix4;

  readonly $appAuth!: FirebaseAuth;

  svgParent: HTMLDivElement | null = null;
  svgRoot!: SVGElement;
  previewSVG: SVGElement | null = null;
  selectedSVG: SVGElement | null = null;
  // svgRootClone: SVGElement | null = null;
  originalSphereMatrix!: Matrix4;
  domParser!: DOMParser;
  lastDocId: string | null = null;
  search: string | null = null;

  created(): void {
    this.domParser = new DOMParser();
    this.originalSphereMatrix = new Matrix4();
  }
  get userEmail(): string {
    return this.$appAuth.currentUser?.email ?? "";
  }

  mounted(): void {
    // To use `innerHTML` we have to get a reference to the parent of
    // the <svg> tree
    this.svgParent = this.svgCanvas as HTMLDivElement;
    this.svgRoot = this.svgParent.querySelector("svg") as SVGElement;
  }

  previewOrDefault(dataUrl: string | undefined): string {
    return dataUrl ? dataUrl : require("@/assets/SphericalEaselLogo.gif");
  }

  onListEnter(/*ev:MouseEvent*/): void {
    this.previewSVG = null;
    this.originalSphereMatrix.copy(this.inverseTotalRotationMatrix);
  }

  // TODO: the onXXXX functions below are not bug-free yet
  // There is a potential race-condition when the mouse moves too fast
  // or when the mouse moves while a new construction is being loaded
  async onItemHover(s: SphericalConstruction): Promise<void> {
    if (this.lastDocId === s.id) return; // Prevent double hovers?

    this.lastDocId = s.id;
    let aDoc: Document | undefined = undefined;

    if (s.previewData.startsWith("data:")) {
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const parts = s.previewData.match(regex);
      if (parts) {
        const buff = Buffer.from(parts[2], "base64");
        aDoc = this.domParser.parseFromString(buff.toString(), "image/svg+xml");
      }
    } else {
      aDoc = await axios
        .get(s.previewData, { responseType: "text" })
        .then((r: AxiosResponse) => r.data)
        .then((svgString: string) => {
          const newDoc = this.domParser.parseFromString(
            svgString,
            "image/svg+xml"
          );
          return newDoc; // .querySelector("svg") as SVGElement;
        });
    }
    if (aDoc) {
      const newSvg = aDoc.querySelector("svg") as SVGElement;

      // If we are previewing a construction replace that with the new one
      // Otherwise replace the current top-level SVG with the new one

      if (this.previewSVG !== null) this.previewSVG.replaceWith(newSvg);
      else this.svgRoot.replaceWith(newSvg);
      // console.debug("onItemHover:", this.previewSVG);
      this.previewSVG = newSvg;
    }
  }

  onListLeave(/*_ev: MouseEvent*/): void {
    // Restore the canvas ** THIS CAUSES PROBLEMS WITH THE *styling (i.e. anything other than the default)* DISPLAY OF THE LABELS
    this.svgParent?.replaceChild(
      this.svgRoot,
      this.svgParent.firstChild as SVGElement
    );
    // Restore the rotation matrix
    this.inverseTotalRotationMatrix = this.originalSphereMatrix;
    /// HANS I KNOW THIS IS A TERIBLE WAY TO TRY A SOLVE THIS PROBLEM BUT THIS DOESN'T WORK
    //    SO THE ISSUE IS IN THE CSS MAYBE? OR THE DOM? OR UPDATING TWO.JS?
    // setTimeout(() => {
    //   console.log("list leave");
    //   SEStore.updateDisplay();
    // }, 1000);
  }

  loadPreview(docId: string): void {
    this.selectedSVG = this.previewSVG;
    this.$emit("load-requested", { docId });
  }
}
</script>

<style>
</style>