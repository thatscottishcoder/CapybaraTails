// Define constants for different types of pizzas
window.PizzaTypes = {
    normal: "normal",
    spicy: "spicy",
    veggie: "veggie",
    fungi: "fungi",
    chill: "chill",
};

// Define pizza objects with unique identifiers
window.Pizzas = {
    // Define properties for "Slice Samurai" pizza
    s001: {
        name: "Slice Samurai", // Name of the pizza
        description: "Spicy and sharp, it's a taste warrior.",
        type: PizzaTypes.spicy, // Type of pizza (spicy)
        src: "images/characters/pizzas/s001.png", // Source image for the pizza
        icon: "images/icons/spicy.png", // Icon image representing the pizza type
        actions: ["clumsyStatus", "saucyStatus", "damage1"],
    },
    // Define properties for "Bacon Brigade" pizza
    s002: {
        name: "Bacon Bridge", // Name of the pizza
        description: "A fiery flavor explosion!",
        type: PizzaTypes.spicy, // Type of pizza (spicy)
        src: "images/characters/pizzas/s002.png", // Source image for the pizza
        icon: "images/icons/spicy.png", // Icon image representing the pizza type
        actions: ["clumsyStatus", "saucyStatus", "damage1"],
    },
    // Define properties for "Call Me Kale" pizza
    v001: {
        name: "Call Me Kale", // Name of the pizza
        description: "A veggie powerhouse on dough.",
        type: PizzaTypes.veggie, // Type of pizza (veggie)
        src: "images/characters/pizzas/v001.png", // Source image for the pizza
        icon: "images/icons/veggie.png", // Icon image representing the pizza type
        actions: ["damage1"],
    },
    // Define properties for "Portobello Express" pizza
    f001: {
        name: "Portobello Express", // Name of the pizza
        description: "A savory journey through fungi flavor.",
        type: PizzaTypes.fungi, // Type of pizza (veggie)
        src: "images/characters/pizzas/f001.png", // Source image for the pizza
        icon: "images/icons/fungi.png", // Icon image representing the pizza type
        actions: ["damage1"],
    },
};
