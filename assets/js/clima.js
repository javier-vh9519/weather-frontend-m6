// Entrada legacy: delega a la version modular ES6.
import("./main.js").catch((error) => {
  console.error("No se pudo iniciar la app de clima:", error);
});
