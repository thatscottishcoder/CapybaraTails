export class Progress {
    constructor() {
        this.mapId = "Kitchen";
        this.startingHeroX = 0;
        this.startingHeroY = 0;
        this.startingHeroDirection = "down";
        this.saveFileKey = "PizzaLegends_SaveFile1";
    }

    async save() {
        const playerData = {
            id: 1,
            mapId: this.mapId,
            startingHeroX: this.startingHeroX,
            startingHeroY: this.startingHeroY,
            startingHeroDirection: this.startingHeroDirection,
        };
        const pizzaData = {
            pizzas: playerState.pizzas,
        };
        const lineupData = {
            lineup: playerState.lineup,
        };
        const itemData = {
            items: playerState.items,
        };
        const flagData = {
            flags: playerState.flags,
        };
        const dataToSave = {
            mapId: this.mapId,
            startingHeroX: this.startingHeroX,
            startingHeroY: this.startingHeroY,
            startingHeroDirection: this.startingHeroDirection,
            playerState: {
                pizzas: playerState.pizzas,
                lineup: playerState.lineup,
                items: playerState.items,
                storyFlags: playerState.storyFlags,
            },
        };

        // Save to local storage
        window.localStorage.setItem(this.saveFileKey, JSON.stringify(dataToSave));

        // Save to server
        try {
            const response = await fetch("http://fb21.decoded.com:8000/api/retrieveData");
            if (!response.ok) {
                throw new Error("Network response was not okay");
            }
            const data = await response.json();

            let saveEndpoint = "http://fb21.decoded.com:8000/api/create/playerstate";

            if (!data) {
                let saveEndpoint = "http://fb21.decoded.com:8000/api/create/playerstate";
            }

            const saveResponse = await fetch(saveEndpoint, {
                method: "POST", //data ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    playerData,
                }),
            });
            console.log(
                JSON.stringify({
                    playerData,
                    pizzaData,
                    lineupData,
                    itemData,
                    flagData,
                })
            );

            if (!saveResponse.ok) {
                throw new Error("Network response was not okay");
            }

            const responseData = await saveResponse.json();
            console.log("Data saved successfully:", responseData);
        } catch (error) {
            console.error("Error saving data to the server:", error);
        }
    }

    async getSaveFile() {
        try {
            const response = await fetch("http://fb21.decoded.com:8000/api/retrieveData");
            if (!response.ok) {
                throw new Error("Network response was not okay");
            }
            const data = await response.json();

            if (data) {
                const file = {
                    mapId: data.playerStates ? data.playerStates[0].mapId : null,
                    startingHeroX: data.playerStates ? data.playerStates[0].startingHeroX : null,
                    startingHeroY: data.playerStates ? data.playerStates[0].startingHeroY : null,
                    startingHeroDirection: data.playerStates ? data.playerStates[0].startingHeroDirection : null,
                    playerState: {
                        pizzas: {},
                        lineup: [],
                        items: [],
                        storyFlags: {},
                    },
                };

                if (data.pizzas) {
                    data.pizzas.forEach((pizza) => {
                        const { playerStateId, id, ...pizzaData } = pizza;
                        file.playerState.pizzas[id] = pizzaData;
                    });
                }

                if (data.lineups) {
                    data.lineups.forEach((lineup) => {
                        file.playerState.lineup.push(lineup.pizzaId);
                    });
                }

                if (data.items) {
                    file.playerState.items = data.items.map((item) => ({
                        instanceId: item.instanceId,
                        actionId: item.actionId,
                    }));
                }

                if (data.storyFlags) {
                    data.storyFlags.forEach((storyFlag) => {
                        file.playerState.storyFlags[storyFlag.flag] = true;
                    });
                }
                console.log("File loaded successfully:", file);
                return file;
            } else {
                console.log("Data not found in response");
                return null;
            }
        } catch (error) {
            console.log("Error:", error);
            return null;
        }
    }

    async load() {
        try {
            const file = await this.getSaveFile();

            if (file) {
                // Assign map data
                this.mapId = file.mapId;
                this.startingHeroX = file.startingHeroX;
                this.startingHeroY = file.startingHeroY;
                this.startingHeroDirection = file.startingHeroDirection;

                // Assign player state
                this.playerState = file.playerState;
            } else {
                console.log("No data found.");
            }
        } catch (error) {
            console.log("Error:", error);
        }
    }
}
