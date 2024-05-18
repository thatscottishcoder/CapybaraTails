export class Progress {
    constructor() {
        this.mapId = "Kitchen";
        this.startingHeroX = 0;
        this.startingHeroY = 0;
        this.startingHeroDirection = "down";
        this.saveFileKey = "PizzaLegends_SaveFile1";
    }

    save() {
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
        window.localStorage.setItem(this.saveFileKey, JSON.stringify(dataToSave));
    }

    getSaveFile() {
        const file = window.localStorage.getItem(this.saveFileKey);
        return file ? JSON.parse(file) : null;
    }

    load() {
        const file = this.getSaveFile();
        if (file) {
            console.log(this.getSaveFile());
            this.mapId = file.mapId;
            this.startingHeroX = file.startingHeroX;
            this.startingHeroY = file.startingHeroY;
            this.startingHeroDirection = file.startingHeroDirection;
            Object.keys(file.playerState).forEach((key) => {
                playerState[key] = file.playerState[key];
            });
        }
    }
}

// Replacement Code for C# SQLite integration
/*
export class Progress {
    constructor() {
        this.mapId = "Kitchen";
        this.startingHeroX = 0;
        this.startingHeroY = 0;
        this.startingHeroDirection = "down";
        this.saveFileKey = "PizzaLegends_SaveFile1";
    }

    async save() {
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

        try {
            const response = await fetch('https://your-csharp-api-endpoint/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    saveFileKey: this.saveFileKey,
                    data: dataToSave,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log('Progress saved successfully');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async getSaveFile() {
        try {
            const response = await fetch(`https://your-csharp-api-endpoint/load?saveFileKey=${this.saveFileKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const file = await response.json();
            console.log('Progress loaded successfully:', file);
            return file;
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    }

    async load() {
        const file = await this.getSaveFile();
        if (file) {
            this.mapId = file.mapId;
            this.startingHeroX = file.startingHeroX;
            this.startingHeroY = file.startingHeroY;
            this.startingHeroDirection = file.startingHeroDirection;
            Object.keys(file.playerState).forEach((key) => {
                playerState[key] = file.playerState[key];
            });
        }
    }
}
*/
