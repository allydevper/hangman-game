let word = '';
let level = 1;
let attempts = 6;
let guessedLetters = [];
let incorrectLetters = [];
let gameOver = false;
let gameFailed = false;
let gameSuccess = false;
let selectedLanguage = 'es';

const keys = document.querySelectorAll('.key');

const translations = {
    es: {
        gameTitle: 'Juego de Ahorcado',
        incorrectLetters: 'Letras incorrectas',
        remainingAttempts: 'Intentos restantes',
        winMessage: '¡Felicidades! Has adivinado la palabra.',
        loseMessage: 'Lo siento, has perdido. La palabra era: ',
        selectLanguage: 'Selecciona el idioma:',
        reloadLevel: 'Reiniciar nivel',
        nextLevel: 'Siguiente nivel',
        level: 'Nivel'
    },
    en: {
        gameTitle: 'Hangman Game',
        incorrectLetters: 'Incorrect letters',
        remainingAttempts: 'Remaining attempts',
        winMessage: 'Congratulations! You guessed the word.',
        loseMessage: 'Sorry, you lost. The word was: ',
        selectLanguage: 'Select Language:',
        reloadLevel: 'Reload level',
        nextLevel: 'Next level',
        level: 'level'
    },
    de: {
        gameTitle: 'Galgenmännchen-Spiel',
        incorrectLetters: 'Falsche Buchstaben',
        remainingAttempts: 'Verbleibende Versuche',
        winMessage: 'Herzlichen Glückwunsch! Du hast das Wort erraten.',
        loseMessage: 'Entschuldigung, du hast verloren. Das Wort war: ',
        selectLanguage: 'Sprache wählen:',
        reloadLevel: 'Level neu laden',
        nextLevel: 'Nächsten Level',
        level: 'Level'
    },
    it: {
        gameTitle: 'Gioco dell\'impiccato',
        incorrectLetters: 'Lettere sbagliate',
        remainingAttempts: 'Tentativi rimanenti',
        winMessage: 'Congratulazioni! Hai indovinato la parola.',
        loseMessage: 'Mi dispiace, hai perso. La parola era: ',
        selectLanguage: 'Seleziona la lingua:',
        reloadLevel: 'Ricarica livello',
        nextLevel: 'Prossimo livello',
        level: 'Livello'
    },
    fr: {
        gameTitle: 'Jeu du pendu',
        incorrectLetters: 'Lettres incorrectes',
        remainingAttempts: 'Tentatives restantes',
        winMessage: 'Félicitations! Vous avez deviné le mot.',
        loseMessage: 'Désolé, vous avez perdu. Le mot était : ',
        selectLanguage: 'Choisir la langue:',
        reloadLevel: 'Recharger le niveau',
        nextLevel: 'Niveau suivant',
        level: 'Niveau'
    }
};

function updateTexts() {
    const translation = translations[selectedLanguage];
    document.getElementById('game-title').innerHTML = `${translation.gameTitle} <span id="level-badge" class="position-absolute badge rounded-pill bg-danger fs-6">${translation.level} ${level}</span>`;
    document.getElementById('attempts').innerHTML = `${translation.remainingAttempts}: ${attempts}`;
    document.getElementById('reload-level').innerHTML = `${translation.reloadLevel}`;
    document.getElementById('next-level').innerHTML = `${translation.nextLevel}`;
    document.querySelector('label[for="language-select"]').innerHTML = translation.selectLanguage;
}

document.getElementById('language-select').addEventListener('change', updateLanguage);

function updateLanguage() {
    selectedLanguage = document.getElementById('language-select').value;

    nextLevel(0);
    updateTexts();
}

window.onload = function (event) {
    nextLevel(0);
};

function reloadLevel() {
    nextLevel(0);
}

function nextLevel(value = 1) {
    guessedLetters = [];
    incorrectLetters = [];
    level = level + value;
    attempts = 6;
    gameOver = false;
    gameFailed = false;
    gameSuccess = false;
    disableKeys();
    fetchWord();
    updateTexts();
    resetImage();
    document.getElementById('next-level').setAttribute('disabled', 'disabled');
}

async function fetchWord() {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${4 + level}&lang=${selectedLanguage}`);
        const data = await response.json();
        word = normalize(data[0].toUpperCase());
        displayWord();
        enableKeys();
        document.getElementById('message').textContent = '';
        document.getElementById('message').classList.remove('message-background');

    } catch (error) {
        console.error('Error fetching word:', error);
    }
}

function displayWord() {
    const display = word.split('').map(letter => guessedLetters.includes(letter) ? letter : '_').join(' ');
    document.getElementById('word').textContent = display;
}

function checkGameStatus() {

    const translation = translations[selectedLanguage];

    if (incorrectLetters.length > 0) {
        document.getElementById('incorrect-letters').textContent = `${translation.incorrectLetters}: ` + incorrectLetters.join(', ');
        document.getElementById('incorrect-letters').classList.add('incorrect-letters-background');
    } else {
        document.getElementById('incorrect-letters').textContent = '';
        document.getElementById('incorrect-letters').classList.remove('incorrect-letters-background');
    }

    if (!document.getElementById('word').textContent.includes('_')) {
        document.getElementById('message').textContent = `${translation.winMessage}`;
        document.getElementById('message').classList.add('message-background');
        document.getElementById('incorrect-letters').textContent = '';
        document.getElementById('incorrect-letters').classList.remove('incorrect-letters-background');
        gameOver = true;
        gameSuccess = true;
        disableKeys();
        document.getElementById('next-level').removeAttribute('disabled');
    } else if (attempts <= 0) {
        document.getElementById('message').textContent = `${translation.loseMessage}` + word;
        document.getElementById('message').classList.add('message-background');
        document.getElementById('incorrect-letters').textContent = '';
        document.getElementById('incorrect-letters').classList.remove('incorrect-letters-background');
        gameOver = true;
        gameFailed = true;
        disableKeys();
    }
    document.getElementById('attempts').innerHTML = `${translation.remainingAttempts}: ${attempts}`;
}

function disableKeys() {
    keys.forEach(key => {
        key.setAttribute('disabled', 'disabled');
        key.classList.remove('marked-key');
    });
}

function enableKeys() {
    keys.forEach(key => {
        key.removeAttribute('disabled');
        key.classList.remove('marked-key');
    });
}

keys.forEach(key => {
    key.addEventListener('click', () => {
        const guess = key.getAttribute('data-key');
        if (guess && !guessedLetters.includes(guess) && !incorrectLetters.includes(guess) && !gameOver) {
            if (word.includes(guess)) {
                guessedLetters.push(guess);
            } else {
                incorrectLetters.push(guess);
                attempts--;
                showNextPart();
            }
            displayWord();
            checkGameStatus();
            key.classList.add('marked-key');
        }
    });
});

const parts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];
let currentStep = 0;

function showNextPart() {
    if (currentStep < parts.length) {
        document.getElementById(parts[currentStep]).classList.remove("d-none");
        currentStep++;
    }
}

function resetImage() {
    parts.forEach(part => {
        document.getElementById(part).classList.add("d-none");
    });
    currentStep = 0;
}

function normalize(word) {
    return word.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}
