import { OverworldEvent } from "./OverworldEvent.js";
import { PizzaStone } from "./PizzaStone.js";
import { Person } from "./Person.js";

// Creates a new OverworldMap instance representing a map in the overworld
export class OverworldMap {
    constructor(config) {
        // Reference to the overworld (default empty)
        this.overworld = null;
        // Map game objects
        this.gameObjects = {};
        this.configObjects = config.configObjects;
        // Cutscene spaces on the map (default empty object)
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        // Walls on the map (default empty object)
        this.walls = config.walls || {};

        // Load images for the map layers
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;
        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;
        this.battleImage = new Image();
        this.battleImage.src = config.battleSrc;

        // Flag to track cutscene state
        this.isCutscenePlaying = false;
        this.isPaused = false;
    }

    // Draw the lower image layer of the map onto a canvas context
    drawLowerImage(ctx, cameraPerson) {
        // Draw the lower image with offsets
        ctx.drawImage(
            this.lowerImage,
            // Calculates X offset by passing n into withGrid function and deducting the camera X position
            utils.withGrid(10.5) - cameraPerson.x,
            // Calculates Y offset by passing n into withGrid function and deducting the camera Y position
            utils.withGrid(6) - cameraPerson.y
        );
    }

    // Draw the upper image layer of the map onto a canvas context
    drawUpperImage(ctx, cameraPerson) {
        // Draw the upper image with offsets
        ctx.drawImage(
            this.upperImage,
            // Calculates X offset by passing n into withGrid function and deducting the camera X position
            utils.withGrid(10.5) - cameraPerson.x,
            // Calculates Y offset by passing n into withGrid function and deducting the camera Y position
            utils.withGrid(6) - cameraPerson.y
        );
    }

    // Checks if a specific position on the map is occupied by a wall
    isSpaceTaken(currentX, currentY, direction) {
        // Check the position in the given direction
        const { x, y } = utils.nextPosition(currentX, currentY, direction);
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        return Object.values(this.gameObjects).find((obj) => {
            if (obj.x === x && obj.y === y) {
                return true;
            }
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                return true;
            }
            return false;
        });
    }

    // Mounts (adds functionality) to all game objects present on the map
    mountObjects() {
        Object.keys(this.configObjects).forEach((key) => {
            let object = this.configObjects[key];
            // Assign an ID to the object
            object.id = key;

            let instance;
            if (object.type === "Person") {
                instance = new Person(object);
            }
            if (object.type === "PizzaStone") {
                instance = new PizzaStone(object);
            }
            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
            //TODO: Implement logic to determine if the object should be mounted (active)
        });
    }

    // Asynchronously starts a cutscene by processing a sequence of events
    async startCutscene(events) {
        // Indicates that a cutscene is in progress
        this.isCutscenePlaying = true;

        // Iterate through each event in the sequence
        for (let i = 0; i < events.length; i++) {
            // Initialise an event handler for each event
            const eventHandler = new OverworldEvent({
                // Current event being processed
                event: events[i],
                // Reference to the map
                map: this,
            });
            // Wait for the event to be initialised
            const result = await eventHandler.init();
            if (result === "LOST_BATTLE") {
                break;
            }
        }

        // Cutscene has ended
        this.isCutscenePlaying = false;
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"]; // Get the hero game object
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction); // Calculate next position based on hero's direction
        const match = Object.values(this.gameObjects).find((object) => {
            // Find an object at the next coordinates matching the hero's direction
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
        });
        // Check conditions for starting a cutscene: not already in a cutscene, object found at next coordinates and there are actions defined for the object
        if (!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find((scenario) => {
                return (scenario.required || []).every((sf) => {
                    return playerState.storyFlags[sf];
                });
            });
            relevantScenario && this.startCutscene(relevantScenario.events); // Start the cutscene with the defined events
        }
    }

    // Method to check for footstep cutscene triggers based on the hero's position
    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"]; // Get the hero game object
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`]; // Find potential cutscene matches at the hero's current position
        // Check conditions for starting a cutscene: not already in a cutscene and a match found
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events); // Start the cutscene with the defined events
        }
    }
}

// Define OverworldMaps object containing different maps and their respective properties
window.OverworldMaps = {
    Kitchen: {
        id: "Kitchen",
        // Source for lower layer image
        lowerSrc: "images/maps/KitchenLower.png",
        // Source for upper layer image
        upperSrc: "images/maps/KitchenUpper.png",
        // Source for battle layer image
        battleSrc: "images/maps/KitchenBattle.png",
        gameObjects: {},
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
            },
            chefIsabella: {
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(6),
                src: "images/characters/people/npc4.png",
                behaviorLoop: [
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "up" },
                    { type: "stand", direction: "up", time: 1000 },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "left" },
                    { type: "stand", direction: "down", time: 1000 },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "right" },
                    { type: "stand", direction: "down", time: 1000 },
                ],
                talking: [
                    {
                        required: ["TALKED_TO_CHEF_ALFREDO_1", "USED_PIZZA_STONE_KITCHEN", "TALKED_TO_CHEF_ALFREDO_2"],
                        events: [
                            {
                                type: "textMessage",
                                text: "Excellent! Now that you've learned how to craft pizzas, it's time to learn how to use them in battle.",
                                faceHero: "chefIsabella",
                            },
                            {
                                type: "battle",
                                enemyId: "chefIsabella",
                            },
                            {
                                type: "addStoryFlag",
                                flag: "DEFEATED_CHEF_ISABELLA_1",
                            },
                            {
                                type: "textMessage",
                                text: "Well done! Now I think you're ready to go out there.",
                                faceHero: "chefIsabella",
                            },
                            {
                                type: "textMessage",
                                text: "Remember, you'll need to hone your skills if you want to defeat The Supreme Toppinger.",
                                faceHero: "chefIsabella",
                            },
                        ],
                    },
                    {
                        required: ["TALKED_TO_CHEF_ALFREDO_1", "USED_PIZZA_STONE_KITCHEN"],
                        events: [
                            {
                                type: "textMessage",
                                text: "I think Chef Alfredo still needs to speak with you.",
                                faceHero: "chefIsabella",
                            },
                        ],
                    },
                    {
                        required: ["TALKED_TO_CHEF_ISABELLA_1"],
                        events: [
                            {
                                type: "textMessage",
                                text: "You should go and speak with Chef Alfredo.",
                                faceHero: "chefIsabella",
                            },
                        ],
                    },
                ],
            },
            chefAlfredo: {
                type: "Person",
                x: utils.withGrid(2),
                y: utils.withGrid(6),
                src: "images/characters/people/npc5.png",
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 800 },
                    { type: "walk", direction: "up" },
                    { type: "stand", direction: "left", time: 800 },
                    { type: "walk", direction: "down" },
                    { type: "stand", direction: "left", time: 800 },
                    { type: "walk", direction: "down" },
                    { type: "stand", direction: "left", time: 800 },
                    { type: "walk", direction: "up" },
                ],
                talking: [
                    {
                        required: ["USED_PIZZA_STONE_KITCHEN"],
                        events: [
                            { type: "textMessage", text: "Brilliant! Now that you've learned how to craft pizzas, you'll now need to learn how to battle.", faceHero: "chefAlfredo" },
                            { type: "textMessage", text: "Head over and speak with Chef Isabella when you're ready, and she'll teach you how to battle.", faceHero: "chefAlfredo" },
                            { type: "addStoryFlag", flag: "TALKED_TO_CHEF_ALFREDO_2" },
                        ],
                    },
                    {
                        required: ["TALKED_TO_CHEF_ALFREDO_1"],
                        events: [{ type: "textMessage", text: "Go over and craft your first pizza when you're ready.", faceHero: "chefAlfredo" }],
                    },
                    {
                        required: ["TALKED_TO_CHEF_ISABELLA_1"],
                        events: [
                            { type: "textMessage", text: "Hey rookie, I'm Chef Alfredo.", faceHero: "chefAlfredo" },
                            { type: "textMessage", text: "I hear you're looking to take down The Supreme Toppinger.", faceHero: "chefAlfredo" },
                            { type: "textMessage", text: "You'll need to have some pizzas at hand if you plan that.", faceHero: "chefAlfredo" },
                            { type: "textMessage", text: "See that Pizza Stone behind you? That's where you can craft your pizzas.", faceHero: "chefAlfredo" },
                            { type: "textMessage", text: "Why don't you go over and make your first one, then come back and see me.", faceHero: "chefAlfredo" },
                            {
                                type: "addStoryFlag",
                                flag: "TALKED_TO_CHEF_ALFREDO_1",
                            },
                        ],
                    },
                ],
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(3),
                y: utils.withGrid(9),
                storyFlag: "USED_PIZZA_STONE_KITCHEN",
                pizzas: ["s001"],
            },
        },
        // Define walls for Kitchen map
        walls: {
            // Walls at y-3
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(10, 3)]: true,
            // Walls at y-4
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(12, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(13, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(10, 7)]: true,
            [utils.asGridCoord(13, 7)]: true,
            // Walls at -8
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(13, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(9, 9)]: true,
            [utils.asGridCoord(10, 9)]: true,
            [utils.asGridCoord(13, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(12, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(5, 11)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7, 4)]: [
                {
                    events: [
                        { who: "npcB", type: "walk", direction: "left" },
                        {
                            who: "npcB",
                            type: "stand",
                            direction: "up",
                            time: 500,
                        },
                        { type: "textMessage", text: "You can't be in there!" },
                        { who: "npcB", type: "walk", direction: "right" },
                        { who: "hero", type: "walk", direction: "down" },
                        { who: "hero", type: "walk", direction: "left" },
                    ],
                },
            ],
            [utils.asGridCoord(5, 10)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "DiningRoom",
                            x: utils.withGrid(7),
                            y: utils.withGrid(3),
                            direction: "down",
                        },
                    ],
                },
            ],
        },
    },
    DiningRoom: {
        id: "DiningRoom",
        // Source for lower layer image
        lowerSrc: "images/maps/DiningRoomLower.png",
        // Source for upper layer image
        upperSrc: "images/maps/DiningRoomUpper.png",
        // Source for battle layer image
        battleSrc: "images/maps/DiningRoomBattle.png",
        gameObjects: {
            // hero: new Person({
            //     // Indicates that the player controls this character
            //     isPlayerControlled: true,
            //     // Initial x and y coordinates of the hero in the kitchen
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(4),
            // }),
            // npcA: new Person({
            //     // Initial x and y coordinates of npcA in the kitchen
            //     x: utils.withGrid(2),
            //     y: utils.withGrid(4),
            //     // Image source for npcA
            //     src: "images/characters/people/erio.png",
            //     talking: [
            //         {
            //             events: [
            //                 {
            //                     type: "textMessage",
            //                     text: "Bahaha!",
            //                     faceHero: "npcB",
            //                 },
            //                 { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
            //                 { type: "battle", enemyId: "erio" },
            //             ],
            //         },
            //     ],
            // }),
            // npcB: new Person({
            //     // Initial x and y coordinates of npcB in the kitchen
            //     x: utils.withGrid(10),
            //     y: utils.withGrid(8),
            //     // Image source for npcB
            //     src: "images/characters/people/npc1.png",
            //     // Sequence of talking events for npcB
            //     talking: [
            //         {
            //             required: ["TALKED_TO_ERIO"],
            //             events: [
            //                 {
            //                     type: "textMessage",
            //                     text: "Isn't Erio the coolest?",
            //                     faceHero: "npcB",
            //                 },
            //             ],
            //         },
            //         {
            //             events: [
            //                 {
            //                     type: "textMessage",
            //                     text: "I'm going to crush you!",
            //                     faceHero: "npcB",
            //                 },
            //                 { type: "battle", enemyId: "beth" },
            //                 { type: "addStoryFlag", flag: "DEFEATED_BETH" },
            //                 {
            //                     type: "textMessage",
            //                     text: "You crushed me like weak pepper.",
            //                     faceHero: "npcB",
            //                 },
            //             ],
            //         },
            //     ],
            // }),
        },
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
            },
        },
        // Define walls for Kitchen map
        walls: {
            // Walls at y-2
            [utils.asGridCoord(7, 2)]: true,
            // Walls at y-3
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            // Walls at y-4
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(9, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(2, 5)]: true,
            [utils.asGridCoord(3, 5)]: true,
            [utils.asGridCoord(4, 5)]: true,
            [utils.asGridCoord(6, 5)]: true,
            [utils.asGridCoord(10, 5)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(12, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(2, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(12, 7)]: true,
            // Walls at -8
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(13, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(13, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(13, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(13, 11)]: true,
            // Walls at y-12
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(5, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(11, 12)]: true,
            [utils.asGridCoord(12, 12)]: true,
            // Walls at y-13
            [utils.asGridCoord(6, 13)]: true,
        },
        // Defines cutscene spaces for DemoRoom map
        cutsceneSpaces: {
            // [utils.asGridCoord(5, 4)]: [
            //     {
            //         events: [
            //             { who: "npcA", type: "walk", direction: "right" },
            //             { who: "npcA", type: "walk", direction: "right" },
            //             { who: "hero", type: "stand", direction: "left" },
            //             { type: "textMessage", text: "..." },
            //             { who: "npcA", type: "walk", direction: "left" },
            //             { who: "npcA", type: "walk", direction: "left" },
            //             { who: "npcA", type: "stand", direction: "down" },
            //         ]
            //     }
            // ],
            [utils.asGridCoord(7, 3)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "up",
                        },
                    ],
                },
            ],
            [utils.asGridCoord(6, 12)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Street",
                            x: utils.withGrid(5),
                            y: utils.withGrid(9),
                            direction: "down",
                        },
                    ],
                },
            ],
        },
    },
    Street: {
        id: "Street",
        // Source for the lower layer image
        lowerSrc: "images/maps/StreetLower.png",
        // Source for the upper layer image
        upperSrc: "images/maps/StreetUpper.png",
        battleSrc: "images/maps/StreetBattle.png",
        gameObjects: {
            // hero: new Person({
            //     // Indicates that the player controls this character
            //     isPlayerControlled: true,
            //     // Initial x and y coordinates of the hero
            //     x: utils.withGrid(5),
            //     y: utils.withGrid(10),
            // }),
            // npcA: new Person({
            //     // Initial x and y coordinates of npcA
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(9),
            //     // Image source for npcA
            //     src: "images/characters/people/npc1.png",
            //     // Sequence of behaviors for npcA
            //     behaviorLoop: [
            //         // Stand facing left
            //         { type: "stand", direction: "left", time: 800 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 800 },
            //         // Stand facing right
            //         { type: "stand", direction: "right", time: 1200 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 300 },
            //     ],
            //     // Sequence of talking events for npcA
            //     talking: [
            //         {
            //             events: [
            //                 { type: "textMessage", text: "I'm busy..." , faceHero: "npcA" },
            //                 { type: "textMessage", text: "Go away!" },
            //                 { who: "hero", type: "walk", direction: "up" },
            //             ]
            //         }
            //         // More events go here
            //     ]
            // }),
            // npcB: new Person({
            //     // Initial x and y coordinates of npcB
            //     x: utils.withGrid(8),
            //     y: utils.withGrid(5),
            //     // Image source for npcB
            //     src: "images/characters/people/npc2.png",
            //     // Sequence of behaviors for npcB
            //     // behaviorLoop: [
            //     //     // Walk left
            //     //     { type: "walk", direction: "left" },
            //     //     // Stand facing up
            //     //     { type: "stand", direction: "up", time: 800 },
            //     //     // Walk up
            //     //     { type: "walk", direction: "up" },
            //     //     // Walk right
            //     //     { type: "walk", direction: "right" },
            //     //     // Walk down
            //     //     { type: "walk", direction: "down" },
            //     // ],
            //     talking: [
            //     ]
            // }),
        },
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
            },
        },
        // Define walls for DemoRoom map
        walls: {
            // Walls at y-4
            [utils.asGridCoord(25, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(24, 5)]: true,
            [utils.asGridCoord(26, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(24, 6)]: true,
            [utils.asGridCoord(26, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(15, 7)]: true,
            [utils.asGridCoord(16, 7)]: true,
            [utils.asGridCoord(17, 7)]: true,
            [utils.asGridCoord(18, 7)]: true,
            [utils.asGridCoord(19, 7)]: true,
            [utils.asGridCoord(20, 7)]: true,
            [utils.asGridCoord(21, 7)]: true,
            [utils.asGridCoord(22, 7)]: true,
            [utils.asGridCoord(23, 7)]: true,
            [utils.asGridCoord(24, 7)]: true,
            [utils.asGridCoord(26, 7)]: true,
            [utils.asGridCoord(27, 7)]: true,
            // Walls at y-8
            [utils.asGridCoord(5, 8)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(14, 8)]: true,
            [utils.asGridCoord(28, 8)]: true,
            [utils.asGridCoord(29, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(6, 9)]: true,
            [utils.asGridCoord(16, 9)]: true,
            [utils.asGridCoord(17, 9)]: true,
            [utils.asGridCoord(25, 9)]: true,
            [utils.asGridCoord(26, 9)]: true,
            [utils.asGridCoord(28, 9)]: true,
            [utils.asGridCoord(30, 9)]: true,
            [utils.asGridCoord(31, 9)]: true,
            [utils.asGridCoord(32, 9)]: true,
            [utils.asGridCoord(33, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(16, 10)]: true,
            [utils.asGridCoord(17, 10)]: true,
            [utils.asGridCoord(25, 10)]: true,
            [utils.asGridCoord(26, 10)]: true,
            [utils.asGridCoord(34, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(3, 11)]: true,
            [utils.asGridCoord(16, 11)]: true,
            [utils.asGridCoord(17, 11)]: true,
            [utils.asGridCoord(18, 11)]: true,
            [utils.asGridCoord(19, 11)]: true,
            [utils.asGridCoord(25, 11)]: true,
            [utils.asGridCoord(26, 11)]: true,
            [utils.asGridCoord(34, 11)]: true,
            // Walls at y-12
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(34, 12)]: true,
            // Walls at y-13
            [utils.asGridCoord(3, 13)]: true,
            [utils.asGridCoord(34, 13)]: true,
            // Walls at y-14
            [utils.asGridCoord(4, 14)]: true,
            [utils.asGridCoord(5, 14)]: true,
            [utils.asGridCoord(6, 14)]: true,
            [utils.asGridCoord(7, 14)]: true,
            [utils.asGridCoord(8, 14)]: true,
            [utils.asGridCoord(9, 14)]: true,
            [utils.asGridCoord(10, 14)]: true,
            [utils.asGridCoord(11, 14)]: true,
            [utils.asGridCoord(12, 14)]: true,
            [utils.asGridCoord(13, 14)]: true,
            [utils.asGridCoord(14, 14)]: true,
            [utils.asGridCoord(15, 14)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(17, 14)]: true,
            [utils.asGridCoord(18, 14)]: true,
            [utils.asGridCoord(19, 14)]: true,
            [utils.asGridCoord(20, 14)]: true,
            [utils.asGridCoord(21, 14)]: true,
            [utils.asGridCoord(22, 14)]: true,
            [utils.asGridCoord(23, 14)]: true,
            [utils.asGridCoord(24, 14)]: true,
            [utils.asGridCoord(25, 14)]: true,
            [utils.asGridCoord(26, 14)]: true,
            [utils.asGridCoord(27, 14)]: true,
            [utils.asGridCoord(28, 14)]: true,
            [utils.asGridCoord(29, 14)]: true,
            [utils.asGridCoord(30, 14)]: true,
            [utils.asGridCoord(31, 14)]: true,
            [utils.asGridCoord(32, 14)]: true,
            [utils.asGridCoord(33, 14)]: true,
            [utils.asGridCoord(34, 14)]: true,
        },
        // Defines cutscene spaces for DemoRoom map
        cutsceneSpaces: {
            [utils.asGridCoord(7, 4)]: [
                {
                    events: [
                        { who: "npcB", type: "walk", direction: "left" },
                        {
                            who: "npcB",
                            type: "stand",
                            direction: "up",
                            time: 500,
                        },
                        { type: "textMessage", text: "You can't be in there!" },
                        { who: "npcB", type: "walk", direction: "right" },
                        { who: "hero", type: "walk", direction: "down" },
                        { who: "hero", type: "walk", direction: "left" },
                    ],
                },
            ],
            [utils.asGridCoord(5, 9)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "DiningRoom",
                            x: utils.withGrid(6),
                            y: utils.withGrid(12),
                            direction: "up",
                        },
                    ],
                },
            ],
            [utils.asGridCoord(25, 5)]: [
                {
                    events: [{ type: "changeMap", map: "StreetNorth", x: utils.withGrid(7), y: utils.withGrid(16), direction: "up" }],
                },
            ],
            [utils.asGridCoord(29, 9)]: [
                {
                    events: [{ type: "changeMap", map: "PizzaShop", x: utils.withGrid(5), y: utils.withGrid(12), direction: "up" }],
                },
            ],
        },
    },
    PizzaShop: {
        id: "PizzaShop",
        // Source for the lower layer image
        lowerSrc: "images/maps/PizzaShopLower.png",
        // Source for the upper layer image
        upperSrc: "images/maps/PizzaShopUpper.png",
        battleSrc: "images/maps/PizzaShopBattle.png",
        gameObjects: {
            // hero: new Person({
            //     // Indicates that the player controls this character
            //     isPlayerControlled: true,
            //     // Initial x and y coordinates of the hero
            //     x: utils.withGrid(5),
            //     y: utils.withGrid(11),
            // }),
            // npcA: new Person({
            //     // Initial x and y coordinates of npcA
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(9),
            //     // Image source for npcA
            //     src: "images/characters/people/npc1.png",
            //     // Sequence of behaviors for npcA
            //     behaviorLoop: [
            //         // Stand facing left
            //         { type: "stand", direction: "left", time: 800 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 800 },
            //         // Stand facing right
            //         { type: "stand", direction: "right", time: 1200 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 300 },
            //     ],
            //     // Sequence of talking events for npcA
            //     talking: [
            //         {
            //             events: [
            //                 { type: "textMessage", text: "I'm busy..." , faceHero: "npcA" },
            //                 { type: "textMessage", text: "Go away!" },
            //                 { who: "hero", type: "walk", direction: "up" },
            //             ]
            //         }
            //         // More events go here
            //     ]
            // }),
            // npcB: new Person({
            //     // Initial x and y coordinates of npcB
            //     x: utils.withGrid(8),
            //     y: utils.withGrid(5),
            //     // Image source for npcB
            //     src: "images/characters/people/npc2.png",
            //     // Sequence of behaviors for npcB
            //     // behaviorLoop: [
            //     //     // Walk left
            //     //     { type: "walk", direction: "left" },
            //     //     // Stand facing up
            //     //     { type: "stand", direction: "up", time: 800 },
            //     //     // Walk up
            //     //     { type: "walk", direction: "up" },
            //     //     // Walk right
            //     //     { type: "walk", direction: "right" },
            //     //     // Walk down
            //     //     { type: "walk", direction: "down" },
            //     // ],
            //     talking: [
            //     ]
            // }),
        },
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(11),
            },
        },
        // Define walls for DemoRoom map
        walls: {
            // Walls at y-3
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(10, 3)]: true,
            // Walls at y-4
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(2, 4)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(11, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(2, 5)]: true,
            [utils.asGridCoord(9, 5)]: true,
            [utils.asGridCoord(11, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(2, 6)]: true,
            [utils.asGridCoord(3, 6)]: true,
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(7, 6)]: true,
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(9, 6)]: true,
            [utils.asGridCoord(11, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(11, 7)]: true,
            // Walls at y-8
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(3, 8)]: true,
            [utils.asGridCoord(4, 8)]: true,
            [utils.asGridCoord(7, 8)]: true,
            [utils.asGridCoord(8, 8)]: true,
            [utils.asGridCoord(11, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(3, 9)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(7, 9)]: true,
            [utils.asGridCoord(8, 9)]: true,
            [utils.asGridCoord(11, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(11, 11)]: true,
            // Walls at y-12
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(6, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            // Walls at y-13
            [utils.asGridCoord(5, 13)]: true,
        },
        //Defines cutscene spaces for DemoRoom map
        cutsceneSpaces: {
            // [utils.asGridCoord(7, 4)]: [
            //     {
            //         events: [
            //             { who: "npcB", type: "walk", direction: "left" },
            //             { who: "npcB", type: "stand", direction: "up", time: 500 },
            //             { type: "textMessage", text: "You can't be in there!" },
            //             { who: "npcB", type: "walk", direction: "right" },
            //             { who: "hero", type: "walk", direction: "down" },
            //             { who: "hero", type: "walk", direction: "left" },
            //         ]
            //     }
            // ],
            [utils.asGridCoord(5, 12)]: [
                {
                    events: [{ type: "changeMap", map: "Street", x: utils.withGrid(29), y: utils.withGrid(9), direction: "down" }],
                },
            ],
        },
    },
    StreetNorth: {
        id: "StreetNorth",
        // Source for the lower layer image
        lowerSrc: "images/maps/StreetNorthLower.png",
        // Source for the upper layer image
        upperSrc: "images/maps/StreetNorthUpper.png",
        battleSrc: "images/maps/StreetBattle.png",
        gameObjects: {
            // hero: new Person({
            //     // Indicates that the player controls this character
            //     isPlayerControlled: true,
            //     // Initial x and y coordinates of the hero
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(15),
            // }),
            // npcA: new Person({
            //     // Initial x and y coordinates of npcA
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(9),
            //     // Image source for npcA
            //     src: "images/characters/people/npc1.png",
            //     // Sequence of behaviors for npcA
            //     behaviorLoop: [
            //         // Stand facing left
            //         { type: "stand", direction: "left", time: 800 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 800 },
            //         // Stand facing right
            //         { type: "stand", direction: "right", time: 1200 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 300 },
            //     ],
            //     // Sequence of talking events for npcA
            //     talking: [
            //         {
            //             events: [
            //                 { type: "textMessage", text: "I'm busy..." , faceHero: "npcA" },
            //                 { type: "textMessage", text: "Go away!" },
            //                 { who: "hero", type: "walk", direction: "up" },
            //             ]
            //         }
            //         // More events go here
            //     ]
            // }),
            // npcB: new Person({
            //     // Initial x and y coordinates of npcB
            //     x: utils.withGrid(8),
            //     y: utils.withGrid(5),
            //     // Image source for npcB
            //     src: "images/characters/people/npc2.png",
            //     // Sequence of behaviors for npcB
            //     // behaviorLoop: [
            //     //     // Walk left
            //     //     { type: "walk", direction: "left" },
            //     //     // Stand facing up
            //     //     { type: "stand", direction: "up", time: 800 },
            //     //     // Walk up
            //     //     { type: "walk", direction: "up" },
            //     //     // Walk right
            //     //     { type: "walk", direction: "right" },
            //     //     // Walk down
            //     //     { type: "walk", direction: "down" },
            //     // ],
            //     talking: [
            //     ]
            // }),
        },
        configObjects: {
            hero: {
                type: "Person",
                // Indicates that the player controls this character
                isPlayerControlled: true,
                // Initial x and y coordinates of the hero
                x: utils.withGrid(7),
                y: utils.withGrid(15),
            },
        },
        // Define walls for DemoRoom map
        walls: {
            // Walls at y-4
            [utils.asGridCoord(7, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(4, 5)]: true,
            [utils.asGridCoord(5, 5)]: true,
            [utils.asGridCoord(6, 5)]: true,
            [utils.asGridCoord(8, 5)]: true,
            [utils.asGridCoord(9, 5)]: true,
            [utils.asGridCoord(10, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(3, 6)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(12, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(2, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            [utils.asGridCoord(14, 7)]: true,
            // Walls at y-8
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(7, 8)]: true,
            [utils.asGridCoord(8, 8)]: true,
            [utils.asGridCoord(14, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(7, 9)]: true,
            [utils.asGridCoord(8, 9)]: true,
            [utils.asGridCoord(14, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(14, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(1, 11)]: true,
            [utils.asGridCoord(14, 11)]: true,
            // Walls at y-12
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(14, 12)]: true,
            // Walls at y-13
            [utils.asGridCoord(1, 13)]: true,
            [utils.asGridCoord(14, 13)]: true,
            // Walls at y-14
            [utils.asGridCoord(1, 14)]: true,
            [utils.asGridCoord(14, 14)]: true,
            // Walls at y-15
            [utils.asGridCoord(3, 15)]: true,
            [utils.asGridCoord(4, 15)]: true,
            [utils.asGridCoord(5, 15)]: true,
            [utils.asGridCoord(6, 15)]: true,
            [utils.asGridCoord(8, 15)]: true,
            [utils.asGridCoord(9, 15)]: true,
            [utils.asGridCoord(10, 15)]: true,
            [utils.asGridCoord(11, 15)]: true,
            [utils.asGridCoord(12, 15)]: true,
            [utils.asGridCoord(13, 15)]: true,
            // Walls at y-16
            [utils.asGridCoord(1, 16)]: true,
            [utils.asGridCoord(2, 16)]: true,
            [utils.asGridCoord(3, 16)]: true,
            [utils.asGridCoord(4, 16)]: true,
            [utils.asGridCoord(5, 16)]: true,
            [utils.asGridCoord(6, 16)]: true,
            [utils.asGridCoord(8, 16)]: true,
            [utils.asGridCoord(9, 16)]: true,
            [utils.asGridCoord(10, 16)]: true,
            [utils.asGridCoord(11, 16)]: true,
            [utils.asGridCoord(12, 16)]: true,
            [utils.asGridCoord(13, 16)]: true,
            [utils.asGridCoord(14, 16)]: true,
            [utils.asGridCoord(15, 16)]: true,
            // Walls at y-17
            [utils.asGridCoord(7, 17)]: true,
        },
        //Defines cutscene spaces for DemoRoom map
        cutsceneSpaces: {
            // [utils.asGridCoord(7, 4)]: [
            //     {
            //         events: [
            //             { who: "npcB", type: "walk", direction: "left" },
            //             { who: "npcB", type: "stand", direction: "up", time: 500 },
            //             { type: "textMessage", text: "You can't be in there!" },
            //             { who: "npcB", type: "walk", direction: "right" },
            //             { who: "hero", type: "walk", direction: "down" },
            //             { who: "hero", type: "walk", direction: "left" },
            //         ]
            //     }
            // ],
            [utils.asGridCoord(7, 5)]: [
                {
                    events: [{ type: "changeMap", map: "GreenKitchen", x: utils.withGrid(5), y: utils.withGrid(12), direction: "up" }],
                },
            ],
            [utils.asGridCoord(7, 16)]: [
                {
                    events: [{ type: "changeMap", map: "Street", x: utils.withGrid(25), y: utils.withGrid(5), direction: "down" }],
                },
            ],
        },
    },
    GreenKitchen: {
        id: "GreenKitchen",
        // Source for the lower layer image
        lowerSrc: "images/maps/GreenKitchenLower.png",
        // Source for the upper layer image
        upperSrc: "images/maps/GreenKitchenUpper.png",
        battleSrc: "images/maps/GreenKitchenBattle.png",
        gameObjects: {
            // hero: new Person({
            //     // Indicates that the player controls this character
            //     isPlayerControlled: true,
            //     // Initial x and y coordinates of the hero
            //     x: utils.withGrid(5),
            //     y: utils.withGrid(11),
            // }),
            // npcA: new Person({
            //     // Initial x and y coordinates of npcA
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(9),
            //     // Image source for npcA
            //     src: "images/characters/people/npc1.png",
            //     // Sequence of behaviors for npcA
            //     behaviorLoop: [
            //         // Stand facing left
            //         { type: "stand", direction: "left", time: 800 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 800 },
            //         // Stand facing right
            //         { type: "stand", direction: "right", time: 1200 },
            //         // Stand facing up
            //         { type: "stand", direction: "up", time: 300 },
            //     ],
            //     // Sequence of talking events for npcA
            //     talking: [
            //         {
            //             events: [
            //                 { type: "textMessage", text: "I'm busy..." , faceHero: "npcA" },
            //                 { type: "textMessage", text: "Go away!" },
            //                 { who: "hero", type: "walk", direction: "up" },
            //             ]
            //         }
            //         // More events go here
            //     ]
            // }),
            // npcB: new Person({
            //     // Initial x and y coordinates of npcB
            //     x: utils.withGrid(8),
            //     y: utils.withGrid(5),
            //     // Image source for npcB
            //     src: "images/characters/people/npc2.png",
            //     // Sequence of behaviors for npcB
            //     // behaviorLoop: [
            //     //     // Walk left
            //     //     { type: "walk", direction: "left" },
            //     //     // Stand facing up
            //     //     { type: "stand", direction: "up", time: 800 },
            //     //     // Walk up
            //     //     { type: "walk", direction: "up" },
            //     //     // Walk right
            //     //     { type: "walk", direction: "right" },
            //     //     // Walk down
            //     //     { type: "walk", direction: "down" },
            //     // ],
            //     talking: [
            //     ]
            // }),
        },
        configObjects: {
            hero: {
                type: "Person",
                // Indicates that the player controls this character
                isPlayerControlled: true,
                // Initial x and y coordinates of the hero
                x: utils.withGrid(5),
                y: utils.withGrid(11),
            },
        },
        // Define walls for DemoRoom map
        walls: {
            // Walls at y-3
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            // Walls at y-4
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(8, 4)]: true,
            [utils.asGridCoord(9, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(8, 5)]: true,
            [utils.asGridCoord(10, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(2, 6)]: true,
            [utils.asGridCoord(3, 6)]: true,
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(6, 6)]: true,
            [utils.asGridCoord(10, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(10, 7)]: true,
            // Walls at y-8
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(10, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(3, 9)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(10, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(10, 11)]: true,
            // Walls at y-12
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(6, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            // Walls at y-13
            [utils.asGridCoord(5, 13)]: true,
        },
        //Defines cutscene spaces for DemoRoom map
        cutsceneSpaces: {
            // [utils.asGridCoord(7, 4)]: [
            //     {
            //         events: [
            //             { who: "npcB", type: "walk", direction: "left" },
            //             { who: "npcB", type: "stand", direction: "up", time: 500 },
            //             { type: "textMessage", text: "You can't be in there!" },
            //             { who: "npcB", type: "walk", direction: "right" },
            //             { who: "hero", type: "walk", direction: "down" },
            //             { who: "hero", type: "walk", direction: "left" },
            //         ]
            //     }
            // ],
            [utils.asGridCoord(5, 12)]: [
                {
                    events: [{ type: "changeMap", map: "StreetNorth", x: utils.withGrid(7), y: utils.withGrid(5), direction: "down" }],
                },
            ],
        },
    },
};
