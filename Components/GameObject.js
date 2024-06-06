import { Sprite } from "./Sprite.js";
import { OverworldEvent } from "./OverworldEvent.js";

export class GameObject {
    // Constructor for the GameObject class
    // Initialises the properties of the game object
    constructor(config) {
        this.id = null; // ID of the game object
        this.isMounted = false; // Flag indicating whether the game object is mounted
        this.x = config.x || 0; // X-coordinate of the game object
        this.y = config.y || 0; // Y-coordinate of the game object
        this.direction = config.direction || "down"; // Direction of the game object
        // Sprite representing the game object
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/images/characters/people/hero.png", // Source image for the sprite
        });

        this.behaviorLoop = config.behaviorLoop || []; // Array of behaviour loop events for the game object
        this.behaviorLoopIndex = 0; // Index to track the current behaviour loop event
        this.talking = config.talking || []; // Array of talking events for the game object
        this.retryTimeout = null; // Timeout references for retrying behavior events
    }

    // Mounts the game object onto a map
    mount(map) {
        this.isMounted = true; // Set isMounted flag to true
        // If we have a behaviour loop, initialise after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map); // Call doBehaviorEvent method after a delay
        }, 10);
    }

    // Updates the game object
    update() {
        // Placeholder for updating the game object
    }

    // Execute the behaviour events associated  with the game object
    // Triggers behaviour events in a loop until interrupted or completed
    async doBehaviorEvent(map) {
        // Don't do anything if there is a more important cutscene or if there is no behavior to perform
        if (this.behaviorLoop.length === 0) {
            return;
        }
        if (map.isCutscenePlaying) {
            // Retry the behaviour event after a timeout if a cutscene is playing
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(map);
            }, 1000);
            return;
        }

        // Set up the next behaviour event with relevant information
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id; // Assign the game object's ID to the event

        // Create an instance of the OverworldEvent class with the next event configurations
        const eventHandler = new OverworldEvent({ map, event: eventConfig });
        await eventHandler.init(); // Initialise the event

        // Set up the index for the next behaviour event, looping back to the beginning if necessary
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }

        //Continue executing behaviour events in a loop
        this.doBehaviorEvent(map);
    }
}
