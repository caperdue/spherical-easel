<template>
  <div>
    <v-treeview :items="items">

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
export default class  extends Vue {
  @Prop() readonly items!: Array<SphericalConstruction>;
}
</script>

<style>
</style>