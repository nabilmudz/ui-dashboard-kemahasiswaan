import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './assets/font-awesome/css/fontawesome.css';
import './assets/font-awesome/css/solid.css';
import './assets/font-awesome/css/light.css';
import './assets/font-awesome/css/regular.css';
import './assets/font-awesome/css/duotone.css';
import './style.css';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
