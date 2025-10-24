const app = require('./app'); 
const PORT = 3000;

app.listen(PORT, (err) => {
    if (!err) {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    } else {
        console.error("Ha ocurrido un error y el servidor no ha iniciado:", err);
    }
});
