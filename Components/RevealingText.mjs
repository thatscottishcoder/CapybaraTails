export class RevealingText {
    constructor(config) {
        // Initialise element to display the revealing text
        this.element = config.element;
        // Set the text to be revealed
        this.text = config.text;
        // Set the speed at which characters are revealed
        this.speed = config.speed || 70; // Default speed is 70 milliseconds
        // Initialise timeout variable for controlling revealing speed
        this.timeout = null;
        // Initialise flag to track is text revealing is complete
        this.isDone = false;
    }

    // Method to reveal one character at a time
    revealOneCharacter(list) {
        // Extract the next character to be revealed from the list
        const next = list.splice(0, 1)[0];
        // Add CSS class to reveal the letter
        next.span.classList.add("revealed");

        // If there are more characters to reveal
        if (list.length > 0) {
            // Set a timeout to reveal the next character after the specified delay
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list);
            }, next.delayAfter);
        } else {
            // If all characters have been revealed, set the isDone flat to true
            this.isDone = true;
        }
    }

    // Method to finalise the revealing text instantly
    warpToDone() {
        // Clear any existing timeout
        clearTimeout(this.timeout);
        // Set the isDone flag to true
        this.isDone = true;
        // Add the "revealed" class to all spans to instantly reveal the entire text
        this.element.querySelectorAll("span").forEach((s) => {
            s.classList.add("revealed");
        });
    }

    // Method to initialise the revealing text
    init() {
        // Initialise empty array to hold character elements and delays
        let characters = [];
        // Split the text into individual characters
        this.text.split("").forEach((character) => {
            // Create a span element for each character
            let span = document.createElement("span");
            // Set the text content of the span to the character
            span.textContent = character;
            // Append the span to the element for displaying the revealing text
            this.element.appendChild(span);

            // Determine delay after each character based on speed
            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed,
            });
        });
        // Start revealing characters one by one
        this.revealOneCharacter(characters);
    }
}
