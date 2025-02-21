import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import Logo from "../../assets/logo.png";

function Home() {
  const baseURL = "https://didlydoo-at29.onrender.com";
  //const baseURL = "http://localhost:3000";
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendeesAndEvents, setAttendeesAndEvents] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  //Calcul du nombre de participants pour un événement
  function getTotalParticipants(event) {
    const uniqueParticipants = new Set();

    event.dates?.forEach((date) => {
      date.attendees?.forEach((attendee) => {
        if (attendee.available) {
          uniqueParticipants.add(attendee.name);
        }
      });
    });

    return uniqueParticipants.size;
  }

  //Suppression d'un événement
  const handleRemoveEvent = async (eventToRemove) => {
    const confirmDelete = window.confirm(`Etes-vous sûr de vouloir supprimer l'événement :\n"${eventToRemove.name}" ?`);

    if (!confirmDelete) return; //Annuler la suppression de l'événement si l'utilisateur clique sur Annuler
    try {
      const routeURL = `/api/events/${eventToRemove.id}`;
      await axios.delete(baseURL + routeURL);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToRemove.id));
      //alert("Événement supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement: ", error);
      alert("Impossible de supprimer l'événement.");
    }
  };

  //Liste les participants et les événements associés
  const handleShowAttendeeAndEvents = async () => {
    if (loadingAttendees) return; //Pour empêcher le clic intempestif

    setShowAttendees(!showAttendees); //Toggle de l'affichage

    if (!showAttendees) {
      setLoadingAttendees(true);

      try {
        const routeURL = "/api/attendees";
        const response = await axios.get(baseURL + routeURL);

        const participants = response.data
          .filter((participant) => participant.events?.length > 0)
          .map((participant) => ({
            name: participant.name,
            events: participant.events.map((event) => event.name),
          }));

        setAttendeesAndEvents(participants);

        //alert("Données chargées avec succès !");
      } catch (error) {
        console.error("Erreur lors du chargement des données: ", error);
        alert("Impossible de charger les données.");
      }
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    const routeURL = "/api/events";
    axios
      .get(baseURL + routeURL)
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur de chargement du fichier JSON:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des événements...</p>;

  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <>
      <div id="event-card">
        <div className="header">
          <img src={Logo} className="logo" alt="DidlyDoo" />
          <h1>Liste des événements</h1>
          <Link to="/api/event">
            <button className="create-event-button">Créer un événement</button>
          </Link>
        </div>
        <div className="event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-card">
                <p>{new Date(event.created_at).toLocaleDateString()}</p>
                <h2>
                  <Link to={`/api/events/${event.id}`}>{event.name.length > 16 ? event.name.slice(0, 16) + "..." : event.name}</Link>
                </h2>
                <p>Participants : {getTotalParticipants(event)}</p>
                <button onClick={() => handleRemoveEvent(event)}>Effacer</button>
              </div>
            ))
          ) : (
            <p>Aucun événement trouvé.</p>
          )}
        </div>
      </div>

      <br />
      <Link to="#" onClick={handleShowAttendeeAndEvents}>
        {showAttendees ? "Masquer les participants" : "Voir les participants et événements"}
      </Link>

      {showAttendees && (
        <div className="participant-container">
          <h2>Liste des Participants</h2>

          {loadingAttendees ? (
            <p>Chargement des participants...</p>
          ) : attendeesAndEvents.length > 0 ? (
            <div className="participant-grid">
              {attendeesAndEvents.map((a, index) => (
                <div key={index} className="participant-card">
                  <strong>{a.name}</strong>
                  <ul className="event-list">
                    {a.events.map((event, eventIndex) => (
                      <li key={eventIndex}>{event}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucun participant avec une date sélectionnée.</p>
          )}
        </div>
      )}
    </>
  );
}

export default Home;
