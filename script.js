document.addEventListener('DOMContentLoaded', () => {
    const numPeopleInput = document.getElementById('numPeopleInput');
    const nameInputsContainer = document.getElementById('nameInputsContainer');
    const saveNamesButton = document.getElementById('saveNamesButton');
    const namesDisplaySection = document.getElementById('namesDisplaySection');
    const nameRectanglesContainer = document.getElementById('nameRectanglesContainer');
    const clickedNameDisplaySection = document.getElementById('clickedNameDisplaySection');
    const clickedNameText = document.getElementById('clickedNameText');
    const closeClickedName = document.getElementById('closeClickedName');
    const inputSection = document.getElementById('inputSection');
    const settingsButton = document.getElementById('settingsButton');
    const nightModeToggle = document.getElementById('nightModeToggle');

    let names = []; // Array to store the names

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
        nameInputsContainer.innerHTML = ''; // Clear previous inputs

        if (num > 0) {
            saveNamesButton.style.display = 'block';
            for (let i = 0; i < num; i++) {
                const div = document.createElement('div');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Prénom de la personne ${i + 1}`;
                input.id = `nameInput-${i}`;
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
            if (input && input.value.trim() !== '') {
                names.push(input.value.trim());
            }
        }

        if (names.length > 0) {
            saveNamesToLocalStorage(names);
            displayNames();
            inputSection.style.display = 'none'; // Hide input section
            namesDisplaySection.style.display = 'block'; // Show name display section
        } else {
            alert('Veuillez entrer au moins un prénom.');
        }
    });

    // --- Panel 2: Displaying Names as Clickable Rectangles ---
    const displayNames = () => {
        nameRectanglesContainer.innerHTML = ''; // Clear previous rectangles
        const isTwoPlayers = (names.length === 2);

        names.forEach((name, index) => {
            const rectangle = document.createElement('div');
            rectangle.classList.add('name-rectangle');

            if (isTwoPlayers) {
                // For 2 players, create flip card structure
                rectangle.classList.add('flip-card');
                rectangle.dataset.originalName = name; // Store original name
                rectangle.dataset.currentIndex = index; // Store its original index

                const cardFront = document.createElement('div');
                cardFront.classList.add('card-front');
                cardFront.textContent = name;
                rectangle.appendChild(cardFront);

                const cardBack = document.createElement('div');
                cardBack.classList.add('card-back');
                cardBack.textContent = names[(index + 1) % 2]; // The other player's name
                rectangle.appendChild(cardBack);

                rectangle.addEventListener('click', () => {
                    // Toggle the 'flipped' class
                    rectangle.classList.toggle('flipped');
                });

            } else {
                // For non-2 players, simple rectangle with text
                rectangle.textContent = name;
                rectangle.addEventListener('click', () => {
                    // This is the "same effect as the cross" logic
                    showClickedName(name); // Show fullscreen for this name
                });
            }
            nameRectanglesContainer.appendChild(rectangle);
        });
    };

    // --- Panel 3: After Clicking a Rectangle (Non-2-Player) ---
    const showClickedName = (name) => {
        clickedNameText.textContent = `${name}`;
        namesDisplaySection.style.display = 'none'; // Hide name display
        clickedNameDisplaySection.style.display = 'flex'; // Show clicked name display (fullscreen)
        document.body.style.overflow = 'hidden'; // Prevent body from scrolling
    };

    closeClickedName.addEventListener('click', () => {
        clickedNameDisplaySection.style.display = 'none'; // Hide clicked name display
        namesDisplaySection.style.display = 'block'; // Show name display again (Panel 4)
        document.body.style.overflow = ''; // Re-enable body scrolling
    });

    // --- Settings Button ---
    settingsButton.addEventListener('click', () => {
        if (inputSection.style.display === 'none') {
            // If currently viewing names, switch to settings
            inputSection.style.display = 'block';
            namesDisplaySection.style.display = 'none';
            clickedNameDisplaySection.style.display = 'none';
            document.body.style.overflow = ''; // Ensure scrolling is enabled

            // Repopulate inputs if names exist
            if (names.length > 0) {
                numPeopleInput.value = names.length;
                // Trigger input event to generate name input fields
                numPeopleInput.dispatchEvent(new Event('input'));
                names.forEach((name, index) => {
                    const input = document.getElementById(`nameInput-${index}`);
                    if (input) input.value = name;
                });
                saveNamesButton.style.display = 'block';
            }
        } else {
            // If currently in settings and names are set, go back to names display
            if (names.length > 0) {
                inputSection.style.display = 'none';
                namesDisplaySection.style.display = 'block';
            }
            // If in settings and no names are set, do nothing or provide a message
        }
    });


    // --- Initialize on Load ---
    const storedNames = loadNamesFromLocalStorage();
    if (storedNames.length > 0) {
        names = storedNames;
        displayNames();
        inputSection.style.display = 'none'; // Hide input if names are already set
        namesDisplaySection.style.display = 'block'; // Show names display
    } else {
        inputSection.style.display = 'block'; // Show input if no names are set
        namesDisplaySection.style.display = 'none';
    }
});