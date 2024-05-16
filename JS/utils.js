const utils = {
    withGrid(n) {
        // Converts a number to its corresponding pixel value on the grid by multiplying by 16px
        return n * 16;
    },
    asGridCoord(x, y) {
        // Converts a grid position (x, y) to a CSS pixel coordinate string
        return `${x * 16},${y * 16}`;
    },
    // Calculates the next position based on a current position and a direction.
    nextPosition(initialX, initialY, direction) {
        let x = initialX;
        let y = initialY;
        const size = 16;
        if (direction === "left") {
            x -= size;
        } else if (direction === "right") {
            x += size;
        } else if (direction === "up") {
            y -= size;
        } else if (direction === "down") {
            y += size;
        }
        return { x, y };
    },
    // Function to determine the opposite direction based on the provided direction
    oppositeDirection(direction) {
        if(direction === "left") {
            return "right"; // If direction is left, return right
        }
        if(direction === "right") {
            return "left"; // If direction is right, return left
        }
        if(direction === "up") {
            return "down"; // If direction is up, return down
        }
        return "up"; // Default: if direction is not recognised, return up
    },
    wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms)
        })
    },
    randomFromArray(array) {
        return array[Math.floor(Math.random()*array.length)]
    },
    // Emits a custom event with a name and detail object
    emitEvent(name, detail) {
        const event = new CustomEvent(name, {
            detail,
        });
        document.dispatchEvent(event);
    },
};
