const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');

const port = 3000;

const OPENWEATHERMAP_API_KEY = '1ccf1e75f449adf7d0bd5a53e341a53c';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb://172.17.0.3:27017/meteo');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', function() {
  console.log('Connecté à la base de données MongoDB');
});

const MeteoSchema = new mongoose.Schema({
    nom: String,
    temp: Number,
    description: String
  });

  const Meteo = mongoose.model('Meteo', MeteoSchema);



app.get('/', async (req, res) => {
    const VILLES = [
        { nom: 'Casablanca'},
        { nom: 'Rabat'}
    ];
    try {
        const meteoData = await Promise.all(VILLES.map(async (ville) => {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ville.nom},ma&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
            const data = await response.data;
            return {
                nom: data.name,
                temp: data.main.temp,
                description: data.weather[0].description
            };
        }));
        res.render('meteo', { villes: meteoData });
    } catch (error) {
        console.error('Erreur lors de la récupération des données météorologiques :', error);
        res.status(500).send('Une erreur est survenue lors de la récupération des données météorologiques.');
    }
    
});

app.post('/stocker', async (req, res) => {
    try {
        const { nom, temp, description } = req.body;

        // Création d'une nouvelle instance du modèle avec les données reçues
        const nouvelleMeteo = new Meteo({
            nom: nom,
            temp: temp,
            description: description
        });

        // Sauvegarde de l'instance dans la base de données
        await nouvelleMeteo.save();
        res.status(200).send('Données météorologiques stockées avec succès dans la base de données.');
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données météorologiques :', error);
        res.status(500).send('Une erreur est survenue lors de la sauvegarde des données météorologiques.');
    }
    
});

app.get('/meteo', async (req, res) => {
    try {
        // Récupérer toutes les données météorologiques depuis la base de données
        const meteos = await Meteo.find({});
        // Rendre la vue avec les données récupérées
        res.render('afficherMeteo', { meteos: meteos });
    } catch (error) {
        console.error('Erreur lors de la récupération des données météorologiques depuis la base de données :', error);
        res.status(500).send('Une erreur est survenue lors de la récupération des données météorologiques depuis la base de données.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
