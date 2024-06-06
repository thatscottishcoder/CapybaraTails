import { TextMessage } from "../TextMessage.js";
import { SubmissionMenu } from "./SubmissionMenu.js";

export class BattleEvent {
    // Constructor for the BattleEvent class
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    // Generates a text message for the given event.
    textMessage(resolve) {
        // Replace placeholders in the text with actual values from the event
        const text = this.event.text.replace("{CASTER}", this.event.caster?.name).replace("{TARGET}", this.event.target?.name).replace("{ACTION}", this.event.action?.name);

        // Create a new TextMessage instance and initialise it
        const message = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            },
        });
        message.init(this.battle.element);
    }

    // Changes the state of the battle based on the event
    async stateChange(resolve) {
        const { caster, target, damage, recover, status, action } = this.event;
        let who = this.event.onCaster ? caster : target;

        if (damage) {
            // Modify the target to have less HP
            target.update({
                hp: target.hp - damage,
            });

            // Start blinking to indicate damage
            target.pizzaElement.classList.add("battle-damage-blink");
        }

        if (recover) {
            // Recover HP up to the maximum HP
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }
            who.update({
                hp: newHp,
            });
        }

        if (status) {
            // Update status if provided
            who.update({
                status: { ...status },
            });
        }
        if (status === null) {
            // Clear status if null is provided
            who.update({
                status: null,
            });
        }

        // Wait for a short duration
        await utils.wait(600);

        // Update team components to reflect changes
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        // Stop blinking
        target.pizzaElement.classList.remove("battle-damage-blink");
        resolve();
    }

    // Displays a submission menu for the event
    submissionMenu(resolve) {
        const { caster } = this.event;
        const menu = new SubmissionMenu({
            caster: caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            replacements: Object.values(this.battle.combatants).filter((c) => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0;
            }),
            onComplete: (submission) => {
                // Resolve with the submission details
                resolve(submission);
            },
        });
        menu.init(this.battle.element);
    }

    // Displays a replacement menu for the event
    replacementMenu(resolve) {
        const menu = new ReplacementMenu({
            replacements: Object.values(this.battle.combatants).filter((c) => {
                return c.team === this.event.team && c.hp > 0;
            }),
            onComplete: (replacement) => {
                // Resolve with the replacement details
                resolve(replacement);
            },
        });
        menu.init(this.battle.element);
    }

    // Replaces a combatant in the battle
    async replace(resolve) {
        const { replacement } = this.event;

        // Clear out the old combatant
        const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
        this.battle.activeCombatants[replacement.team] = null;
        prevCombatant.update();
        await utils.wait(400);

        // Add the new combatant
        this.battle.activeCombatants[replacement.team] = replacement.id;
        replacement.update();
        await utils.wait(400);

        // Update Team components to reflect the new combatant
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        resolve();
    }

    // Gives experience points to a combatant in the battle
    giveXp(resolve) {
        let amount = this.event.xp;
        const { combatant } = this.event;
        const step = () => {
            if (amount > 0) {
                amount -= 1;
                combatant.xp += 1;

                // Check if the combatant has reached the level-up point
                if (combatant.xp === combatant.maxXp) {
                    combatant.xp = 0;
                    combatant.maxXp = 100;
                    combatant.level += 1;
                }

                combatant.update();
                requestAnimationFrame(step);
                return;
            }
            resolve();
        };
        requestAnimationFrame(step);
    }

    // Plays an animation for the event
    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }

    // Initialises the event and triggers the appropriate method based on the event type
    init(resolve) {
        this[this.event.type](resolve);
    }
}
