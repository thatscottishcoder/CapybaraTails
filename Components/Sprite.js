export class Sprite {
    constructor(config) {
        // Set up the main image
        this.image = new Image();
        this.image.src = config.src;
        // Load image source from configuration
        this.image.onload = () => {
            // Mark image as loaded when onload event is triggered
            this.isLoaded = true;
        };

        // Shadow image setup
        this.shadow = new Image();
        // Indicator to use shadow, default to true
        this.useShadow = true;
        if (this.useShadow) {
            // Load shadow image source
            this.shadow.src = "images/characters/shadow.png";
        }
        this.shadow.onload = () => {
            // Mark shadow image as loaded when onload event is triggered
            this.isShadowLoaded = true;
        };

        // Animation configuration and initial state
        this.animations = config.animations || {
            // Default animation sequences
            "idle-down": [[0, 0]],
            "idle-right": [[0, 1]],
            "idle-up": [[0, 2]],
            "idle-left": [[0, 3]],
            "walk-down": [
                [1, 0],
                [0, 0],
                [3, 0],
                [0, 0],
            ],
            "walk-right": [
                [1, 1],
                [0, 1],
                [3, 1],
                [0, 1],
            ],
            "walk-up": [
                [1, 2],
                [0, 2],
                [3, 2],
                [0, 2],
            ],
            "walk-left": [
                [1, 3],
                [0, 3],
                [3, 3],
                [0, 3],
            ],
        };
        // Default current animation
        this.currentAnimation = config.currentAnimation || "idle-down";
        // Current frame index
        this.currentAnimationFrame = 0;
        // Frame limit for animation
        this.animationFrameLimit = config.animationFrameLimit || 8;
        // Progress counter for animation frames
        this.animationFrameProgress = this.animationFrameLimit;

        //Reference the game object associated with the sprite
        this.gameObject = config.gameObject;
    }

    // Getter for retrieving the current frame of animation
    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    // Method to set the current animation
    setAnimation(key) {
        if (this.currentAnimation !== key) {
            // Update current animation
            this.currentAnimation = key;
            // Reset frame index
            this.currentAnimationFrame = 0;
            // Reset frame progress counter
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    // Method to update animation progress
    updateAnimationProgress() {
        // Decrement frame progress counter
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1;
            return;
        }

        //Reset the frame progress counter and increment frame index
        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        // Reset frame index if it exceeds the length of animation frames
        if (this.frame === undefined) {
            this.currentAnimationFrame = 0;
        }
    }

    // Method to draw the sprite on the canvas
    draw(ctx, cameraPerson) {
        // Calculate coordinates for drawing the sprite
        const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

        // Draw shadow if it's loaded
        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

        // Draw the main image if it's loaded
        const [frameX, frameY] = this.frame;
        this.isLoaded && ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);

        // Update animation progress after drawing
        this.updateAnimationProgress();
    }
}
