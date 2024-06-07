// Define actions available for use in battles
window.Actions = {
    // Action to inflict damage on the target
    damage1: {
        name: "Whomp!",
        description: "Pillowy punch of dough",
        // Actions to execute upon successful execution
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" }, // Display action usage message
            { type: "animation", animation: "spin" }, // Trigger a spinning animation
            { type: "stateChange", damage: 10 }, // Inflict damage of 10 points
        ],
    },
    // Action to apply the Saucy status to a friendly target
    saucyStatus: {
        name: "Tomato Squeeze",
        description: "Applies the Saucy status",
        targetType: "friendly", // Target type for this action
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" }, // Display action usage message
            { type: "stateChange", status: { type: "Saucy", expiresIn: 3 } }, // Apply Saucy status for 3 turns
        ],
    },
    // Action to apply the Clumsy status to the target
    clumsyStatus: {
        name: "Olive Oil",
        description: "Slippery mess of deliciousness",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" }, // Display action usage message
            { type: "animation", animation: "glob", color: "#dafd2a" }, // Trigger a glob animation with specified colour
            { type: "stateChange", status: { type: "Clumsy", expiresIn: 1 } }, // Apply Clumsy status for 3 turns
            { type: "textMessage", text: "{TARGET} is slipping all around!" }, // Display target slipping message
        ],
    },
    // Item to recover from a status effect
    item_recoverStatus: {
        name: "Heating Lamp",
        description: "Feeling fresh and warm.",
        targetType: "friendly", // Target type for this action
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}!" }, // Display action usage message
            { type: "stateChange", status: null }, // Remove status effect
            { type: "textMessage", text: "Feeling fresh!" }, // Display feeling fresh message
        ],
    },
    // Item to recover HP for the caster
    item_recoverHp: {
        name: "Parmesan",
        description: "A light sprinkling of deliciousness.",
        targetType: "friendly", // Target type for this action
        success: [
            {
                type: "textMessage",
                text: "{CASTER} sprinkles on some {ACTION}!",
            }, // Display action usage message
            { type: "stateChange", recover: 10 }, // Recover 10 HP points
            { type: "textMessage", text: "{CASTER} recovers HP!" }, // Display HP recovery message
        ],
    },
    /* Extra actions which could be added to game
    *
    // Action to add an extra cheesy slice to the target
    extraCheeseSlice: {
        name: "Extra Cheese Slice",
        description: "Add an extra cheesy slice to the target",
        targetType: Math.random() < 0.5 ? "friendly" : "enemy", // Randomly assign targetType
        success: [
            { type: "textMessage", text: "{CASTER} generously adds an {ACTION}!" },
            { type: "animation", animation: "cheeseBurst" }, // Trigger a cheese burst animation
            { type: "stateChange", heal: 15 }, // Restore 15 health points
            { type: "textMessage", text: "{TARGET} enjoys the extra cheesiness!" },
        ],
    },
    // Action to unleash a whirlwind of pepperoni slices
    pepperoniWhirlwind: {
        name: "Pepperoni Whirlwind",
        description: "Unleash a whirlwind of pepperoni slices",
        targetType: Math.random() < 0.5 ? "friendly" : "enemy", // Randomly assign targetType
        success: [
            { type: "textMessage", text: "{CASTER} summons a {ACTION}!" },
            { type: "animation", animation: "whirlwind" }, // Trigger a pepperoni whirlwind animation
            { type: "stateChange", damage: 20 }, // Inflict pepperoni damage of 20 points
            { type: "textMessage", text: "{TARGET} gets caught in the pepperoni whirlwind!" },
        ],
    },
    // Action to cause a meltdown of savory mushrooms
    mushroomMeltdown: {
        name: "Mushroom Meltdown",
        description: "Cause a meltdown of savory mushrooms",
        targetType: Math.random() < 0.5 ? "friendly" : "enemy", // Randomly assign targetType
        success: [
            { type: "textMessage", text: "{CASTER} triggers a {ACTION}!" },
            { type: "animation", animation: "meltdown" }, // Trigger a mushroom meltdown animation
            { type: "stateChange", status: { type: "trance", expiresIn: 3 } }, // Apply trance status for 3 turns
            { type: "textMessage", text: "{TARGET} is mesmerized by the mushroom meltdown!" },
        ],
    },
    // Action to deliver a sizzling strike of sausage
    sizzlingSausageStrike: {
        name: "Sizzling Sausage Strike",
        description: "Deliver a sizzling strike of sausage",
        targetType: Math.random() < 0.5 ? "friendly" : "enemy", // Randomly assign targetType
        success: [
            { type: "textMessage", text: "{CASTER} lands a {ACTION}!" },
            { type: "animation", animation: "sizzle" }, // Trigger a sizzling sausage animation
            { type: "stateChange", damage: 25 }, // Inflict sizzling sausage damage of 25 points
            { type: "textMessage", text: "{TARGET} is hit by the sizzling sausage strike!" },
        ],
    },
    */
};
