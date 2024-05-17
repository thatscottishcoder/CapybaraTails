import { KeyPressListener } from "./KeyPressListener.mjs";
import { OverworldMap } from "./OverworldMap.mjs";
import { Hud } from "./Hud.mjs";
import { DirectionInput } from "./DirectionInput.mjs";
import { Progress } from "./Progress.mjs";

export class Overworld {
    constructor(config) {
        // Initialise properties of the Overworld
        this.element = config.element; // HTML element containing the game
        this.canvas = this.element.querySelector(".game-canvas"); // Canvas element for drawing
        this.ctx = this.canvas.getContext("2d"); // Context for drawing on the canvas
        this.map = null; // Reference to the game map
    }

    // Method to start the game loop for rendering and updating the game
    startGameLoop() {
        const step = () => {
            // Clear the canvas before rendering
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Establish the camera person for the current view
            const cameraPerson = this.map.gameObjects.hero;

            // Update all game objects
            Object.values(this.map.gameObjects).forEach((object) => {
                object.update({
                    // Arrow input for movement
                    arrow: this.directionInput.direction,
                    // Reference to the game map
                    map: this.map,
                });
            });

            // Draw the lower layer of the map
            this.map.drawLowerImage(this.ctx, cameraPerson);

            // Draw game objects sorted by their y-coordinates
            Object.values(this.map.gameObjects)
                .sort((a, b) => {
                    return a.y - b.y;
                })
                .forEach((object) => {
                    // Draw each game object sprite
                    object.sprite.draw(this.ctx, cameraPerson);
                });

            // Draw the upper layer of the map
            this.map.drawUpperImage(this.ctx, cameraPerson);

            if (!this.map.isPaused) {
                // Request the next animation frame
                requestAnimationFrame(() => {
                    // Repeat the rendering process recursively
                    step();
                });
            }
        };
        // Start the rendering loop
        step();
    }

    bindActionInput() {
        // Create a KeyPressListener for the "Enter" key
        new KeyPressListener("Enter", () => {
            // Call the checkForActionCutscene method of the map
            this.map.checkForActionCutscene();
        });
        new KeyPressListener("Escape", () => {
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([{ type: "pause" }]);
            }
        });
    }

    // Method to bind an event listener for checking the hero's position
    bindHeroPositionCheck() {
        // Add an event listener for the "PersonWalkingComplete" event
        document.addEventListener("PersonWalkingComplete", (e) => {
            // Check if the completed walk event is for the hero
            if (e.detail.whoId === "hero") {
                // Trigger the method to check for potential footstep cutscenes
                this.map.checkForFootstepCutscene();
            }
        });
    }

    startMap(mapConfig, heroInitialState = null) {
        // Create a new map using the provided configuration
        this.map = new OverworldMap(mapConfig);
        // Set a reference to the current overworld instance within the map
        this.map.overworld = this;
        // Mount game objects onto the map
        this.map.mountObjects();

        if (heroInitialState) {
            const { hero } = this.map.gameObjects;
            this.map.removeWall(hero.x, hero.y);
            this.map.gameObjects.hero.x = heroInitialState.x;
            this.map.gameObjects.hero.y = heroInitialState.y;
            this.map.gameObjects.hero.direction = heroInitialState.direction;
            this.map.addWall(hero.x, hero.y);
        }

        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    // Method to initialize the game
    init() {
        this.progress = new Progress();
        let initialHeroState = null;
        const saveFile = this.progress.getSaveFile();
        if (saveFile) {
            this.progress.load();
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            };
        }
        this.hud = new Hud();
        this.hud.init(document.querySelector(".game-container"));
        // Start the game with the DemoRoom map configuration
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

        // Bind input for action trigger
        this.bindActionInput();
        // Bind listener to check hero's position after walking
        this.bindHeroPositionCheck();

        // Initialise direction input for player control
        this.directionInput = new DirectionInput();
        // Initialise direction input
        this.directionInput.init();

        // Start the game loop for rendering and updating the game
        this.startGameLoop();
        // Start a cutscene with predefined events
        this.map.startCutscene([
            //     { who: "npcA", type: "walk", direction: "right" },
            //     { who: "npcA", type: "walk", direction: "right" },
            //     { who: "npcA", type: "walk", direction: "right" },
            //     { type: "textMessage", text: "Hey there, rookie.", faceHero: "npcA" },
            //     { type: "textMessage", text: "Welcome to Tony Boiii's, the beating heart of Cheesetopia's culinary scene." },
            //     { type: "textMessage", text: "I'm Chef Isabella, and around here, we take pizza seriously." },
            //     { type: "textMessage", text: "Word on the street is you're on a quest to take down The Supreme Toppinger." },
            //     { type: "textMessage", text: "But before you can tackle that cheesy villain, you'll need to hone your skills and earn your stripes in pizza battles." },
            //     { type: "textMessage", text: "Luckily for you, you've stumbled into the right place." },
            //     { type: "textMessage", text: "Here at Tony Boiii's, we're not just chefs; we're culinary warriors, and we'll train you to be the best of the best. "},
            //     { type: "textMessage", text: "So, what do you say kid? Ready to roll up your sleeves and join the fight for pizza perfection?" },
            //     { who: "npcB", type: "stand", direction: "left" },
            //     { type: "textMessage", text: "Hey Isabella! Is that the rookie everyone's been buzzin' about?" },
            //     { who: "npcA", type: "stand", direction: "right" },
            //     { type: "textMessage", text: "Rookie, huh? Well they've got the look of someone who's ready to toss some dough." },
            //     { who: "npcB", type: "walk", direction: "up" },
            //     { who: "npcB", type: "walk", direction: "left" },
            //     { who: "npcB", type: "walk", direction: "left" },
            //     { who: "npcB", type: "walk", direction: "left" },
            //     { who: "npcB", type: "walk", direction: "left" },
            //     { who: "hero", type: "stand", direction: "right" },
            //     { who: "npcA", type: "stand", direction: "up" },
            //     { type: "textMessage", text: "Well, well, well! If it isn't the newest recruit." },
            //     { type: "textMessage", text: "Welcome to Tony Boiii's, kid! I'm Pepperoni Pete, the pepperoni specialist around here." },
            //     { type: "textMessage", text: "Listen, rookie, you're in good hands with Isabella and the crew." },
            //     { type: "textMessage", text: "We've whipped up pizzas that'd make even the toughest critics cry tears of joy." },
            //     { type: "textMessage", text: "But hey, remember, in this kitchen, it's not just about making pizzas; it's about crafting legends." },
            //     { type: "textMessage", text: "So, rookie, you ready to make history, one slice at a time?" },
            //     // Additional events can be added here
        ]);
    }
}
