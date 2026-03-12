# 🌤️ App de Clima — Módulo 6 (SPA con Vue.js)

## Descripción

App de clima de una sola página (SPA) construida con **Vue.js**, que muestra información climática en tiempo real de lugares del norte de Chile, usando la API pública de Open-Meteo.

## Vistas principales

| Vista | Descripción |
|-------|-------------|
| Home | Lista de todos los lugares con clima actual |
| Detalle | Pronóstico, estadísticas y alertas del lugar |

## Funcionalidades

- 🔍 Búsqueda de lugares por nombre (v-model)
- 🌡️ Selector de unidad de temperatura: Celsius / Fahrenheit (v-model)
- 📦 Caché local: la API solo se consulta la primera vez
- 🔄 Botón para forzar recarga desde la API
- 📅 Pronóstico diario de la semana
- 📊 Estadísticas semanales (min, max, promedio, días por estado)
- 🚨 Alertas automáticas de clima
- ✅ Navegación SPA sin recargar la página (Vue Router simulado)

## Cómo usar

Simplemente abrí el archivo `index.html` en el navegador. No requiere instalación.

## Tecnologías usadas

- Vue.js 3 (CDN)
- Bootstrap 5
- API: Open-Meteo (https://open-meteo.com/)

## Enlace al repositorio

> (https://github.com/javier-vh9519/weather-frontend-m6.git)
