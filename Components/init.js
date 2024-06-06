import { Overworld } from "./Overworld.js";

// Immediately invoked function expression to initialise the overworld
(function () {
    // Create a new instance of the Overworld class
    const overworld = new Overworld({
        element: document.querySelector(".game-container"), // Specify the container element
    });
    // Initialise the overworld instance
    overworld.init();
})();
