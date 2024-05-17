export class TurnCycle {
    // Constructor for the TurnCycle class
    constructor({ battle, onNewEvent, onWinner }) {
        this.battle = battle; // The battle instance containing combatants and state
        this.onNewEvent = onNewEvent; // Callback to handle new events
        this.onWinner = onWinner; // Callback to handle winner announcement
        this.currentTeam = "player"; // Track whose turn it is, "player" or "enemy"
    }

    // Executes a turn in the battle
    async turn() {
        // Get the caster
        const casterId = this.battle.activeCombatants[this.currentTeam]; // ID of the current active combatant
        const caster = this.battle.combatants[casterId]; // The current active combatant
        const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]; // ID of the opposing combatant
        const enemy = this.battle.combatants[enemyId]; // The opposing combatant

        // Get the submission from the event
        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy,
        });

        // Handle replacement of a combatant
        if (submission.replacement) {
            await this.onNewEvent({
                type: "replace",
                replacement: submission.replacement,
            });
            await this.onNewEvent({
                type: "textMessage",
                text: `Go get 'em, ${submission.replacement.name}!`,
            });
            this.nextTurn();
            return;
        }

        // Handle item usage
        if (submission.instanceId) {
            this.battle.usedInstanceIds[submission.instanceId] = true; // Mark item as used
            this.battle.items = this.battle.items.filter((i) => i.instanceId !== submission.instanceId); // Remove item from battle state
        }

        // Get and execute replaced events
        const resultingEvents = caster.getReplacedEvents(submission.action.success);
        for (let i = 0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            };
            await this.onNewEvent(event);
        }

        // Check if the target died
        const targetDead = submission.target.hp <= 0;
        if (targetDead) {
            await this.onNewEvent({
                type: "textMessage",
                text: `${submission.target.name} is ruined!`,
            });

            // Handle XP gain if the enemy is defeated
            if (submission.target.team === "enemy") {
                const playerActivePizzaId = this.battle.activeCombatants.player;
                const xp = submission.target.givesXp;

                await this.onNewEvent({
                    type: "textMessage",
                    text: `Gained ${xp} XP!`,
                });
                await this.onNewEvent({
                    type: "giveXp",
                    xp,
                    combatant: this.battle.combatants[playerActivePizzaId],
                });
            }
        }

        // Check if there's a winning team
        const winner = this.getWinningTeam();
        if (winner) {
            await this.onNewEvent({
                type: "textMessage",
                text: "Winner!",
            });
            this.onWinner(winner);
            return;
        }

        // Handle replacement if target is dead and no winner
        if (targetDead) {
            const replacement = await this.onNewEvent({
                type: "replacementMenu",
                team: submission.target.team,
            });
            await this.onNewEvent({
                type: "replace",
                replacement: replacement,
            });
            await this.onNewEvent({
                type: "textMessage",
                text: `${replacement.name} appears!`,
            });
        }

        // Handle post events
        const postEvents = caster.getPostEvents();
        for (let i = 0; i < postEvents.length; i++) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            };
            await this.onNewEvent(event);
        }

        // Handle status expiration
        const expiredEvent = caster.decrementStatus();
        if (expiredEvent) {
            await this.onNewEvent(expiredEvent);
        }
        // Proceed to next turn
        this.nextTurn();
    }

    // Advances to the next turn, switching the active team
    nextTurn() {
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player"; // Switch the active team
        this.turn(); // Start the next turn
    }

    // Determines the winning team based on remaining combatants' HP
    getWinningTeam() {
        let aliveTeams = {}; // Track alive teams
        Object.values(this.battle.combatants).forEach((c) => {
            if (c.hp > 0) {
                aliveTeams[c.team] = true; // Mark team as alive if combatant has HP
            }
        });
        if (!aliveTeams["player"]) {
            return "enemy"; // Enemy wins if no player combatants are alive
        }
        if (!aliveTeams["enemy"]) {
            return "player"; // Player wins if no enemy combatants are alive
        }
        return null; // No winner yet
    }

    // Initialises the turn cycle and starts the first turn
    async init() {
        await this.onNewEvent({
            type: "textMessage",
            text: this.battle.enemy.intro || `${this.battle.enemy.name} wants to throw down!`,
        });
        // Start the first turn!
        this.turn();
    }
}
