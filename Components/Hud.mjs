import { PlayerState } from "./State/PlayerState.mjs";
import { Combatant } from "./Battle/Combatant.mjs";

export class Hud {
    // Constructor for the Hud class
    constructor() {
        this.scoreboards = []; // Array to hold scoreboard elements
    }

    // Updates the content of the HUD
    update() {
        // Update each scoreboard element based on the player state data
        this.scoreboards.forEach((s) => {
            s.update(window.playerState.pizzas[s.id]); // Update scoreboard with relevant pizza data
        });
    }

    // Creates the HTML elements for the HUD
    createElement() {
        // Remove existing HUD elements and clear the scoreboard array
        if (this.element) {
            this.element.remove(); // Remove existing HUD element
            this.scoreboards = []; // Clear the scoreboard array
        }
        // Create a new div element for the HUD
        this.element = document.createElement("div");
        this.element.classList.add("Hud"); // Add CSS class to the HUD element

        // Retrieve player state data
        const playerState = window.playerState;
        // Iterate over the player's lineup of pizzas
        playerState.lineup.forEach((key) => {
            // Retrieve pizza data for the current lineup key
            const pizza = playerState.pizzas[key];
            // Check if the pizza data exists in the Pizzas object
            if (pizza) {
                // Create a new Combatant instance representing the pizza
                const scoreboard = new Combatant(
                    {
                        id: key,
                        ...Pizzas[pizza.pizzaId], // Spread pizza data from Pizzas object
                        ...pizza, // Spread additional pizza properties
                    },
                    null
                );

                // Create the HTML elements for the Combatant and add them to the HUD
                scoreboard.createElement(); // Create scoreboard element for the pizza
                this.scoreboards.push(scoreboard); // Add scoreboard element to the array
                this.element.appendChild(scoreboard.hudElement); // Append scoreboard element to HUD
            }
        });
        // Update the HUD with current data
        this.update();
    }

    // Initialises the HUD and attaches it to a container element
    init(container) {
        // Create HTML elements for the HUD
        this.createElement();
        // Append the HUD element to the specified container
        container.appendChild(this.element);
        // Listen for events indicating changes in player state or lineup
        document.addEventListener("PlayerStateUpdated", () => {
            this.update(); // Update the HUD when player state is updated
        });
        document.addEventListener("LineupChanged", () => {
            // Recreate the HUD elements when lineup changes
            this.createElement(); // Rebuild the HUD with updated lineup data
            container.appendChild(this.element); // Append the updated HUD to the container
        });
    }
}
