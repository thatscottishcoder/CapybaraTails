class TextMessage {
    constructor({ text, onComplete}) {
        // Initialise properties of the TextMessage object
        this.text = text; // Text content of the message
        this.onComplete = onComplete; // Callback function to execute when message is complete
        this.element = null; // HTML element for the message
    }

    // Method to create the HTML element for the text message
    createElement() {
        // Create the element
        this.element = document.createElement("div");
        // Add CSS class for styling
        this.element.classList.add("TextMessage");

        // Set inner HTML of the element with text content and a button for interaction
        this.element.innerHTML = (`
            <p class="TextMessage_p"></p>
            <button class="TextMessage_button">Next</button>
        `);

        // Create a new instance of RevealingText to reveal text within an element
        this.revealingText = new RevealingText({
            // Specify the element where the revealing text will be displayed
            element: this.element.querySelector(".TextMessage_p"),
            // Provide the text to be revealed
            text: this.text
        });

        // Add event listener to the button for closing the text message
        this.element.querySelector("button").addEventListener("click", () => {
            // Close the text message when the button is clicked
            this.done();
        });

        this.actionListener = new KeyPressListener("Enter", () => {
            // Execute the 'done' method
            this.done();
        });
    }

    // Method to remove the text message element and execute onComplete callback
    done() {
        // Check if revealing text is already completed
        if(this.revealingText.isDone) {
            // If revealing text is done, remove the HTML element from the DOM
            this.element.remove();
            // Unbind the actionListener to prevent further triggering
            this.actionListener.unbind();
            // Execute the callback function provided
            this.onComplete();
        } else {
            // If revealing text is not done, instantly reveal the remaining text
            this.revealingText.warpToDone();
        } 
    }

    // Method to initialise the text message by creating the element and appending it to a container
    init(container) {
        // Create the HTML element for the text message
        this.createElement();
        // Append the element to the specified container
        container.appendChild(this.element);
        // Initialise the revealingText method
        this.revealingText.init();
    }
}