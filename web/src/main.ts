import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(error => console.error(error));

// Necesario para poder instalar el panel como app. Solo existe en HTTPS (p. ej. la dirección de Tailscale)
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
