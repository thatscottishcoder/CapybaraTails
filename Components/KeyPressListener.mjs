export class KeyPressListener {
    constructor(keyCode, callback) {
        // Flag to ensure callback is triggered only once per key press
        let keySafe = true;
        // Function to handle keydown event
        this.keyDownFunction = function (event) {
            // Check if the pressed key matches the provided keyCode
            if (event.code === keyCode) {
                // Ensure the callback is triggered only if the key is safe
                if (keySafe) {
                    keySafe = false; // Set key as unsafe to prevent multiple callback functions
                    callback(); // Execute the provided callback function
                }
            }
        };
        // Function to handle keyup event
        this.keyUpFunction = function (event) {
            // Reset key safety flag when key is released
            if (event.code === keyCode) {
                keySafe = true; // Set key as safe for next press
            }
        };

        // Add event listeners for keydown and keyup events
        document.addEventListener("keydown", this.keyDownFunction);
        document.addEventListener("keyup", this.keyUpFunction);
    }

    // Method to unbind the event listeners
    unbind() {
        // Remove event listeners for keydown and keyup events
        document.removeEventListener("keydown", this.keyDownFunction);
        document.removeEventListener("keyup", this.keyUpFunction);
    }
}
