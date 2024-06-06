import { BattleEvent } from "./BattleEvent.js";
import { Combatant } from "./Combatant.js";
import { Team } from "./Team.js";
import { TurnCycle } from "./TurnCycle.js";

// Represents a battle in the game.
export class Battle {
    constructor({ enemy, map, onComplete }) {
        this.enemy = enemy;
        this.map = map;
        this.onComplete = onComplete;

        // A dictionary of combatants in the battle.
        this.combatants = {};

        // The active combatants in the battle.
        this.activeCombatants = {
            player: null, //"player1",
            enemy: null, //"enemy1",
        };

        // Dynamically add the Player team
        window.playerState.lineup.forEach((id) => {
            this.addCombatant(id, "player", window.playerState.pizzas[id]);
        });
        // Now the enemy team
        Object.keys(this.enemy.pizzas).forEach((key) => {
            this.addCombatant("e_" + key, "enemy", this.enemy.pizzas[key]);
        });

        // Start empty
        this.items = [];

        // Add in player items
        window.playerState.items.forEach((item) => {
            this.items.push({
                ...item,
                team: "player",
            });
        });

        // A dictionary of used instance IDs.
        this.usedInstanceIds = {};
    }

    // Adds a combatant to the battle.
    addCombatant(id, team, config) {
        this.combatants[id] = new Combatant(
            {
                ...Pizzas[config.pizzaId],
                ...config,
                team,
                isPlayerControlled: team === "player",
            },
            this
        );
        // Populate first active pizza
        this.activeCombatants[team] = this.activeCombatants[team] || id;
    }

    // Creates the battle element.
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Battle");
        this.element.style.backgroundImage = `url(${this.map.battleImage.src})`;
        this.element.innerHTML = `
            <div class="Battle_hero">
                <img src="${"images/characters/people/hero.png"}" alt="Hero" />
            </div>
            <div class="Battle_enemy">
                <img src=${this.enemy.src} alt=${this.enemy.name} />
            </div>
        `;
    }

    // Initializes the battle.
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        // The player team.
        this.playerTeam = new Team("player", "Hero");

        // The enemy team.
        this.enemyTeam = new Team("enemy", "Bully");

        Object.keys(this.combatants).forEach((key) => {
            let combatant = this.combatants[key];
            combatant.id = key;
            combatant.init(this.element);

            // Add to correct team
            if (combatant.team === "player") {
                this.playerTeam.combatants.push(combatant);
            } else if (combatant.team === "enemy") {
                this.enemyTeam.combatants.push(combatant);
            }
        });

        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        // The turn cycle for the battle.
        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: (event) => {
                return new Promise((resolve) => {
                    const battleEvent = new BattleEvent(event, this);
                    battleEvent.init(resolve);
                });
            },
            onWinner: (winner) => {
                // If the player won the battle, update the player's pizzas with the latest combatant stats (health, experience, level)
                if (winner === "player") {
                    const playerState = window.playerState;
                    Object.keys(playerState.pizzas).forEach((id) => {
                        const playerStatePizza = playerState.pizzas[id];
                        const combatant = this.combatants[id];
                        if (combatant) {
                            playerStatePizza.health = combatant.health;
                            playerStatePizza.experience = combatant.experience;
                            playerStatePizza.level = combatant.level;
                        }
                    });
                }
                // Run the on-complete callback
                this.onComplete(winner);
            },
        });
        this.turnCycle.init();
    }
    // Progresses the battle by one cycle.
    progress() {
        this.turnCycle.next();
    }
}
