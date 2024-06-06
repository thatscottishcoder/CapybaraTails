import { KeyboardMenu } from "../KeyboardMenu.js";

export class ReplacementMenu {
    // Constructor for the replacement menu
    constructor({ replacements, onComplete }) {
        this.replacements = replacements; // Array of possible replacements
        this.onComplete = onComplete; // Callback function to execute when a replacement is selected
    }

    // Automatically decide the replacement by selecting the first option
    decide() {
        this.menuSubmit(this.replacements[0]);
    }

    // Handle the submission of a replacement
    menuSubmit(replacement) {
        this.keyboardMenu?.end();
        this.onComplete(replacement);
    }

    // Display the replacement menu in the provided container
    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu(); // Create a new KeyboardMenu instance
        this.keyboardMenu.init(container); // Initialize the keyboard menu with the container
        this.keyboardMenu.setOptions(
            this.replacements.map((c) => {
                return {
                    label: c.name, // Label for the menu option
                    description: c.description, // Description for the menu option
                    handler: () => {
                        this.menuSubmit(c); // Handler to submit the selected replacement
                    },
                };
            })
        );
    }

    // Initialise the replacement menu
    init(container) {
        // If the first replacement is player-controlled, show the menu; otherwise, decide automatically
        if (this.replacements[0].isPlayerControlled) {
            this.showMenu(container); // Show the menu for player-controlled replacements
        } else {
            this.decide(); // Automatically decide for non-player-controlled replacements
        }
    }
}
