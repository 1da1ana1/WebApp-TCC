import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/base.css';
import App from './App.vue'
import 'bootstrap-icons/font/bootstrap-icons.css';

import router from './router/index.js';

const app = createApp(App)
app.use(createPinia())
app.use(router);

app.mount('#app')



