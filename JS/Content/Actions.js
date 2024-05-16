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
            { type: "stateChange", status: { type: "saucy", expiresIn: 3 } }, // Apply Saucy status for 3 turns
        ],
    },
    // Action to apply the Clumsy status to the target
    clumsyStatus: {
        name: "Olive Oil",
        description: "Slippery mess of deliciousness",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" }, // Display action usage message
            { type: "animation", animation: "glob", color: "#dafd2a" }, // Trigger a glob animation with specified colour
            { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } }, // Apply Clumsy status for 3 turns
            { type: "textMessage", text: "{TARGET} is slipping all around!" }, // Display target slipping message
        ],
    },
    // Item to recover from a status effect
    item_recoverStatus: {
        name: "Heating Lamp",
        description: "Feeling fresh and warm",
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
};
