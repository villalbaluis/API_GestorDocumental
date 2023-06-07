/**
 * Inicializamos la aplicación a través del
 * archivo app, encargado de instanciar los llamados
*/
const app = require('./app.js');

const port = app.get('port');

app.listen(port, () => {
  console.log(`API corriendo a través del puerto: ${port}`);
});
