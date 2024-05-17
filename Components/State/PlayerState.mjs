export class PlayerState {
    // Constructor for the PlayerState class
    // Initialises the player's pizzas, lineup, items, and story flags
    constructor() {
        // Initialise pizzas with default values
        this.pizzas = {
            p1: {
                pizzaId: "s001", // ID of the pizza
                hp: 50, // Current health points
                maxHp: 50, // Maximum health points
                xp: 0, // Current experience points
                maxXp: 100, // Maximum experience points for the current level
                level: 1, // Current level
                status: null, // Status effects
            },
        };
        this.lineup = ["p1"]; // Initial lineup
        this.items = [
            {
                actionId: "item_recoverHp", // Action associated with the item
                instanceId: "item1", // Unique instance ID of the item
            },
            {
                actionId: "item_recoverHp", // Action associated with the item
                instanceId: "item2", // Unique instance ID of the item
            },
            {
                actionId: "item_recoverHp", // Action associated with the item
                instanceId: "item3", // Unique instance ID of the item
            },
        ];
        this.storyFlags = {}; // Flags to track story progression
    }

    // Adds a new pizza to the player's state
    // Generates a unique ID for the new pizza and adds it to the lineup if there's space
    addPizza(pizzaId) {
        const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999); // Generate a unique ID
        this.pizzas[newId] = {
            pizzaId,
            hp: 50, // Initial health points
            maxHp: 50, // Maximum health points
            xp: 75, // Initial experience points
            maxXp: 100, // Maximum experience points for the current level
            level: 1, // Initial level
            status: null, // No status effects initially
        };
        if (this.lineup.length < 3) {
            this.lineup.push(newId); // Add to lineup if there's space
        }
        utils.emitEvent("LineupChanged"); // Emit event for lineup change
    }

    // Swaps a pizza in the lineup with another pizza
    swapLineup(oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId); // Find the index of the old pizza
        this.lineup[oldIndex] = incomingId; // Replace it with the new pizza
        utils.emitEvent("LineupChanged"); // Emit event for lineup change
    }

    // Moves a pizza to the front of the lineup
    moveToFront(futureFrontId) {
        this.lineup = this.lineup.filter((id) => id !== futureFrontId); // Remove the pizza from its current position
        this.lineup.unshift(futureFrontId); // Add it to the front of the lineup
        utils.emitEvent("LineupChanged"); // Emit event for lineup change
    }
}
// Create a new instance of PlayerState and assign it to the global window object for easy access
window.playerState = new PlayerState();
