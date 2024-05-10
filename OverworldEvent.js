// Creates a new OverworldEvent object which represents an event happening in the overworld
class OverworldEvent {
    constructor({ map, event }) {
        this.map = map;
        this.event = event;
    }

    // Handles a "stand" event where a character stops moving
    stand(resolve) {
        // Get the game object representing the character involved in the event
        const who = this.map.gameObjects[this.event.who];
        // Trigger the character's "stand" behavior with event details
        who.startBehavior(
            {
                map: this.map,
            },
            {
                type: "stand",
                direction: this.event.direction,
                time: this.event.time,
            }
        );

        // Set up a listener for the "PersonStandComplete" event to resolve after the character finishes standing
        const completeHandler = (e) => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener(
                    "PersonStandComplete",
                    completeHandler
                );
                // Event completed, call the resolve function
                resolve();
            }
        };
        document.addEventListener("PersonStandComplete", completeHandler);
    }

    // Handles a "walk" event where a character movies in a specific direction
    walk(resolve) {
        // Get the game object representing the character involved in the event
        const who = this.map.gameObjects[this.event.who];
        // Trigger the character's "walk" behavior
        who.startBehavior(
            {
                map: this.map,
            },
            {
                type: "walk",
                direction: this.event.direction,
                // Allow retries if walking is interrupted
                retry: true,
            }
        );

        // Set up a listener for the "PersonWalkingComplete" event to resolve after the character finishes walking
        const completeHandler = (e) => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener(
                    "PersonWalkingComplete",
                    completeHandler
                );
                // Event completed, call the resolve function
                resolve();
            }
        };
        document.addEventListener("PersonWalkingComplete", completeHandler);
    }

    // Handles a "textMessage" event where a text message is displayed to the player
    textMessage(resolve) {
        // Check if the event includes facing a specific object
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero]; // Get the object to face
            obj.direction = utils.oppositeDirection(
                this.map.gameObjects["hero"].direction
            ); // Make the object face the opposite direction of the hero
        }
        // Create a new TextMessage object with the event text and completion callback
        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve(),
        });
        // Initialise the text message by attaching it to the game-container element
        message.init(document.querySelector(".game-container"));
    }

    // Method to change the map
    changeMap(resolve) {
        // Create a new scene transition instance
        const sceneTransition = new SceneTransition();
        // Initialise the scene transition, specifying the game container and a callback function
        sceneTransition.init(document.querySelector(".game-container"), () => {
            // Start the new map using the specified map configuration from the event
            this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
            // Resolve the change map event
            resolve();
            // Fade out the scene transition after resolving the change map event
            sceneTransition.fadeOut();
        });
    }

    // Method to initiate a battle sequence
    battle(resolve) {
        // Create a new Battle instance
        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            map: this.map,
            // Define a callback function to execute when the battle is complete
            onComplete: (didWin) => {
                // Once the battle is complete, resolve the battle event
                resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
            },
        });
        // Initialise the battle within the game container
        battle.init(document.querySelector(".game-container"));
    }

    pause(resolve) {
        this.map.isPaused = true;
        const menu = new PauseMenu({
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.overworld.startGameLoop();
            },
        });
        menu.init(document.querySelector(".game-container"));
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    craftingMenu(resolve) {
        const menu = new CraftingMenu({
            pizzas: this.event.pizzas,
            onComplete: () => {},
        });
        menu.init(document.querySelector(".game-container"));
    }

    // Stars the appropriate event handling based on the event type ("stand", "walk", or "textMessage")
    init() {
        return new Promise((resolve) => {
            // Call the appropriate method based on the event type
            this[this.event.type](resolve);
        });
    }
}
