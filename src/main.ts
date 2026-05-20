import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./composables/useTheme";
import "./styles.css";

const app = createApp(App);
app.use(router);
app.mount("#root");
