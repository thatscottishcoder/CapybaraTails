import { GameObject } from "./GameObject.mjs";

export class Person extends GameObject {
    constructor(config) {
        // Call the constructor of the base class
        super(config);
        // Initialise properties specific to Person objects
        this.movingProgressRemaining = 0;
        // Indicates if the person is currently standing still
        this.isStanding = false;
        // Indicates if the person is player-controlled
        this.isPlayerControlled = config.isPlayerControlled || false;
        // Object to update position based on direction
        this.directionUpdate = {
            up: ["y", -1], // Update y-coordinate for moving up
            down: ["y", 1], // Update y-coordinate for moving down
            left: ["x", -1], // Update x-coordinate for moving left
            right: ["x", 1], // Update x-coordinate for moving right
        };
    }

    // Update method for Person objects
    update(state) {
        if (this.movingProgressRemaining > 0) {
            // Update position if there's remaining movement progress
            this.updatePosition();
        } else {
            // More cases for starting to walk will come here
            //
            //

            // Check conditions for starting movement or standing idle
            if (
                // Not in a cutscene
                !state.map.isCutscenePlaying &&
                // Player-controlled character
                this.isPlayerControlled &&
                // Arrow key pressed
                state.arrow
            ) {
                this.startBehavior(state, {
                    // Start walking behavior
                    type: "walk",
                    // Set direction based on arrow key pressed
                    direction: state.arrow,
                });
            }
            // Update sprite based on current state
            this.updateSprite(state);
        }
    }

    // Method to initiate a behavior for the person
    startBehavior(state, behavior) {
        // Set character direction based on behavior
        this.direction = behavior.direction;

        // Execute behavior based on type
        if (behavior.type === "walk") {
            // Check if space is free to move
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
                // Retry after a short delay if space is not free
                behavior.retry &&
                    setTimeout(() => {
                        this.startBehavior(state, behavior);
                    }, 10);

                return;
            }

            // Ready to walk - update position and initiate movement
            state.map.moveWall(this.x, this.y, this.direction);
            // Arbitrary value indicating movement duration
            this.movingProgressRemaining = 16;
            // Update sprite to reflect walking animation
            this.updateSprite(state);
        }

        if (behavior.type === "stand") {
            // Set character to stand still for a specified duration
            this.isStanding = true; // Set standing flag
            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    // Emit event when standing duration is complete
                    whoId: this.id,
                });
                // Reset standing flag
                this.isStanding = false;
            }, behavior.time);
        }
    }

    // Method to update position of the person during movement
    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        // Update position based on direction
        this[property] += change;
        // Decrement remaining movement progress
        this.movingProgressRemaining -= 1;

        if (this.movingProgressRemaining === 0) {
            // Emit event when movement is complete
            utils.emitEvent("PersonWalkingComplete", {
                // Emit event when walking is complete
                whoId: this.id,
            });
        }
    }

    // Method to update sprite animation based on current state
    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            // Set animation to walking if there's remaining movement progress
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }
        // Set animation to idle if not moving
        this.sprite.setAnimation("idle-" + this.direction);
    }
}
