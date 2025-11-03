window.onload = function () {
    const container = document.getElementById("sliderContainer");
    const slider = document.getElementById("slider");
    const topVideo = container.querySelector(".video-top");
    const bottomVideo = container.querySelector(".video-bottom");
    const videoSelector = document.getElementById("videoSelector");
    const sliderArrow = document.getElementById("sliderArrow");

    let dragging = false;
    let arrowAnimationTimeout; // To manage animation pause/resume

    // Define available video sets
    const videoSets = {
        "2-2": ["Single 2-2.mp4", "WGR 2-2.mp4"],
        "3-2": ["Single 3-2.mp4", "WGR 3-2.mp4"],
        "5-2": ["Single 5-2.mp4", "WGR 5-2.mp4"],
        "10-3": ["Single 10-3.mp4", "WGR 10-3.mp4"]
    };

    let currentVideoSetKey = "2-2"; // Initially loaded set

    function setClip(x, animate = false) {
        const rect = container.getBoundingClientRect();
        let offset = Math.max(0, Math.min(x - rect.left, rect.width));
        let percent = (offset / rect.width) * 100;

        // Apply clipPath directly to avoid transition when dragging
        topVideo.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        slider.style.left = `${percent}%`;

        // If not dragging and we want to animate (e.g., when resetting to center)
        if (animate && !dragging) {
            topVideo.style.transition = 'clip-path 0.3s ease-out';
            slider.style.transition = 'left 0.3s ease-out';
            // Reset transitions after animation
            setTimeout(() => {
                topVideo.style.transition = '';
                slider.style.transition = '';
            }, 300);
        }
    }

    function loadVideoSet(key) {
        if (key === currentVideoSetKey) return;

        const [bottomVideoFile, topVideoFile] = videoSets[key];

        bottomVideo.src = `static/videos/${bottomVideoFile}`;
        topVideo.src = `static/videos/${topVideoFile}`;

        bottomVideo.load();
        topVideo.load();
        bottomVideo.play().catch(e => console.error("Error playing bottom video:", e));
        topVideo.play().catch(e => console.error("Error playing top video:", e));

        currentVideoSetKey = key;
        updateVideoSelectorActiveState();

        // Reset slider to center when new video is loaded
        setClip(container.getBoundingClientRect().width / 2 + container.getBoundingClientRect().left, true);
        startArrowAnimation(); // Restart animation after loading new set
    }

    function createVideoSelector() {
        for (const key in videoSets) {
            const option = document.createElement("div");
            option.classList.add("video-option");

            // Dynamic text based on the key (e.g., "2-2" -> "2 Objects")
            const parts = key.split('-');
            if (parts.length > 0) {
                option.textContent = `${parts[0]} Objects`;
            } else {
                option.textContent = `Video Set ${key}`;
            }

            option.dataset.key = key;
            option.addEventListener("click", () => loadVideoSet(key));
            videoSelector.appendChild(option);
        }
        updateVideoSelectorActiveState();
    }

    function updateVideoSelectorActiveState() {
        const options = videoSelector.querySelectorAll(".video-option");
        options.forEach(option => {
            if (option.dataset.key === currentVideoSetKey) {
                option.classList.add("active");
            } else {
                option.classList.remove("active");
            }
        });
    }

    function stopArrowAnimation() {
        clearTimeout(arrowAnimationTimeout);
        sliderArrow.classList.add("paused");
    }

    function startArrowAnimation() {
        // Only start animation if slider is centered
        const rect = container.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();
        const center = rect.left + rect.width / 2;

        // Check if slider is roughly at the center (within a small tolerance)
        if (Math.abs(sliderRect.left + sliderRect.width / 2 - center) < 5) { // 5px tolerance
            // Clear any existing timeout before setting a new one
            clearTimeout(arrowAnimationTimeout);
            // Delay restart slightly to ensure user has released
            arrowAnimationTimeout = setTimeout(() => {
                if (!dragging) {
                    sliderArrow.classList.remove("paused");
                }
            }, 500); // Wait 500ms after release
        } else {
            // If not centered, keep animation paused
            sliderArrow.classList.add("paused");
        }
    }


    // Initialize the slider position
    const initialX = container.getBoundingClientRect().width / 2 + container.getBoundingClientRect().left;
    setClip(initialX);
    startArrowAnimation(); // Start animation on initial load

    // Event listeners for dragging
    slider.addEventListener("mousedown", (e) => {
        dragging = true;
        slider.classList.add("dragging");
        stopArrowAnimation(); // Stop animation when dragging starts
        e.preventDefault();
    });
    window.addEventListener("mouseup", () => {
        dragging = false;
        slider.classList.remove("dragging");
        startArrowAnimation(); // Resume animation when dragging stops
    });
    window.addEventListener("mousemove", e => {
        if (dragging) setClip(e.clientX);
    });

    // Support touch
    slider.addEventListener("touchstart", (e) => {
        dragging = true;
        slider.classList.add("dragging");
        stopArrowAnimation(); // Stop animation when dragging starts
        e.preventDefault();
    }, {passive: false});
    window.addEventListener("touchend", () => {
        dragging = false;
        slider.classList.remove("dragging");
        startArrowAnimation(); // Resume animation when dragging stops
    });
    window.addEventListener("touchmove", e => {
        if (dragging) setClip(e.touches[0].clientX);
    }, {passive: false});

    // Initial creation of video selector buttons
    createVideoSelector();
}