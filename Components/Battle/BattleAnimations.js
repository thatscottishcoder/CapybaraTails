window.BattleAnimations = {
    // Spin animation for the battle game.
    async spin(event, onComplete) {
        const element = event.caster.pizzaElement;
        // Determine the animation class name based on the caster's team.
        // If the caster is on the player's team, add the "battle-spin-right" class, otherwise add "battle-spin-left".
        const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
        element.classList.add(animationClassName);

        // Remove the animation class when the animation is fully complete.
        // This is achieved by adding an event listener for the "animationend" event.
        element.addEventListener(
            "animationend",
            () => {
                element.classList.remove(animationClassName);
            },
            { once: true }
        );

        // Pause the battle cycle for 100ms to allow the spin animation to complete.
        await utils.wait(100);
        onComplete();
    },

    // Glob animation for the battle game.
    async glob(event, onComplete) {
        const { caster } = event;
        let div = document.createElement("div");
        // Add the "glob-orb" class to the created div element.
        // Also, add a class based on the caster's team, either "battle-glob-right" or "battle-glob-left".
        div.classList.add("glob-orb");
        div.classList.add(caster.team === "player" ? "battle-glob-right" : "battle-glob-left");

        // Create an SVG circle element with the specified color.
        div.innerHTML = `
        <svg viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="16" fill="${event.color}" />
        </svg>
      `;

        // Remove the div element when the animation is fully complete.
        // This is achieved by adding an event listener for the "animationend" event.
        div.addEventListener("animationend", () => {
            div.remove();
        });

        // Add the created div element to the battle scene.
        document.querySelector(".Battle").appendChild(div);

        // Pause the battle cycle for 820ms to allow the glob animation to complete.
        await utils.wait(820);
        onComplete();
    },
};
