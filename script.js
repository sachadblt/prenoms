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
        names.forEach(name => {
            const rectangle = document.createElement('div');
            rectangle.classList.add('name-rectangle');
            rectangle.textContent = name;
            rectangle.addEventListener('click', () => {
                showClickedName(name);
            });
            nameRectanglesContainer.appendChild(rectangle);
        });
    };

    // --- Panel 3: After Clicking a Rectangle ---
    const showClickedName = (name) => {
        clickedNameText.textContent = `${name}`;
        namesDisplaySection.style.display = 'none'; // Hide name display
        clickedNameDisplaySection.style.display = 'flex'; // Use flex to match CSS centering
        // Prevent body from scrolling when fullscreen is active (optional, but good UX)
        document.body.style.overflow = 'hidden';
    };

    closeClickedName.addEventListener('click', () => {
        clickedNameDisplaySection.style.display = 'none'; // Hide clicked name display
        namesDisplaySection.style.display = 'block'; // Show name display again (Panel 4)
        document.body.style.overflow = ''; // Re-enable body scrolling
    });

    // --- Settings Button ---
    settingsButton.addEventListener('click', () => {
        // Toggle visibility of input section
        if (inputSection.style.display === 'none') {
            inputSection.style.display = 'block';
            namesDisplaySection.style.display = 'none';
            clickedNameDisplaySection.style.display = 'none';
            document.body.style.overflow = ''; // Ensure scrolling is enabled if we go back to settings
            // Optionally repopulate inputs if names exist
            if (names.length > 0) {
                numPeopleInput.value = names.length;
                numPeopleInput.dispatchEvent(new Event('input')); // Trigger input event to create fields
                names.forEach((name, index) => {
                    const input = document.getElementById(`nameInput-${index}`);
                    if (input) input.value = name;
                });
                saveNamesButton.style.display = 'block';
            }
        } else {
            // If input section is already visible, and names are loaded,
            // go back to name display if names exist.
            if (names.length > 0) {
                inputSection.style.display = 'none';
                namesDisplaySection.style.display = 'block';
            }
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