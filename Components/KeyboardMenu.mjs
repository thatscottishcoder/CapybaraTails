import { KeyPressListener } from "./KeyPressListener.mjs";

export class KeyboardMenu {
    //  Constructor for the KeyboardMenu class
    constructor(config = {}) {
        this.options = []; // Array to store menu options
        this.up = null; // Key press listener for the "up" arrow key
        this.down = null; // Key press listener for the "down" arrow key
        this.prevFocus = null; // Reference to the previously focused button
        this.descriptionContainer = config.descriptionContainer || null; // Container element for menu descriptions
    }

    // Method to set menu options
    setOptions(options) {
        // Update the options array and render the menu HTML
        this.options = options;
        this.element.innerHTML = this.options
            .map((option, index) => {
                const disabledAttr = option.disabled ? "disabled" : "";
                return `
                    <div class="option">
                        <button ${disabledAttr} data-button="${index}" data-description="${option.description}">
                        ${option.label}
                        </button>
                        <span class="right">${option.right ? option.right() : ""}</span>
                    </div>
                `;
            })
            .join("");

        // Add event listeners to menu buttons
        this.element.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                const chosenOption = this.options[Number(button.dataset.button)];
                chosenOption.handler(); // Call the handler function for the chosen option
            });
            button.addEventListener("mouseenter", () => {
                button.focus(); // Focus on the button when mouse enters
            });
            button.addEventListener("focus", () => {
                this.prevFocus = button; // Update the previously focused button
                this.descriptionElementText.innerText = button.dataset.description; // Update the description text
            });
        });

        // Focus on the first button after a short delay
        setTimeout(() => {
            this.element.querySelector("button[data-button]:not([disabled])").focus();
        }, 10);
    }

    // Method to create the menu element
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("KeyboardMenu");

        // Create description box element
        this.descriptionElement = document.createElement("div");
        this.descriptionElement.classList.add("DescriptionBox");
        this.descriptionElement.innerHTML = `<p>I will provide information!</p>`;
        this.descriptionElementText = this.descriptionElement.querySelector("p");
    }

    // Method to end the menu
    end() {
        // Remove menu and description elements
        this.element.remove();
        this.descriptionElement.remove();

        // Clean up key press listener bindings
        this.up.unbind();
        this.down.unbind();
    }

    // Method to initialise the menu
    init(container) {
        // Create menu and description elements, and append them to the container
        this.createElement();
        (this.descriptionContainer || container).appendChild(this.descriptionElement);
        container.appendChild(this.element);

        // Set up key press listeners for up and down arrow keys
        this.up = new KeyPressListener("ArrowUp", () => {
            // Move focus to the previous button
            const current = Number(this.prevFocus.getAttribute("data-button"));
            const prevButton = Array.from(this.element.querySelectorAll("button[data-button]"))
                .reverse()
                .find((el) => {
                    return el.dataset.button < current && !el.disabled;
                });
            prevButton?.focus();
        });
        this.down = new KeyPressListener("ArrowDown", () => {
            // Move focus to the next button
            const current = Number(this.prevFocus.getAttribute("data-button"));
            const nextButton = Array.from(this.element.querySelectorAll("button[data-button]")).find((el) => {
                return el.dataset.button > current && !el.disabled;
            });
            nextButton?.focus();
        });
    }
}
