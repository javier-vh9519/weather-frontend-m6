export class ApiClient {
  constructor(baseUrl = "https://api.open-meteo.com/v1/forecast") {
    this.baseUrl = baseUrl;
  }

  async obtenerClimaPorCoordenadas({ lat, lon, timezone = "America/Santiago" }) {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone,
      current: "temperature_2m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min"
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error API (${response.status}) al obtener clima.`);
    }

    return response.json();
  }
}
