export class WeatherApp {
  constructor(apiClient, lugaresBase) {
    this.apiClient = apiClient;
    this.lugaresBase = lugaresBase;
    this.lugares = [];

    this.elementos = {
      home: document.getElementById("home"),
      detalle: document.getElementById("detalle"),
      listaLugares: document.getElementById("listaLugares"),
      volverInicio: document.getElementById("volverInicio"),
      fechaActual: document.getElementById("fechaActual"),
      horaActual: document.getElementById("horaActual"),
      homeEstado: document.getElementById("homeEstado"),
      detalleEstadoUi: document.getElementById("detalleEstadoUi"),
      detalleNombre: document.getElementById("detalleNombre"),
      detalleEstado: document.getElementById("detalleEstado"),
      detalleTempActual: document.getElementById("detalleTempActual"),
      detalleImagen: document.getElementById("detalleImagen"),
      detallePronostico: document.getElementById("detallePronostico"),
      detalleEstadisticas: document.getElementById("detalleEstadisticas"),
      detalleConteoClima: document.getElementById("detalleConteoClima"),
      detalleResumen: document.getElementById("detalleResumen"),
      detalleAlertas: document.getElementById("detalleAlertas")
    };

    this.nombresDias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado"
    ];
  }

  async inicializar() {
    this.actualizarFecha();
    this.actualizarReloj();
    setInterval(() => this.actualizarReloj(), 1000);

    this.enlazarEventos();
    await this.cargarLugares();
  }

  enlazarEventos() {
    this.elementos.listaLugares.addEventListener("click", (event) => {
      const boton = event.target.closest(".btn-ver-detalle");
      if (!boton) {
        return;
      }

      const idLugar = Number(boton.dataset.id);
      this.mostrarVistaDetalle(idLugar);
    });

    this.elementos.volverInicio.addEventListener("click", () => {
      this.volverAHome();
    });
  }

  async cargarLugares() {
    this.mostrarEstadoHome("Cargando lugares desde API...");

    try {
      const lugaresConClima = await Promise.all(
        this.lugaresBase.map(async (lugarBase) => {
          const payload = await this.apiClient.obtenerClimaPorCoordenadas({
            lat: lugarBase.lat,
            lon: lugarBase.lon
          });

          return this.mapearLugarApi(lugarBase, payload);
        })
      );

      this.lugares = lugaresConClima;
      this.renderHome();
      this.ocultarEstadoHome();
    } catch (error) {
      this.lugares = [];
      this.elementos.listaLugares.innerHTML = "";
      this.mostrarEstadoHome(`Error al cargar datos de clima: ${error.message}`);
    }
  }

  mapearLugarApi(lugarBase, payload) {
    const tempActual = payload.current.temperature_2m;
    const codigoActual = payload.current.weather_code;

    const pronosticoSemanal = payload.daily.time.map((fechaIso, idx) => ({
      fechaIso,
      dia: this.formatearDiaSemana(fechaIso),
      min: payload.daily.temperature_2m_min[idx],
      max: payload.daily.temperature_2m_max[idx],
      estado: this.traducirCodigoClima(payload.daily.weather_code[idx]),
      codigo: payload.daily.weather_code[idx]
    }));

    return {
      id: lugarBase.id,
      nombre: lugarBase.nombre,
      descripcion: lugarBase.descripcion,
      imagen: lugarBase.imagen,
      lat: lugarBase.lat,
      lon: lugarBase.lon,
      tempActual,
      estadoActual: this.traducirCodigoClima(codigoActual),
      pronosticoSemanal
    };
  }

  traducirCodigoClima(codigo) {
    const mapa = {
      0: "Despejado",
      1: "Mayormente despejado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Niebla",
      48: "Niebla escarchada",
      51: "Llovizna",
      53: "Llovizna moderada",
      55: "Llovizna intensa",
      56: "Llovizna helada",
      57: "Llovizna helada intensa",
      61: "Lluvia",
      63: "Lluvia moderada",
      65: "Lluvia intensa",
      66: "Lluvia helada",
      67: "Lluvia helada intensa",
      71: "Nieve",
      73: "Nieve moderada",
      75: "Nieve intensa",
      77: "Granizos de nieve",
      80: "Chubascos",
      81: "Chubascos moderados",
      82: "Chubascos intensos",
      85: "Chubascos de nieve",
      86: "Chubascos de nieve intensos",
      95: "Tormenta",
      96: "Tormenta con granizo",
      99: "Tormenta fuerte con granizo"
    };

    return mapa[codigo] || "Variable";
  }

  obtenerLugar(identificador) {
    if (typeof identificador === "number") {
      return this.lugares.find((lugar) => lugar.id === identificador);
    }

    const nombreBuscado = String(identificador).trim().toLowerCase();
    return this.lugares.find((lugar) => lugar.nombre.toLowerCase() === nombreBuscado);
  }

  calcularEstadisticas(pronosticoSemanal) {
    const tempMinima = Math.min(...pronosticoSemanal.map((dia) => dia.min));
    const tempMaxima = Math.max(...pronosticoSemanal.map((dia) => dia.max));

    const promedioDiario = pronosticoSemanal.map((dia) => (dia.min + dia.max) / 2);
    const tempPromedio = promedioDiario.reduce((acc, valor) => acc + valor, 0) / promedioDiario.length;

    const diasPorEstado = pronosticoSemanal.reduce((acumulado, dia) => {
      const key = dia.estado;
      acumulado[key] = (acumulado[key] || 0) + 1;
      return acumulado;
    }, {});

    return {
      tempMinima: Number(tempMinima.toFixed(1)),
      tempMaxima: Number(tempMaxima.toFixed(1)),
      tempPromedio: Number(tempPromedio.toFixed(1)),
      diasPorEstado
    };
  }

  generarAlertas(pronosticoSemanal, estadisticas) {
    const alertas = [];

    if (estadisticas.tempPromedio > 30) {
      alertas.push("Alerta de calor: promedio semanal mayor a 30 C.");
    }

    if (estadisticas.tempMinima < 5) {
      alertas.push("Alerta de frio: se esperan minimas por debajo de 5 C.");
    }

    const diasLluvia = pronosticoSemanal.filter((dia) => /lluvia|chubascos|tormenta|llovizna/i.test(dia.estado)).length;
    if (diasLluvia >= 2) {
      alertas.push("Semana lluviosa: se pronostican 2 o mas dias de lluvia.");
    }

    if (alertas.length === 0) {
      alertas.push("Sin alertas relevantes para esta semana.");
    }

    return alertas;
  }

  renderHome() {
    if (!this.elementos.listaLugares) {
      return;
    }

    this.elementos.listaLugares.innerHTML = this.lugares
      .map(
        (lugar) => `
          <div class="col-12 col-md-6 col-lg-4">
            <article class="card place-card clima-card h-100">
              <img src="${lugar.imagen}" class="place-card__image" alt="${lugar.nombre}">
              <div class="card-body place-card__body">
                <h3 class="card-title place-card__name">${lugar.nombre}</h3>
                <p class="place-card__status">${lugar.descripcion}</p>
                <p class="place-card__temp mt-auto"><strong>Actual:</strong> ${lugar.tempActual} C - ${lugar.estadoActual}</p>
                <button class="btn btn-secondary place-card__action mt-2 btn-ver-detalle" data-id="${lugar.id}" type="button">Ver detalle</button>
              </div>
            </article>
          </div>
        `
      )
      .join("");
  }

  renderDetalle(lugar) {
    const estadisticas = this.calcularEstadisticas(lugar.pronosticoSemanal);
    const alertas = this.generarAlertas(lugar.pronosticoSemanal, estadisticas);

    this.elementos.detalleNombre.textContent = lugar.nombre;
    this.elementos.detalleEstado.textContent = lugar.descripcion;
    this.elementos.detalleTempActual.textContent = `Temperatura actual: ${lugar.tempActual} C - ${lugar.estadoActual}`;
    this.elementos.detalleImagen.src = lugar.imagen;
    this.elementos.detalleImagen.alt = lugar.nombre;

    this.elementos.detallePronostico.innerHTML = lugar.pronosticoSemanal
      .map(
        (dia) => `
          <li class="list-group-item d-flex justify-content-between">
            <span>${dia.dia}</span>
            <span>Min ${dia.min} C | Max ${dia.max} C | ${dia.estado}</span>
          </li>
        `
      )
      .join("");

    this.elementos.detalleEstadisticas.innerHTML = `
      <li class="list-group-item"><strong>Temperatura minima:</strong> ${estadisticas.tempMinima} C</li>
      <li class="list-group-item"><strong>Temperatura maxima:</strong> ${estadisticas.tempMaxima} C</li>
      <li class="list-group-item"><strong>Temperatura promedio:</strong> ${estadisticas.tempPromedio} C</li>
    `;

    this.elementos.detalleConteoClima.innerHTML = Object.entries(estadisticas.diasPorEstado)
      .map(
        ([estado, cantidad]) => `
          <li class="list-group-item d-flex justify-content-between">
            <span>${estado}</span>
            <span>${cantidad} dias</span>
          </li>
        `
      )
      .join("");

    const entradasOrdenadas = Object.entries(estadisticas.diasPorEstado).sort((a, b) => b[1] - a[1]);
    const [estadoDominante] = entradasOrdenadas[0] || ["Variable"];
    this.elementos.detalleResumen.textContent = `Condicion predominante de la semana: ${estadoDominante}.`;

    this.elementos.detalleAlertas.innerHTML = alertas
      .map((alerta) => `<li class="list-group-item">${alerta}</li>`)
      .join("");
  }

  async mostrarVistaDetalle(idLugar) {
    const lugar = this.obtenerLugar(idLugar);
    if (!lugar) {
      return;
    }

    this.mostrarEstadoDetalle("Actualizando pronostico y estadisticas...");

    try {
      const payload = await this.apiClient.obtenerClimaPorCoordenadas({
        lat: lugar.lat,
        lon: lugar.lon
      });

      const lugarActualizado = this.mapearLugarApi(lugar, payload);
      this.lugares = this.lugares.map((item) => (item.id === lugar.id ? lugarActualizado : item));

      this.renderDetalle(lugarActualizado);
      this.ocultarEstadoDetalle();
      this.elementos.home.classList.add("d-none");
      this.elementos.detalle.classList.remove("d-none");
    } catch (error) {
      this.mostrarEstadoDetalle(`Error al cargar detalle: ${error.message}`);
    }
  }

  volverAHome() {
    this.elementos.detalle.classList.add("d-none");
    this.elementos.home.classList.remove("d-none");
    this.ocultarEstadoDetalle();
  }

  formatearDiaSemana(fechaIso) {
    const fecha = new Date(`${fechaIso}T00:00:00`);
    return this.nombresDias[fecha.getDay()];
  }

  actualizarFecha() {
    if (!this.elementos.fechaActual) {
      return;
    }

    const fecha = new Date();
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado"
    ];
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
    ];

    this.elementos.fechaActual.textContent = `${diasSemana[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  }

  actualizarReloj() {
    if (!this.elementos.horaActual) {
      return;
    }

    this.elementos.horaActual.textContent = new Date().toLocaleTimeString("es-CL");
  }

  mostrarEstadoHome(mensaje) {
    this.elementos.homeEstado.textContent = mensaje;
    this.elementos.homeEstado.classList.remove("d-none");
  }

  ocultarEstadoHome() {
    this.elementos.homeEstado.classList.add("d-none");
    this.elementos.homeEstado.textContent = "";
  }

  mostrarEstadoDetalle(mensaje) {
    this.elementos.detalleEstadoUi.textContent = mensaje;
    this.elementos.detalleEstadoUi.classList.remove("d-none");
  }

  ocultarEstadoDetalle() {
    this.elementos.detalleEstadoUi.classList.add("d-none");
    this.elementos.detalleEstadoUi.textContent = "";
  }
}
