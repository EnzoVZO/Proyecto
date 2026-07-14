require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/calificaciones_tributarias_db').then(async () => {
    const C = require('./models/Calificacion');
    try {
        const cals = await C.find({ estado: { $ne: 'ELIMINADO' } }).sort({ createdAt: -1 });
        console.log('Fetched:', cals.length);
        console.log(JSON.stringify(cals));
    } catch(e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
});
