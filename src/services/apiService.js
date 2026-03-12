const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

const CODIGOS_CLIMA = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado',
  3: 'Nublado', 45: 'Niebla', 48: 'Niebla escarchada',
  51: 'Llovizna', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
  61: 'Lluvia', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  71: 'Nieve', 73: 'Nieve moderada', 75: 'Nieve intensa',
  80: 'Chubascos', 81: 'Chubascos moderados', 82: 'Chubascos intensos',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta fuerte con granizo'
}

export function traducirCodigoClima(codigo) {
  return CODIGOS_CLIMA[codigo] || 'Variable'
}

export async function obtenerClimaPorCoordenadas({ lat, lon, timezone = 'America/Santiago' }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min'
  })

  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Error API (${response.status})`)
  return response.json()
}

export function mapearLugar(lugarBase, payload) {
  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const pronosticoSemanal = payload.daily.time.map((fechaIso, idx) => ({
    fechaIso,
    dia: DIAS[new Date(`${fechaIso}T00:00:00`).getDay()],
    min: payload.daily.temperature_2m_min[idx],
    max: payload.daily.temperature_2m_max[idx],
    estado: traducirCodigoClima(payload.daily.weather_code[idx]),
    codigo: payload.daily.weather_code[idx]
  }))

  return {
    ...lugarBase,
    tempActual: payload.current.temperature_2m,
    estadoActual: traducirCodigoClima(payload.current.weather_code),
    pronosticoSemanal
  }
}

export function calcularEstadisticas(pronostico) {
  const mins = pronostico.map(d => d.min)
  const maxs = pronostico.map(d => d.max)
  const promedios = pronostico.map(d => (d.min + d.max) / 2)
  const diasPorEstado = pronostico.reduce((acc, d) => {
    acc[d.estado] = (acc[d.estado] || 0) + 1
    return acc
  }, {})

  return {
    tempMinima: Math.min(...mins).toFixed(1),
    tempMaxima: Math.max(...maxs).toFixed(1),
    tempPromedio: (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1),
    diasPorEstado
  }
}

export function generarAlertas(pronostico, estadisticas) {
  const alertas = []
  if (estadisticas.tempPromedio > 30) alertas.push('⚠️ Alerta de calor: promedio semanal mayor a 30°C.')
  if (estadisticas.tempMinima < 5) alertas.push('🥶 Alerta de frío: se esperan mínimas por debajo de 5°C.')
  const diasLluvia = pronostico.filter(d => /lluvia|chubascos|tormenta|llovizna/i.test(d.estado)).length
  if (diasLluvia >= 2) alertas.push('🌧️ Semana lluviosa: se pronostican 2 o más días de lluvia.')
  if (alertas.length === 0) alertas.push('✅ Sin alertas relevantes para esta semana.')
  return alertas
}
