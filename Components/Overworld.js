import { KeyPressListener } from "./KeyPressListener.js";
import { OverworldMap } from "./OverworldMap.js";
import { Hud } from "./Hud.js";
import { DirectionInput } from "./DirectionInput.js";
import { Progress } from "./Progress.js";
import { TitleScreen } from "./TitleScreen.js";

export class Overworld {
    constructor(config) {
        // Initialise properties of the Overworld
        this.element = config.element; // HTML element containing the game
        this.canvas = this.element.querySelector(".game-canvas"); // Canvas element for drawing
        this.ctx = this.canvas.getContext("2d"); // Context for drawing on the canvas
        this.map = null; // Reference to the game map
        this.saveInterval = null; // Interval for automatic saving of progress
    }

    // Method to save progress every two minutes
    saveGameProgressAutomatically() {
        this.progress.save();
    }

    gameLoopStepWork(delta) {
        //Clear off the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Establish the camera person
        const cameraPerson = this.map.gameObjects.hero;

        //Update all objects
        Object.values(this.map.gameObjects).forEach((object) => {
            object.update({
                delta,
                arrow: this.directionInput.direction,
                map: this.map,
            });
        });

        //Draw Lower layer
        this.map.drawLowerImage(this.ctx, cameraPerson);

        //Draw Game Objects
        Object.values(this.map.gameObjects)
            .sort((a, b) => {
                return a.y - b.y;
            })
            .forEach((object) => {
                object.sprite.draw(this.ctx, cameraPerson);
            });

        //Draw Upper layer
        this.map.drawUpperImage(this.ctx, cameraPerson);
    }

    // Method to start the game loop for rendering and updating the game
    startGameLoop() {
        let previousMs;
        const step = 1 / 60;

        const stepFn = (timestampMs) => {
            // Stop here if paused
            if (this.map.isPaused) {
                return;
            }
            if (previousMs === undefined) {
                previousMs = timestampMs;
            }

            let delta = (timestampMs - previousMs) / 1000;
            while (delta >= step) {
                this.gameLoopStepWork(delta);
                delta -= step;
            }
            previousMs = timestampMs - delta * 1000; // Make sure we don't lose unprocessed (delta) time

            // Business as usual tick
            requestAnimationFrame(stepFn);
        };
        // First tick
        requestAnimationFrame(stepFn);
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

    startMap(mapConfig, initialHeroState = null) {
        // Create a new map using the provided configuration
        this.map = new OverworldMap(mapConfig);
        // Set a reference to the current overworld instance within the map
        this.map.overworld = this;
        // Mount game objects onto the map
        this.map.mountObjects();

        if (initialHeroState) {
            const { hero } = this.map.gameObjects;
            hero.x = initialHeroState.x;
            hero.y = initialHeroState.y;
            hero.direction = initialHeroState.direction;
        }

        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    // Method to initialize the game
    async init() {
        const container = document.querySelector(".game-container");
        this.progress = new Progress();
        this.titleScreen = new TitleScreen({
            progress: this.progress,
        });
        const useSaveFile = await this.titleScreen.init(container);
        let initialHeroState = null;
        if (useSaveFile) {
            this.progress.load();
            this.mapId = useSaveFile.mapId;
            initialHeroState = {
                x: useSaveFile.startingHeroX,
                y: useSaveFile.startingHeroY,
                direction: useSaveFile.startingHeroDirection,
            };
            window.playerState = useSaveFile.playerState;
        } else {
            this.mapId = "Kitchen";
        }
        this.hud = new Hud();
        this.hud.init(container);
        // Start the game with the DemoRoom map configuration
        this.startMap(window.OverworldMaps[this.mapId], initialHeroState);

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
        if (!useSaveFile) {
            this.map.startCutscene([
                { who: "chefIsabella", type: "walk", direction: "left" },
                { who: "chefIsabella", type: "walk", direction: "left" },
                { who: "chefIsabella", type: "walk", direction: "left" },
                { who: "chefIsabella", type: "walk", direction: "left" },
                { who: "chefIsabella", type: "walk", direction: "left" },
                { type: "textMessage", text: "Ah, there you are!", faceHero: "chefIsabella" },
                { type: "textMessage", text: "Welcome to Tony Boiii's Pizzeria, the crown jewel of Cheesetopia." },
                { type: "textMessage", text: "I'm Chef Isabella, head chef and master of all things pizza." },
                { type: "textMessage", text: "I've heard whispers about your journey to defeat The Supreme Toppinger." },
                { type: "textMessage", text: "Before you embark on that cheesy quest, you'll need to master the art of pizza combat." },
                { type: "textMessage", text: "This place isn't just a pizzeria; it's a training ground for pizza warriors." },
                { type: "textMessage", text: "Here, you'll learn the skills necessary to take on any topping that stands in your way." },
                { type: "textMessage", text: "So, what do you say? Ready to prove you're not just any pizza maker, but a true pizza warrior?" },
                { type: "textMessage", text: "Great! Whenever you're ready, go ahead and speak to Chef Alfredo. He's over by the pizzas." },
                { type: "textMessage", text: "Come back and see me once you're finished speaking to him." },
                { type: "addStoryFlag", flag: "TALKED_TO_CHEF_ISABELLA_1" },
                { who: "chefIsabella", type: "walk", direction: "right" },
                { who: "chefIsabella", type: "walk", direction: "right" },
                { who: "chefIsabella", type: "walk", direction: "right" },
                { who: "chefIsabella", type: "walk", direction: "right" },
                { who: "chefIsabella", type: "walk", direction: "right" },
                { who: "chefIsabella", type: "stand", direction: "down", time: 1000 },
            ]);
        }

        // Save progress automatically every two minutes
        this.saveInterval = setInterval(() => {
            this.saveGameProgressAutomatically();
        }, 120000);
    }
}
