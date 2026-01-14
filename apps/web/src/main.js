import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/base.css';
import App from './App.vue'
import 'bootstrap-icons/font/bootstrap-icons.css';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router/index.js';

const app = createApp(App)

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router);

app.mount('#app')



