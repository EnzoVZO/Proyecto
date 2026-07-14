require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir frontend estático para que el sistema funcione out-of-the-box
app.use(express.static(path.join(__dirname, '../codigo_fuente')));

// MongoDB Connection
// Asumimos local o Atlas dependiendo de process.env.MONGO_URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calificaciones_tributarias_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('[INFO] Conectado a MongoDB (Encriptacion en Reposo Activada)'))
  .catch(err => {
      console.error('[ERROR] Error conectando a MongoDB:', err.message);
      console.log('[NOTA] Si no tienes MongoDB instalado localmente, necesitas configurar MONGO_URI en el archivo .env con una ruta a MongoDB Atlas.');
  });

// Rutas API
app.use('/api/calificaciones', require('./routes/calificaciones'));
app.use('/api/auditoria', require('./routes/auditoria'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Health check HTTPS
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Conexion HTTPS Segura y Encriptada.' });
});

// Levantar HTTPS
try {
    const options = {
        pfx: fs.readFileSync('server.pfx'),
        passphrase: 'password'
    };
    const PORT = process.env.PORT || 3000;
    https.createServer(options, app).listen(PORT, () => {
        console.log(`[INFO] Servidor HTTPS seguro corriendo en puerto ${PORT}`);
        console.log(`       Ruta base: https://localhost:${PORT}`);
    });
} catch (e) {
    console.error('[ERROR] Error al cargar certificados SSL:', e.message);
}
