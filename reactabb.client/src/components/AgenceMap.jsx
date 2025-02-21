/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importez le CSS de Leaflet

const AgenceMap = () => {
    const [agences, setAgences] = useState([]);
    const mapRef = useRef(null); // R�f�rence pour la carte Leaflet

    // Liste des adresses des agences
    const adressesAgences = [
        "Caisse d'Epargne Antananarivo, Madagascar",
        "Caisse d'Epargne Toamasina, Madagascar",
        "Caisse d'Epargne Fianarantsoa, Madagascar",
        // Ajoutez d'autres adresses ici
    ];

    // Fonction pour r�cup�rer les coordonn�es d'une adresse
    const getCoordinates = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();
            if (data.length > 0) {
                return {
                    nom: address,
                    adresse: address,
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                };
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la r�cup�ration des coordonn�es:', error);
            return null;
        }
    };

    // R�cup�rer les coordonn�es de toutes les agences
    useEffect(() => {
        const fetchAgences = async () => {
            const agencesAvecCoordonnees = [];
            for (const adresse of adressesAgences) {
                const coordonnees = await getCoordinates(adresse);
                if (coordonnees) {
                    agencesAvecCoordonnees.push(coordonnees);
                }
            }
            setAgences(agencesAvecCoordonnees);
        };

        fetchAgences();
    }, []);

    // Initialiser la carte une fois que les agences sont charg�es
    useEffect(() => {
        if (agences.length > 0 && !mapRef.current) {
            // Cr�ez une carte centr�e sur Madagascar
            const map = L.map('map').setView([-18.766947, 46.869107], 6);

            // Ajoutez une couche de tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '� OpenStreetMap contributors'
            }).addTo(map);

            // Ajoutez des marqueurs pour chaque agence
            agences.forEach(agence => {
                const marker = L.marker([agence.latitude, agence.longitude]).addTo(map);

                // Cr�ez un popup pour afficher les d�tails de l'agence
                const popup = L.popup().setContent(`
                    <h3>${agence.nom}</h3>
                    <p>${agence.adresse}</p>
                `);

                // Gestion des �v�nements de survol
                marker.on('mouseover', () => {
                    marker.bindPopup(popup).openPopup(); // Affichez le popup au survol
                });

                marker.on('mouseout', () => {
                    marker.closePopup(); // Fermez le popup lorsque le curseur quitte le marqueur
                });
            });

            // Stockez la r�f�rence de la carte
            mapRef.current = map;
        }

        // Nettoyage lors du d�montage du composant
        return () => {
            if (mapRef.current) {
                mapRef.current.remove(); // D�truire la carte
                mapRef.current = null;
            }
        };
    }, [agences]); // D�pendance sur `agences`

    return (
        <div>
            <h1>Agences Caisse d&apos;&Eacute;pargne de Madagascar</h1>
            <div id="map" style={{ height: '400px', width: '50%' }}></div>
        </div>
    );
};

export default AgenceMap;