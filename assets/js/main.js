import { ApiClient } from "./apiClient.js";
import { WeatherApp } from "./weatherApp.js";

const LUGARES_BASE = [
  {
    id: 1,
    nombre: "Antofagasta",
    lat: -23.6509,
    lon: -70.3975,
    imagen: "assets/img/afta-laportada.jpg",
    descripcion: "Capital regional con clima costero templado."
  },
  {
    id: 2,
    nombre: "Calama",
    lat: -22.4567,
    lon: -68.9237,
    imagen: "https://picsum.photos/600/320?random=21",
    descripcion: "Ciudad del desierto con gran amplitud termica."
  },
  {
    id: 3,
    nombre: "Tocopilla",
    lat: -22.091,
    lon: -70.1979,
    imagen: "https://picsum.photos/600/320?random=22",
    descripcion: "Localidad costera con nubosidad y llovizna ocasional."
  },
  {
    id: 4,
    nombre: "Mejillones",
    lat: -23.1,
    lon: -70.45,
    imagen: "https://picsum.photos/600/320?random=23",
    descripcion: "Puerto industrial con viento costero frecuente."
  },
  {
    id: 5,
    nombre: "Taltal",
    lat: -25.4011,
    lon: -70.4836,
    imagen: "https://picsum.photos/600/320?random=24",
    descripcion: "Comuna costera con niebla y temperaturas suaves."
  },
  {
    id: 6,
    nombre: "San Pedro de Atacama",
    lat: -22.9111,
    lon: -68.2011,
    imagen: "https://picsum.photos/600/320?random=25",
    descripcion: "Destino altiplanico con dias secos y noches frias."
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  const weatherApp = new WeatherApp(new ApiClient(), LUGARES_BASE);
  await weatherApp.inicializar();
});
