export class Team {
    // Constructor for the Team class
    constructor(team, name) {
        this.team = team; // The identifier for the team
        this.name = name; // The name of the team
        this.combatants = []; // Array to hold the combatants in the team
    }

    // Creates the DOM element for the team and its combatants
    createElement() {
        this.element = document.createElement("div"); // Create a div element for the team
        this.element.classList.add("Team"); // Add the "Team" class to the element
        this.element.setAttribute("data-team", this.team); // Set the team identifier as a data attribute
        this.combatants.forEach((c) => {
            let icon = document.createElement("div"); // Create a div element for each combatant
            icon.setAttribute("data-combatant", c.id); // Set the combatant ID as a data attribute
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" viewBox="0 -0.5 7 10" shape-rendering="crispEdges">
                    <path stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M6 2h1M0 3h1M6 3h1M0 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                    <path stroke="#e2b051" d="M2 1h1M4 1h1M1 2h1M5 2h1M1 4h1M5 4h1M2 5h1M4 5h1" />
                    <path stroke="#ffd986" d="M3 1h1M2 2h3M1 3h5M2 4h3M3 5h1" />
                    
                    <!-- Active indicator appears when needed with CSS -->
                    <path class="active-pizza-indicator" stroke="#3a160d" d="M3 8h1M2 9h3" />
                    
                    <!-- Dead paths appear when needed with CSS -->
                    <path class="dead-pizza" stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M2 2h1M4 2h1M6 2h1M0 3h1M3 3h1M6 3h1M0 4h1M2 4h1M4 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                    <path class="dead-pizza" stroke="#9b917f" d="M2 1h3M1 2h1M5 2h1" />
                    <path class="dead-pizza" stroke="#c4bdae" d="M3 2h1M1 3h2M4 3h2M1 4h1M3 4h1M5 4h1M2 5h3" />
                </svg> 
            `;
            // Add the combatant icon to the team element
            this.element.appendChild(icon);
        });
    }

    // Updates the state of the combatant icons based on their HP and active status
    update() {
        this.combatants.forEach((c) => {
            const icon = this.element.querySelector(`[data-combatant="${c.id}"]`); // Get the icon element for the combatant
            icon.setAttribute("data-dead", c.hp <= 0); // Set data-dead attribute if combatant's HP is 0 or less
            icon.setAttribute("data-active", c.isActive); // Set data-active attribute if combatant is active
        });
    }

    // Initialise the team element and appends it to the container
    init(container) {
        this.createElement(); // Create the team element and combatant icons
        this.update(); // Update the state of the combatant icons
        container.appendChild(this.element); // Append the team element to the container
    }
}
