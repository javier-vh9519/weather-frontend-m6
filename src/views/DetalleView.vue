<template>
  <div class="container">

    <!-- Volver -->
    <router-link to="/" class="btn-primary-weather text-decoration-none d-inline-block mb-4">
      ← Volver al Home
    </router-link>

    <!-- Cargando -->
    <div v-if="estado === 'cargando'" class="alert alert-info">
      ⏳ Cargando detalle del lugar...
    </div>

    <!-- Error -->
    <div v-if="estado === 'error'" class="alert alert-danger">
      ❌ {{ mensajeError }}
    </div>

    <!-- Contenido -->
    <div v-if="estado === 'listo' && lugar">

      <!-- Card principal -->
      <article class="place-card mb-4 d-flex flex-column flex-md-row overflow-hidden">
        <img :src="lugar.imagen" :alt="lugar.nombre" style="width:100%;max-width:320px;object-fit:cover;" />
        <div class="p-4">
          <h2 class="place-card__name fs-3">{{ lugar.nombre }}</h2>
          <p class="place-card__status">{{ lugar.descripcion }}</p>
          <p class="place-card__temp fs-5">
            🌡️ {{ convertirTemp(lugar.tempActual) }} — {{ lugar.estadoActual }}
          </p>

          <!-- Selector de unidad -->
          <div class="mt-3">
            <label class="form-label">Unidad de temperatura</label>
            <select v-model="unidad" class="form-select" style="max-width:200px;">
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </div>
        </div>
      </article>

      <div class="row g-4">

        <!-- Pronóstico semanal -->
        <div class="col-12 col-lg-6">
          <section class="weather-panel h-100">
            <h4 class="weather-panel__title">📅 Pronóstico diario (semana)</h4>
            <ul class="list-group">
              <li
                v-for="dia in lugar.pronosticoSemanal"
                :key="dia.fechaIso"
                class="list-group-item d-flex justify-content-between"
              >
                <span>{{ dia.dia }}</span>
                <span>{{ convertirTemp(dia.min) }} / {{ convertirTemp(dia.max) }} — {{ dia.estado }}</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- Estadísticas -->
        <div class="col-12 col-lg-6">
          <section class="weather-panel h-100" v-if="estadisticas">
            <h4 class="weather-panel__title">📊 Estadísticas de la semana</h4>
            <ul class="list-group mb-3">
              <li class="list-group-item d-flex justify-content-between">
                <span>Temperatura mínima</span>
                <strong>{{ convertirTemp(Number(estadisticas.tempMinima)) }}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Temperatura máxima</span>
                <strong>{{ convertirTemp(Number(estadisticas.tempMaxima)) }}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Temperatura promedio</span>
                <strong>{{ convertirTemp(Number(estadisticas.tempPromedio)) }}</strong>
              </li>
            </ul>

            <h5 class="weather-panel__title">☁️ Días por tipo de clima</h5>
            <ul class="list-group mb-3">
              <li
                v-for="(cantidad, estado) in estadisticas.diasPorEstado"
                :key="estado"
                class="list-group-item d-flex justify-content-between"
              >
                <span>{{ estado }}</span>
                <span>{{ cantidad }} día{{ cantidad > 1 ? 's' : '' }}</span>
              </li>
            </ul>

            <p class="text-info fw-semibold mb-0">
              Condición predominante: <strong>{{ estadoDominante }}</strong>
            </p>
          </section>
        </div>

        <!-- Alertas -->
        <div class="col-12">
          <section class="weather-panel">
            <h4 class="weather-panel__title">🚨 Alertas de clima</h4>
            <ul class="list-group">
              <li v-for="alerta in alertas" :key="alerta" class="list-group-item">
                {{ alerta }}
              </li>
            </ul>
          </section>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { LUGARES_BASE } from '../data/lugares.js'
import { obtenerClimaPorCoordenadas, mapearLugar, calcularEstadisticas, generarAlertas } from '../services/apiService.js'

export default {
  name: 'DetalleView',
  data() {
    return {
      lugar: null,
      estadisticas: null,
      alertas: [],
      unidad: 'C',
      estado: 'cargando',
      mensajeError: ''
    }
  },
  computed: {
    estadoDominante() {
      if (!this.estadisticas) return ''
      const entradas = Object.entries(this.estadisticas.diasPorEstado).sort((a, b) => b[1] - a[1])
      return entradas[0]?.[0] || 'Variable'
    }
  },
  async mounted() {
    const id = Number(this.$route.params.id)
    const base = LUGARES_BASE.find(l => l.id === id)
    if (!base) {
      this.mensajeError = 'Lugar no encontrado.'
      this.estado = 'error'
      return
    }

    try {
      const payload = await obtenerClimaPorCoordenadas({ lat: base.lat, lon: base.lon })
      this.lugar = mapearLugar(base, payload)
      this.estadisticas = calcularEstadisticas(this.lugar.pronosticoSemanal)
      this.alertas = generarAlertas(this.lugar.pronosticoSemanal, this.estadisticas)
      this.estado = 'listo'
    } catch (error) {
      this.mensajeError = error.message
      this.estado = 'error'
    }
  },
  methods: {
    convertirTemp(temp) {
      if (this.unidad === 'F') {
        return `${((temp * 9) / 5 + 32).toFixed(1)}°F`
      }
      return `${Number(temp).toFixed(1)}°C`
    }
  }
}
</script>
