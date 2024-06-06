export class SceneTransition {
    constructor() {
        // Initialise element for scene transition
        this.element = null;
    }
    // Method to create the scene transition element
    createElement() {
        this.element = document.createElement("div");
        // Add CSS class for scene transition
        this.element.classList.add("SceneTransition");
    }

    // Method to fade out the scene transition element
    fadeOut() {
        // Add CSS class for fade-out effect
        this.element.classList.add("fade-out");

        // Remove the element from DOM after animation ends
        this.element.addEventListener(
            "animationend",
            () => {
                this.element.remove();
            },
            { once: true }
        );
    }

    // Method to initialise scene transition
    init(container, callback) {
        // Create the scene transition element
        this.createElement();
        // Append the element to the specified container
        container.appendChild(this.element);

        // Execute callback function after animation ends
        this.element.addEventListener(
            "animationend",
            () => {
                callback();
            },
            { once: true }
        );
    }
}
