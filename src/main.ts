// <reference path="@/extensions/three-ext.d.ts" />
// <reference path="@/extensions/number-ext.d.ts" />
// <reference path="@/types/two.js/index.d.ts" />
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import VueI18n from "vue-i18n";
import i18n from "./i18n";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "@/extensions/three.extensions";
import "@/extensions/number.extensions";
import { createPinia, PiniaVuePlugin } from "pinia";
import VueCompositionAPI from "@vue/composition-api";

import { Command } from "@/commands/Command";
import { useSEStore } from "@/stores/se";
import MouseHandler from "./eventHandlers/MouseHandler";
Vue.use(VueI18n);
Vue.use(PiniaVuePlugin);
Vue.use(VueCompositionAPI);

const pinia = createPinia();

const firebaseConfig = {
  apiKey: "AIzaSyDNA-9m5KvjcxAeTE6ixr_bhXr2Hs2zNys",
  authDomain: "spherical-easel.firebaseapp.com",
  projectId: "spherical-easel",
  storageBucket: "spherical-easel.appspot.com",
  messagingSenderId: "157369820516",
  appId: "1:157369820516:web:70391e3fea4b7d6ef7c671"
};

firebase.initializeApp(firebaseConfig);

// Allow all .vue components to access Firebase Auth, Firestore, and Storage
// via new instance variables this.$appAuth, this.$appDB, this.$appStorage
Vue.prototype.$appAuth = firebase.auth();
Vue.prototype.$appDB = firebase.firestore();
Vue.prototype.$appStorage = firebase.storage();
Vue.config.productionTip = false;

new Vue({
  i18n,
  provide: {
    // Use dependency injection to provide a mocked renderer during testing
    // renderer
  },
  router,
  vuetify,
  pinia,
  render: (h: any) => h(App)
}).$mount("#app");

console.log("Setting global store from main.ts");
Command.setGlobalStore(useSEStore());
MouseHandler.setGlobalStore(useSEStore());
