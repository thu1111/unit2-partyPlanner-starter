const COHORT = "2310-GHP-ET-WEB-FT-SF";
const API = "https://fsa-crud-2aa9294fe819.herokuapp.com/api/" + COHORT;

const state = {
  events: [],
  event: null,
  guests: [],
  rsvps: [],
};

// The $ prefix is used here to denote variables that reference DOM elements
const $eventList = document.querySelector("#eventList");
const $eventDetails = document.querySelector("#eventDetails");
const $guests = document.querySelector("#guests");
const $guestList = document.querySelector("#guestList");
const $form = document.querySelector('form');
let $delete;

window.addEventListener("hashchange", selectEvent);
$form.addEventListener("submit", addEvent);

/**
 * Update state with data from the API and the DOM to reflect current state
 */
async function render() {
  await getEvents();
  await getGuests();
  await getRsvps();

  renderEvents();
  selectEvent();
}

render();

/**
 * Show details about the currently selected event
 */
function selectEvent() {
  getEventFromHash();
  renderEventDetails();
}

/**
 * Find the event that matches the current hash to update state
 */
function getEventFromHash() {
  // We need to slice the # off
  const id = window.location.hash.slice(1);
  state.event = state.events.find((event) => event.id === +id);
}

/**
 * GET the list of guests from the API to update state
 */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const json = await response.json();
    state.guests = json.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Render the list of guests for the currently selected event
 */
function renderGuests() {
  $guests.hidden = false;

  // Get guests for the current party
  const rsvps = state.rsvps.filter((rsvp) => rsvp.eventId === state.event.id);
  const guestIds = rsvps.map((rsvp) => rsvp.guestId);
  const guests = state.guests.filter((guest) => guestIds.includes(guest.id));

  if (!guests.length) {
    $guestList.innerHTML = "<li>No guests yet!</li>";
    return;
  }

  // Render the attending guests
  const guestList = guests.map((guest) => {
    const guestInfo = document.createElement("li");
    guestInfo.innerHTML = `
      <span>${guest.name}</span>
      <span>${guest.email}</span>
      <span>${guest.phone}</span>
    `;
    return guestInfo;
  });

  $guestList.replaceChildren(...guestList);
}

// === No need to edit anything below this line! ===

/**
 * GET the list of events from the API to update state
 */
async function getEvents() {
  try {
    const response = await fetch(API + "/events");
    const json = await response.json();
    state.events = json.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * GET the list of rsvps from the API to update state
 */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const json = await response.json();
    state.rsvps = json.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Update `$eventList` to reflect the current state
 */
function renderEvents() {
  const events = state.events.map(renderEvent);
  $eventList.replaceChildren(...events);
}

/**
 * @param {Event} event the event to render
 * @returns {HTMLElement} an article element representing the event
 */
function renderEvent(event) {
  const article = document.createElement("article");
  const date = event.date.slice(0, 10);

  article.innerHTML = `
    <h3><a href="#${event.id}">${event.name} #${event.id}</a></h3>
    <time datetime="${date}">${date}</time>
    <address>${event.location}</address>
  `;

  return article;
}

/**
 * Render details about the currently selected event
 */
function renderEventDetails() {
  if (!state.event) {
    $eventDetails.innerHTML = "<p>Select a event to see more.</p>";
    $guests.hidden = true;
    return;
  }

  const date = state.event.date.slice(0, 10);

  $eventDetails.innerHTML = `
    <h2>${state.event.name} #${state.event.id}</h2>
    <time datetime="${date}">${date}</time>
    <address>${state.event.location}</address>
    <p>${state.event.description}</p>
    <button id="delete">Delete Event</button>
  `;


  $delete = document.querySelector('#delete');
  $delete.addEventListener("click", deleteEvent);

  renderGuests();
}

async function addEvent(event) {
  event.preventDefault();
  let date = new Date(event.target.date.value);

  try {
    const response = await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: event.target.name.value,
        description: event.target.description.value,
        date: date.toISOString(), // Date ISO string
        location: event.target.location.value
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

    event.target.name.value = '';
    event.target.description.value = '';
    event.target.date.value = '';
    event.target.location.value = '';

    render();
  } catch (error) {
    console.error(error);
  }
}

async function deleteEvent(event) {
  event.preventDefault();
  console.log('delete')
  try {
    const response = await fetch(`${API}/events/${state.event.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({
      //   name: event.target.name.value,
      //   description: event.target.description.value,
      //   date: date.toISOString(), // Date ISO string
      //   location: event.target.location.value
      // }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete event");
    }

    render();
  } catch (error) {
    console.error(error);
  }
}
