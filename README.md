# Guided Practice - Party Planner

This guided practice uses the same party API as the previous workshop. A list of all parties is shown. When a user clicks on a specific party, the page is updated to show the details of that party. The selected party persists even if the user refreshes the page.

Your main task is to show a list of all the guests for the selected party.

Read [the API documentation](https://fsa-async-await.herokuapp.com/api/). You will be working with the `/events`, `/guests`, and `/rsvps` endpoints.

## Prompts

The answers can be viewed directly below the respective prompt. The `solution` branch contains the final code.

1. Write `getGuests()`. The goal is to make a GET request to the `guests` endpoint and update state with the response data. You can check `state` in the console to see if the data is successfully fetched.

   <details>
   <summary>Show Answer</summary>

   ```js
   async function getGuests() {
     try {
       const response = await fetch(API + "/guests");
       const json = await response.json();
       state.guests = json.data;
     } catch (error) {
       console.error(error);
     }
   }
   ```

   </details>

2. Refactor `renderGuests()` to render the list of guests for the selected party. The guest list should show the name, email, and phone number of each attending guest. This will require you to look through the RSVPs for the selected party and find the guests that are attending. Use array methods like `filter`, `map`, and `includes`!

   <details>
   <summary>Show Answer</summary>

   ```js
   function renderGuests() {
     $guests.hidden = false;

     // Get guests for the current party
     const rsvps = state.rsvps.filter(
       (rsvp) => rsvp.eventId === state.event.id
     );
     const guestIds = rsvps.map((rsvp) => rsvp.guestId);
     const guests = state.guests.filter((guest) => guestIds.includes(guest.id));

     if (!guests.length) {
       $guestList.innerHTML = "<li>No guests yet!</li>";
       return;
     }

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
   ```

   </details>
