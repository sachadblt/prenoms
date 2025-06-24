document.addEventListener('DOMContentLoaded', () => {
    const numPeopleInput = document.getElementById('numPeopleInput');
    const nameInputsContainer = document.getElementById('nameInputsContainer');
    const saveNamesButton = document.getElementById('saveNamesButton');
    const namesDisplaySection = document.getElementById('namesDisplaySection');
    const nameRectanglesContainer = document.getElementById('nameRectanglesContainer');
    const clickedNameDisplaySection = document.getElementById('clickedNameDisplaySection');
    const closeClickedName = document.getElementById('closeClickedName'); // Keep reference to 'X' button
    const inputSection = document.getElementById('inputSection');
    const settingsButton = document.getElementById('settingsButton'); // The gear icon
    const nightModeToggle = document.getElementById('nightModeToggle');
    const header = document.querySelector('header'); // Get reference to the header element

    let names = []; // Array to store the names
    let isFlipped = false; // State for the 2-player fullscreen card
    let currentFullscreenPlayerIndex = 0; // To know which name is currently shown on front of fullscreen card (for 2 players)

    // --- Local Storage Functions ---
    const saveNamesToLocalStorage = (namesArray) => {
        localStorage.setItem('personNames', JSON.stringify(namesArray));
    };

    const loadNamesFromLocalStorage = () => {
        const storedNames = localStorage.getItem('personNames');
        return storedNames ? JSON.parse(storedNames) : [];
    };

    const saveNightModePreference = (isNightMode) => {
        localStorage.setItem('nightMode', isNightMode ? 'enabled' : 'disabled');
    };

    const loadNightModePreference = () => {
        return localStorage.getItem('nightMode') === 'enabled';
    };

    // --- Night Mode Toggling ---
    const applyNightMode = (isEnabled) => {
        if (isEnabled) {
            document.body.classList.add('night-mode');
        } else {
            document.body.classList.remove('night-mode');
        }
        nightModeToggle.checked = isEnabled;
    };

    // Apply night mode on load
    applyNightMode(loadNightModePreference());

    nightModeToggle.addEventListener('change', () => {
        applyNightMode(nightModeToggle.checked);
        saveNightModePreference(nightModeToggle.checked);
    });

    // --- Panel 1: Number of people input & dynamic name fields ---
    numPeopleInput.addEventListener('input', () => {
        const num = parseInt(numPeopleInput.value, 10);
        const currentInputs = Array.from(nameInputsContainer.querySelectorAll('input[type="text"]'));
        const existingNames = currentInputs.map(input => input.value.trim());

        nameInputsContainer.innerHTML = ''; // Clear previous inputs

        if (num > 0) {
            saveNamesButton.style.display = 'block';
            for (let i = 0; i < num; i++) {
                const div = document.createElement('div');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Prénom de la personne ${i + 1}`;
                input.id = `nameInput-${i}`;
                // Preserve existing names if they fit the new number of fields
                if (existingNames[i]) {
                    input.value = existingNames[i];
                }
                div.appendChild(input);
                nameInputsContainer.appendChild(div);
            }
        } else {
            saveNamesButton.style.display = 'none';
        }
    });

    saveNamesButton.addEventListener('click', () => {
        names = [];
        const num = parseInt(numPeopleInput.value, 10);
        for (let i = 0; i < num; i++) {
            const input = document.getElementById(`nameInput-${i}`);
            if (input) { // Allow empty names if user doesn't fill them
                names.push(input.value.trim());
            }
        }

        if (names.length > 0) {
            saveNamesToLocalStorage(names);
            checkAndDisplayBasedOnPlayerCount(); // New function to handle display logic
        } else {
            alert('Veuillez entrer au moins un prénom.');
        }
    });

    // --- Conditional Display Logic ---
    const checkAndDisplayBasedOnPlayerCount = () => {
        const isTwoPlayers = (names.length === 2);

        // Ensure settings button is in header by default
        if (settingsButton.parentNode !== header) {
            header.appendChild(settingsButton);
            settingsButton.classList.remove('close-button'); // Remove temp styling
        }
        settingsButton.style.display = 'block'; // Always show settings button in header initially

        if (isTwoPlayers) {
            namesDisplaySection.style.display = 'none'; // Hide small cards
            inputSection.style.display = 'none'; // Hide settings
            showTwoPlayerFullscreenCard(); // Show the special 2-player fullscreen card
        } else {
            displayNames(); // Show small cards for other counts
            namesDisplaySection.style.display = 'block';
            inputSection.style.display = 'none';
            // Ensure fullscreen is hidden if coming from 2-player mode
            clickedNameDisplaySection.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // --- Panel 2: Displaying Names as Clickable Rectangles (>2 players, 1 player) ---
    const displayNames = () => {
        nameRectanglesContainer.innerHTML = ''; // Clear previous rectangles
        names.forEach((name, index) => {
            const rectangle = document.createElement('div');
            rectangle.classList.add('name-rectangle');
            rectangle.textContent = name;
            rectangle.dataset.nameIndex = index; // Store original index for logic
            rectangle.addEventListener('click', () => {
                showStandardFullscreenName(index); // Show standard fullscreen for this name
            });
            nameRectanglesContainer.appendChild(rectangle);
        });
    };

    // --- Fullscreen Display for >2 Players (standard mode) ---
    const showStandardFullscreenName = (clickedIndex) => {
        // Clear previous content of the fullscreen card
        clickedNameDisplaySection.innerHTML = '';

        // Add the close button first (so it's always on top)
        clickedNameDisplaySection.appendChild(closeClickedName);
        closeClickedName.style.display = 'block'; // Ensure X button is visible

        // Ensure settings button is in header, not on fullscreen card
        if (settingsButton.parentNode === clickedNameDisplaySection) {
            header.appendChild(settingsButton);
            settingsButton.classList.remove('close-button');
        }

        // Create the container for the text content
        const fullscreenCardContent = document.createElement('div');
        fullscreenCardContent.classList.add('fullscreen-card-content'); // Re-use styling class for general card

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = `${names[clickedIndex]}`;

        // No back card needed for standard display, so no cardBack
        fullscreenCardContent.appendChild(cardFront);
        clickedNameDisplaySection.appendChild(fullscreenCardContent);

        // Ensure no flip transforms from previous 2-player mode
        clickedNameDisplaySection.classList.remove('flipped');
        fullscreenCardContent.style.transform = 'none';
        isFlipped = false;

        namesDisplaySection.style.display = 'none';
        clickedNameDisplaySection.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Event listener to dismiss fullscreen when clicked anywhere on it (excluding the X)
        // We'll manage click listener on the clickedNameDisplaySection itself
        clickedNameDisplaySection.onclick = dismissFullscreen;

        // Prevent clicks on the X from bubbling up and triggering the main dismiss
        closeClickedName.onclick = (e) => {
            e.stopPropagation(); // Stop event from reaching clickedNameDisplaySection
            dismissFullscreen();
        };
    };

    // --- Special Fullscreen Display for 2 Players (flipping card) ---
    const showTwoPlayerFullscreenCard = () => {
        // Clear previous content of the fullscreen card
        clickedNameDisplaySection.innerHTML = '';

        // Add the settings button instead of the 'X' button
        // Reposition it using .close-button's styling (it's absolute top/right)
        settingsButton.classList.add('close-button'); // Use close-button class for positioning
        clickedNameDisplaySection.appendChild(settingsButton);
        settingsButton.style.display = 'block'; // Ensure settings button is visible
        closeClickedName.style.display = 'none'; // Hide X button

        // Create the container for the flipping content
        const fullscreenCardContent = document.createElement('div');
        fullscreenCardContent.classList.add('fullscreen-card-content'); // Apply flip styles

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');

        fullscreenCardContent.appendChild(cardFront);
        fullscreenCardContent.appendChild(cardBack);
        clickedNameDisplaySection.appendChild(fullscreenCardContent);

        // Set initial names and state
        currentFullscreenPlayerIndex = 0; // Start with the first player's name
        cardFront.textContent = names[currentFullscreenPlayerIndex];
        cardBack.textContent = names[1]; // The other player

        clickedNameDisplaySection.classList.remove('flipped');
        fullscreenCardContent.style.transform = 'none'; // Reset transform
        isFlipped = false;

        clickedNameDisplaySection.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add click listener to the fullscreen content to flip the card
        clickedNameDisplaySection.onclick = null; // Remove general dismiss handler
        fullscreenCardContent.onclick = (e) => {
            // Prevent event from bubbling up to dismissFullscreen if it's there
            e.stopPropagation();
            // If the clicked element is the settings button, let its handler manage
            if (e.target === settingsButton || settingsButton.contains(e.target)) {
                return;
            }
            flipTwoPlayerFullscreenCard();
        };
    };

    const flipTwoPlayerFullscreenCard = () => {
        const fullscreenCardContent = clickedNameDisplaySection.querySelector('.fullscreen-card-content');
        if (fullscreenCardContent) {
            isFlipped = !isFlipped;
            if (isFlipped) {
                fullscreenCardContent.style.transform = 'rotateY(180deg)';
                clickedNameDisplaySection.classList.add('flipped');
            } else {
                fullscreenCardContent.style.transform = 'none';
                clickedNameDisplaySection.classList.remove('flipped');
            }
        }
    };

    const dismissFullscreen = () => {
        clickedNameDisplaySection.style.display = 'none'; // Hide fullscreen display
        // Determine whether to show small cards or stay hidden (if coming from 2-player direct mode)
        if (names.length !== 2) { // Only show small cards if not in 2-player mode
            namesDisplaySection.style.display = 'block';
        } else {
            // If 2 players, stay hidden and let checkAndDisplayBasedOnPlayerCount handle
            namesDisplaySection.style.display = 'none';
        }
        document.body.style.overflow = ''; // Re-enable body scrolling

        // Reset event listeners
        clickedNameDisplaySection.onclick = null; // Remove general dismiss handler
        const fullscreenCardContent = clickedNameDisplaySection.querySelector('.fullscreen-card-content');
        if (fullscreenCardContent) {
            fullscreenCardContent.onclick = null; // Remove flip handler
        }

        // Move the settings button back to the header if it was on the fullscreen card
        if (settingsButton.parentNode === clickedNameDisplaySection) {
            header.appendChild(settingsButton); // Move it back to the header
            settingsButton.classList.remove('close-button'); // Remove temp styling
            settingsButton.style.display = 'block'; // Ensure it's always visible in header
        }
        closeClickedName.style.display = 'block'; // Ensure X is block for next standard fullscreen
    };

    // --- Settings Button Click Handler ---
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent this click from also triggering dismissFullscreen or flipTwoPlayerFullscreenCard

        // If settings section is hidden, show it and hide other views
        if (inputSection.style.display === 'none') {
            inputSection.style.display = 'block';
            namesDisplaySection.style.display = 'none';
            clickedNameDisplaySection.style.display = 'none';
            document.body.style.overflow = ''; // Ensure scrolling is enabled

            // Repopulate inputs with current names for editing
            numPeopleInput.value = names.length;
            numPeopleInput.dispatchEvent(new Event('input')); // Trigger to create correct number of input fields
            names.forEach((name, index) => {
                const input = document.getElementById(`nameInput-${index}`);
                if (input) input.value = name;
            });
            saveNamesButton.style.display = 'block';

        } else {
            // If settings section is visible, and names are set, go back to appropriate display
            // This is when "Valider les noms" is clicked in settings
            if (names.length > 0) {
                checkAndDisplayBasedOnPlayerCount(); // Re-evaluate display based on current names
            }
            // If in settings and no names are set, keep settings open
        }
    });


    // --- Initialize on Load ---
    const storedNames = loadNamesFromLocalStorage();
    if (storedNames.length > 0) {
        names = storedNames;
        // Check if 2 players and go directly to fullscreen mode
        checkAndDisplayBasedOnPlayerCount();
    } else {
        inputSection.style.display = 'block'; // Show input if no names are set
        namesDisplaySection.style.display = 'none';
        clickedNameDisplaySection.style.display = 'none';
    }
});