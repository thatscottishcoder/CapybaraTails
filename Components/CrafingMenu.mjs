import { KeyboardMenu } from "./KeyboardMenu.mjs";

export class CraftingMenu {
    // Constructor for the CraftingMenu class
    constructor({ pizzas, onComplete }) {
        this.pizzas = pizzas; // Array of pizza IDs available for crafting
        this.onComplete = onComplete; // Callback function to call when crafting is complete
    }

    // Generates crafting options based on available pizzas
    getOptions() {
        return this.pizzas.map((id) => {
            const base = Pizzas[id]; // Retrieve pizza details from the Pizzas object
            return {
                label: base.name, // Display name of the pizza
                description: base.description, // Description of the pizza
                handler: () => {
                    playerState.addPizza(id); // Add the selected pizza to the player's state
                    this.close(); // Closing the crafting menu after selection
                },
            };
        });
    }

    // Create the HTML element for the crafting menu
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("CraftingMenu"); // Add CSS class for styling
        this.element.classList.add("overlayMenu"); // Add CSS class for overlay effect
        this.element.innerHTML = `<h2>Create a Pizza`; // HTML content for the menu header
    }

    // Closes the crafting menu
    close() {
        this.keyboardMenu.end(); // End keyboard menu interaction
        this.element.remove(); // Remove the HTML element from the DOM
        this.onComplete(); // Call the completion callback function
    }

    // Initialises the crafting meu
    init(container) {
        this.createElement(); // Create the HTML element for the crafting menu
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container, // Set the container for menu description
        });
        this.keyboardMenu.init(this.element); // Initialise keyboard menu with the crafting menu element
        this.keyboardMenu.setOptions(this.getOptions()); // Set crafting options for the keyboard menu
        container.appendChild(this.element); // Append the crafting menu element to the container
    }
}
