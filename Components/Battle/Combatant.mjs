export class Combatant {
    // Constructor for the Combatant class
    constructor(config, battle) {
        // Initialise the combatant properties from the config object
        Object.keys(config).forEach((key) => {
            this[key] = config[key];
        });
        // Set HP to maxHp if undefined
        this.hp = typeof this.hp === "undefined" ? this.maxHp : this.hp;
        this.battle = battle;
    }

    // Get the HP percentage of the combatant
    get hpPercent() {
        const percent = (this.hp / this.maxHp) * 100;
        return percent > 0 ? percent : 0;
    }

    // Get the XP percentage of the combatant
    get xpPercent() {
        return (this.xp / this.maxXp) * 100;
    }

    // Check if the combatant is active
    get isActive() {
        return this.battle?.activeCombatants[this.team] === this.id;
    }

    // Get the XP given by the combatant
    get givesXp() {
        return this.level * 20;
    }

    // Create the HTML elements for the combatant
    createElement() {
        // Create the HUD element
        this.hudElement = document.createElement("div");
        this.hudElement.classList.add("Combatant");
        this.hudElement.setAttribute("data-combatant", this.id);
        this.hudElement.setAttribute("data-team", this.team);
        this.hudElement.innerHTML = `
            <p class="Combatant_name">${this.name}</p>
            <p class="Combatant_level"></p>
            <div class="Combatant_character_crop">
                <img class="Combatant_character" alt="${this.name}" src="${this.src}" />
            </div>
            <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
            <svg viewBox="0 0 26 3" class="Combatant_life-container">
                <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
                <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
            </svg>
            <svg viewBox="0 0 26 2" class="Combatant_xp-container">
                <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
                <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
            </svg>
            <p class="Combatant_status"></p>
        `;

        // Create the pizza element
        this.pizzaElement = document.createElement("img");
        this.pizzaElement.classList.add("Pizza");
        this.pizzaElement.setAttribute("src", this.src);
        this.pizzaElement.setAttribute("alt", this.name);
        this.pizzaElement.setAttribute("data-team", this.team);

        // Get references to the HP and XP fill elements
        this.hpFills = this.hudElement.querySelectorAll(".Combatant_life-container > rect");
        this.xpFills = this.hudElement.querySelectorAll(".Combatant_xp-container > rect");
    }

    // Update the combatant's properties and UI elements
    update(changes = {}) {
        // Update combatant properties
        Object.keys(changes).forEach((key) => {
            this[key] = changes[key];
        });

        // Update active status to show the correct pizza & HUD
        this.hudElement.setAttribute("data-active", this.isActive);
        this.pizzaElement.setAttribute("data-active", this.isActive);

        // Update HP & XP percent fills
        this.hpFills.forEach((rect) => (rect.style.width = `${this.hpPercent}%`));
        this.xpFills.forEach((rect) => (rect.style.width = `${this.xpPercent}%`));

        // Update level on screen
        this.hudElement.querySelector(".Combatant_level").innerText = this.level;

        // Update status
        const statusElement = this.hudElement.querySelector(".Combatant_status");
        if (this.status) {
            statusElement.innerText = this.status.type;
            statusElement.style.display = "block";
        } else {
            statusElement.innerText = "";
            statusElement.style.display = "none";
        }
    }

    // Get the replaced events if the combatant has a status effect
    getReplacedEvents(originalEvents) {
        if (this.status?.type === "clumsy" && utils.randomFromArray([true, false, false])) {
            return [{ type: "textMessage", text: `${this.name} flops over!` }];
        }

        return originalEvents;
    }

    // Get post-event actions based on the combatant's status
    getPostEvents() {
        if (this.status?.type === "saucy") {
            return [
                { type: "textMessage", text: "Feelin' saucy!" },
                { type: "stateChange", recover: 5, onCaster: true },
            ];
        }
        return [];
    }

    // Decrement the status duration of the combatant
    decrementStatus() {
        if (this.status?.expiresIn > 0) {
            this.status.expiresIn -= 1;
            if (this.status.expiresIn === 0) {
                this.update({
                    status: null,
                });
                return {
                    type: "textMessage",
                    text: "Status expired!",
                };
            }
        }
        return null;
    }

    // Initialise the combatant by creating and appending the HTML elements
    init(container) {
        this.createElement();
        container.appendChild(this.hudElement);
        container.appendChild(this.pizzaElement);
        this.update();
    }
}
