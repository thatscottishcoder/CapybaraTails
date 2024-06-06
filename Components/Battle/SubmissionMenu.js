import { KeyboardMenu } from "../KeyboardMenu.js";

export class SubmissionMenu {
    // Constructor for the SubmissionMenu
    constructor({ caster, enemy, onComplete, items, replacements }) {
        this.caster = caster; // The combatant performing the action
        this.enemy = enemy; // The opposing combatant
        this.replacements = replacements; // Array of possible replacements
        this.onComplete = onComplete; // Callback function to execute when an action is selected

        // Map to keep track of item quantities
        let quantityMap = {};
        items.forEach((item) => {
            if (item.team === caster.team) {
                let existing = quantityMap[item.actionId];
                if (existing) {
                    existing.quantity += 1;
                } else {
                    quantityMap[item.actionId] = {
                        actionId: item.actionId,
                        quantity: 1,
                        instanceId: item.instanceId,
                    };
                }
            }
        });
        this.items = Object.values(quantityMap); // Array of items with quantities
    }

    // Generate the pages for the menu
    getPages() {
        const backOption = {
            label: "Go Back",
            description: "Return to previous page",
            handler: () => {
                this.keyboardMenu.setOptions(this.getPages().root); // Return to the root page
            },
        };

        return {
            root: [
                {
                    label: "Attack",
                    description: "Choose an attack",
                    handler: () => {
                        //Do something when chosen...
                        this.keyboardMenu.setOptions(this.getPages().attacks); // Go to attacks page
                    },
                },
                {
                    label: "Items",
                    description: "Choose an item",
                    handler: () => {
                        //Go to items page...
                        this.keyboardMenu.setOptions(this.getPages().items); // Go to items page
                    },
                },
                {
                    label: "Swap",
                    description: "Change to another pizza",
                    handler: () => {
                        //See pizza options
                        this.keyboardMenu.setOptions(this.getPages().replacements); // Go to replacements page
                    },
                },
            ],
            attacks: [
                ...this.caster.actions.map((key) => {
                    const action = Actions[key];
                    return {
                        label: action.name, // Label for the attack
                        description: action.description, // Description for the attack
                        handler: () => {
                            this.menuSubmit(action); // Submit the selected attack
                        },
                    };
                }),
                backOption, // Option to go back to the root page
            ],
            items: [
                ...this.items.map((item) => {
                    const action = Actions[item.actionId];
                    return {
                        label: action.name, // Label for the item
                        description: action.description, // Description for the item
                        right: () => {
                            return "x" + item.quantity; // Display item quantity
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId); // Submit the selected item
                        },
                    };
                }),
                backOption, // Option to go back to the root page
            ],
            replacements: [
                ...this.replacements.map((replacement) => {
                    return {
                        label: replacement.name, // Label for the replacement
                        description: replacement.description, // Description for the replacement
                        handler: () => {
                            this.menuSubmitReplacement(replacement); // Submit the selected replacement
                        },
                    };
                }),
                backOption, // Option to go back to the root page
            ],
        };
    }

    // Handle the submission of a replacement
    menuSubmitReplacement(replacement) {
        this.keyboardMenu?.end(); // End the keyboard menu if it exists
        this.onComplete({
            replacement, // Execute the onComplete callback with the selected replacement
        });
    }

    // Handle the submission of an action
    menuSubmit(action, instanceId = null) {
        this.keyboardMenu?.end(); // End the keyboard menu if it exists
        this.onComplete({
            action, // The selected action
            target: action.targetType === "friendly" ? this.caster : this.enemy, // Determine the target based on action type
            instanceId, // The instance ID of the item being used (if any)
        });
    }

    // Automatically decide the action to take (used for AI)
    decide() {
        const randomActionIndex = Math.floor(Math.random() * this.caster.actions.length);
        const randomActionKey = this.caster.actions[randomActionIndex];
        const randomAction = Actions[randomActionKey];
        this.menuSubmit(randomAction); // Submit the randomly selected action
    }

    // Display the submission menu in the provided container
    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu(); // Create a new KeyboardMenu instance
        this.keyboardMenu.init(container); // Initialise the keyboard menu with the container
        this.keyboardMenu.setOptions(this.getPages().root); // Set the menu options to the root page
    }

    // Initialise the submission menu
    init(container) {
        if (this.caster.isPlayerControlled) {
            this.showMenu(container); // Show the menu for player-controlled combatants
        } else {
            this.decide(); // Automatically decide for AI combatants
        }
    }
}
