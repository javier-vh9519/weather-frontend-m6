<template>
  <div class="container">

    <!-- Buscador y filtro de unidad -->
    <div class="row g-3 mb-4 align-items-end">
      <div class="col-md-6">
        <label class="form-label">🔍 Buscar lugar</label>
        <input
          v-model="busqueda"
          type="text"
          class="form-control"
          placeholder="Ej: Calama, Taltal..."
        />
      </div>
      <div class="col-md-3">
        <label class="form-label">🌡️ Unidad de temperatura</label>
        <select v-model="unidad" class="form-select">
          <option value="C">Celsius (°C)</option>
          <option value="F">Fahrenheit (°F)</option>
        </select>
      </div>
      <div class="col-md-3">
        <button class="btn-primary-weather w-100" @click="recargarLugares">
          🔄 Recargar clima
        </button>
      </div>
    </div>

    <!-- Estado de carga / error -->
    <div v-if="estado === 'cargando'" class="alert alert-info">
      ⏳ Cargando datos de clima desde la API...
    </div>
    <div v-if="estado === 'error'" class="alert alert-danger">
      ❌ {{ mensajeError }}
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-if="estado === 'listo' && lugaresFiltrados.length === 0" class="alert alert-info">
      No se encontraron lugares con "{{ busqueda }}".
    </div>

    <!-- Lista de lugares -->
    <div v-if="estado === 'listo'" class="row g-4">
      <div
        v-for="lugar in lugaresFiltrados"
        :key="lugar.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <article class="place-card h-100 d-flex flex-column">
          <img :src="lugar.imagen" :alt="lugar.nombre" class="place-card__image" />
          <div class="p-3 d-flex flex-column flex-grow-1">
            <h3 class="place-card__name">{{ lugar.nombre }}</h3>
            <p class="place-card__status">{{ lugar.descripcion }}</p>
            <p class="place-card__temp mt-auto">
              <strong>Actual:</strong> {{ convertirTemp(lugar.tempActual) }} — {{ lugar.estadoActual }}
            </p>
            <router-link
              :to="`/lugar/${lugar.id}`"
              class="btn-primary-weather text-center text-decoration-none d-block mt-2"
            >
              Ver detalle
            </router-link>
          </div>
        </article>
      </div>
    </div>

  </div>
</template>

<script>
import { LUGARES_BASE } from '../data/lugares.js'
import { obtenerClimaPorCoordenadas, mapearLugar } from '../services/apiService.js'

// Caché local: solo se consulta la API la primera vez
let cacheClima = null

export default {
  name: 'HomeView',
  data() {
    return {
      lugares: [],
      busqueda: '',
      unidad: 'C',
      estado: 'cargando', // 'cargando' | 'listo' | 'error'
      mensajeError: ''
    }
  },
  computed: {
    lugaresFiltrados() {
      const texto = this.busqueda.trim().toLowerCase()
      if (!texto) return this.lugares
      return this.lugares.filter(l => l.nombre.toLowerCase().includes(texto))
    }
  },
  async mounted() {
    await this.cargarLugares()
  },
  methods: {
    async cargarLugares(forzar = false) {
      // Si ya tenemos caché y no se fuerza recarga, usar datos locales
      if (cacheClima && !forzar) {
        this.lugares = cacheClima
        this.estado = 'listo'
        return
      }

      this.estado = 'cargando'
      try {
        const resultados = await Promise.all(
          LUGARES_BASE.map(async (base) => {
            const payload = await obtenerClimaPorCoordenadas({ lat: base.lat, lon: base.lon })
            return mapearLugar(base, payload)
          })
        )
        cacheClima = resultados
        this.lugares = resultados
        this.estado = 'listo'
      } catch (error) {
        this.mensajeError = error.message
        this.estado = 'error'
      }
    },
    recargarLugares() {
      cacheClima = null
      this.cargarLugares(true)
    },
    convertirTemp(temp) {
      if (this.unidad === 'F') {
        return `${((temp * 9) / 5 + 32).toFixed(1)}°F`
      }
      return `${temp}°C`
    }
  }
}
</script>
