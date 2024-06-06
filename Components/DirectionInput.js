export class DirectionInput {
    // Constructor for the DirectionInput class
    // Initialises the list of held directions and maps key codes to directions
    constructor() {
        // List to hold currently held directions
        this.heldDirections = [];
        // Mapping of key codes to directions
        this.map = {
            ArrowUp: "up", // Arrow key or 'W' key represents "up" direction
            KeyW: "up",
            ArrowDown: "down", // Arrow key or 'S' key represents "down" direction
            KeyS: "down",
            ArrowLeft: "left", // Arrow key or 'A' key represents "left" direction
            KeyA: "left",
            ArrowRight: "right", // Arrow key or 'D' key represents "right" direction
            KeyD: "right",
        };
    }

    // Gets the current direction based on held keys
    // Returns the first direction in the list of held directions
    get direction() {
        return this.heldDirections[0];
    }

    // Initialises the direction input by adding event listeners for keydown and keyup
    init() {
        // Event listener for keydown event
        document.addEventListener("keydown", (e) => {
            const dir = this.map[e.code]; // Get direction from key code
            // If direction is valid and not already in held direction list, add it to the beginning
            if (dir && this.heldDirections.indexOf(dir) === -1) {
                this.heldDirections.unshift(dir); // Add direction to beginning of the list
            }
        });
        // Event listener for keyup event
        document.addEventListener("keyup", (e) => {
            const dir = this.map[e.code]; // Get direction from key code
            const index = this.heldDirections.indexOf(dir); // Find index of direction in held direction list
            // If direction is found in held directions list, remove it
            if (index > -1) {
                this.heldDirections.splice(index, 1); // Remove direction from the list
            }
        });
    }
}
