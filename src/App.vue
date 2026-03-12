<template>
  <div class="weather-app">
    <!-- NAVBAR -->
    <nav class="navbar navbar-dark weather-nav">
      <div class="container">
        <router-link class="navbar-brand weather-nav__brand" to="/">
          🌤️ Weather App
        </router-link>
        <div class="d-flex gap-3 align-items-center">
          <router-link class="nav-link text-white" to="/">Home</router-link>
          <span class="text-white-50 small">{{ horaActual }}</span>
        </div>
      </div>
    </nav>

    <!-- HEADER -->
    <header class="weather-app__header">
      <div class="container text-center text-white py-4">
        <h1 class="display-6 fw-bold mb-0">Módulo 6: App de Clima (SPA con Vue.js)</h1>
        <p class="mb-0 mt-1 text-white-50">{{ fechaActual }}</p>
      </div>
    </header>

    <!-- VISTAS -->
    <main class="weather-app__main">
      <router-view />
    </main>

    <!-- FOOTER -->
    <footer class="weather-footer py-4 mt-5">
      <div class="container text-center text-white-50 small">
        <p class="mb-0">© 2026 Bootcamp FrontEnd Javascript — Módulo 6</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      horaActual: '',
      fechaActual: ''
    }
  },
  mounted() {
    this.actualizarFechaHora()
    setInterval(() => this.actualizarFechaHora(), 1000)
  },
  methods: {
    actualizarFechaHora() {
      const ahora = new Date()
      this.horaActual = ahora.toLocaleTimeString('es-CL')
      const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      this.fechaActual = `${dias[ahora.getDay()]} ${ahora.getDate()} de ${meses[ahora.getMonth()]} de ${ahora.getFullYear()}`
    }
  }
}
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; }

.weather-nav {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0.75rem 0;
}
.weather-nav__brand { font-size: 1.2rem; font-weight: 700; }

.weather-app__header {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #1e3a5f 100%);
  border-bottom: 3px solid #0ea5e9;
}

.weather-app__main { min-height: 60vh; padding: 2rem 0; }

.weather-footer { background: #1e293b; border-top: 1px solid #334155; }

/* Cards */
.place-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  color: #e2e8f0;
}
.place-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(14,165,233,0.2); }
.place-card__image { width: 100%; height: 180px; object-fit: cover; }
.place-card__name { color: #f1f5f9; font-weight: 700; }
.place-card__status { color: #94a3b8; font-size: 0.85rem; }
.place-card__temp { color: #0ea5e9; font-weight: 600; }

/* Panels */
.weather-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
}
.weather-panel__title { color: #0ea5e9; font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; }

/* List groups */
.list-group-item {
  background: #0f172a;
  color: #e2e8f0;
  border-color: #334155;
  font-size: 0.9rem;
}

/* Buttons */
.btn-primary-weather {
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary-weather:hover { background: #38bdf8; }

/* Alerts */
.alert { border-radius: 8px; }
.alert-info { background: #0c4a6e; color: #bae6fd; border-color: #0ea5e9; }
.alert-danger { background: #450a0a; color: #fca5a5; border-color: #dc2626; }

/* Inputs */
.form-control, .form-select {
  background: #0f172a;
  color: #e2e8f0;
  border-color: #334155;
}
.form-control:focus, .form-select:focus {
  background: #0f172a;
  color: #e2e8f0;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14,165,233,0.2);
}
.form-label { color: #94a3b8; font-size: 0.85rem; }
</style>
