function preloadAndPrepareAudio(url) {
    const audio = new Audio();
    audio.src = url;
    audio.preload = "auto";
    audio.loop = true; // Set the audio to repeat
    audio.volume = 0.5; // Set initial volume (0.5 for half volume)

    let isAudioReady = false;
    let isMuted = false;
    let isSliderBeingDragged = false; // Flag to track slider dragging
    let previousVolume = 0.5; // Store the previous volume before muting

    audio.addEventListener(
        "canplaythrough",
        () => {
            console.log("Audio file preloaded and ready to play:", url);
            isAudioReady = true;
        },
        { once: true }
    );

    audio.addEventListener("error", () => {
        console.error("Error loading audio file:", url);
    });

    // Load the audio file
    audio.load();

    // Function to play the audio
    const playAudio = () => {
        if (isAudioReady && audio.paused) {
            audio
                .play()
                .then(() => {
                    console.log("Audio is playing.");
                })
                .catch((error) => {
                    console.error("Error playing audio:", error);
                });
        }
    };

    // Function to pause the audio
    const pauseAudio = () => {
        if (!audio.paused) {
            audio.pause();
        }
    };

    // Function to toggle mute/unmute
    const toggleMute = () => {
        if (!isMuted) {
            previousVolume = audio.volume; // Store the current volume
            audio.volume = 0; // Mute audio
            isMuted = true;
        } else {
            audio.volume = previousVolume; // Restore the previous volume
            isMuted = false;
        }
        updateVolumeIcon();
        updateVolumeSlider();
    };

    // Function to set volume
    const setVolume = (value) => {
        audio.volume = value;
        if (value === 0) {
            isMuted = true;
        } else {
            isMuted = false;
        }
        updateVolumeIcon();
    };

    // Function to update volume icon
    const updateVolumeIcon = () => {
        const volumeIcon = document.getElementById("volume-icon");
        if (volumeIcon) {
            if (isMuted) {
                volumeIcon.classList.remove("fa-volume-up", "fa-volume-down");
                volumeIcon.classList.add("fa-volume-off");
            } else if (audio.volume > 0.5) {
                volumeIcon.classList.remove("fa-volume-down", "fa-volume-off");
                volumeIcon.classList.add("fa-volume-up");
            } else {
                volumeIcon.classList.remove("fa-volume-up", "fa-volume-off");
                volumeIcon.classList.add("fa-volume-down");
            }
        }
    };

    // Function to update volume slider
    const updateVolumeSlider = () => {
        const volumeSlider = document.getElementById("volume-slider");
        if (volumeSlider && !isSliderBeingDragged) {
            // Only update the slider if not being dragged
            volumeSlider.value = isMuted ? 0 : audio.volume;
        }
    };

    // Create a container for volume controls
    const volumeContainer = document.createElement("div");
    volumeContainer.id = "volume-container";

    // Create an icon for volume status
    const volumeIcon = document.createElement("i");
    volumeIcon.id = "volume-icon";
    volumeIcon.classList.add("fa", "fa-volume-up"); // Set initial icon
    volumeIcon.addEventListener("click", toggleMute); // Toggle mute/unmute on click
    volumeContainer.appendChild(volumeIcon);

    // Create a slider to control volume
    const volumeSlider = document.createElement("input");
    volumeSlider.id = "volume-slider";
    volumeSlider.type = "range";
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.01;
    volumeSlider.value = audio.volume;
    volumeSlider.addEventListener("input", (event) => {
        isSliderBeingDragged = true; // Set flag when dragging slider
        setVolume(parseFloat(event.target.value));
    });
    volumeSlider.addEventListener("change", () => {
        isSliderBeingDragged = false; // Reset flag when slider is released
    });
    volumeContainer.appendChild(volumeSlider);

    // Prevent muting when interacting with the volume slider
    volumeSlider.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Append the volume container to the body
    document.body.appendChild(volumeContainer);

    // Add event listener for user interaction
    document.addEventListener("click", playAudio);

    // Add event listener for user interaction on the volume icon only
    volumeIcon.addEventListener("click", pauseAudio);
}

// Example usage
document.addEventListener("DOMContentLoaded", () => {
    // Ensure that Font Awesome CSS is included in your HTML
    preloadAndPrepareAudio("./Assets/background-music.mp3");
});
