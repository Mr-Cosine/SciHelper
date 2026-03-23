import { superscripts, subscripts, greek, degree, equilibium } from "./mappings.js";

let greekMode   = false;
let upperMode   = false;
let lowerMode   = false;
let mathMode    = false;

function insertAtCursor(text) {
    const el = document.activeElement;
    if (!el || !el.value) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
}

// ============================================================
// Hotkeys handler
// ============================================================

//Release detector
document.addEventListener("keyup", (e) => {

    if (e.key === "ArrowUp") {
        upperMode = false;
    }

    if (e.key === "ArrowDown") {
        lowerMode = false;
    }

    if (e.key.toUpperCase() === "G") {
        greekMode = false;
    }

    if (e.key.toUpperCase() === "M") {
        mathMode = false;
    }
});

//Press detector
document.addEventListener("keydown", (e) => {

    // ----------------- Activate modes -----------------

    // Superscript mode
    if (e.ctrlKey && e.shiftKey && e.key === "ArrowUp") {
        upperMode = true;
        return;
    }

    // Subscript mode
    if (e.ctrlKey && e.shiftKey && e.key === "ArrowDown") {
        lowerMode = true;
        return;
    }

    // Greek mode
    if (e.shiftKey && e.key.toUpperCase() === "G") {
        greekMode = true;
        return;
    }

    // Math mode
    if (e.shiftKey && e.key.toUpperCase() === "M") {
        mathMode = true;
        return;
    }

    // ----------------- Superscript mode -----------------

    if (upperMode) {

        // Degree sign special case
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
            insertAtCursor("°");
            upperMode = false;
            return;
        }

        const symbol = superscripts[e.key.toLowerCase()];
        if (symbol) {
            insertAtCursor(symbol);
            upperMode = false;
            return;
        }
    }

    // ----------------- Subscript mode -----------------

    if (lowerMode) {
        const symbol = subscripts[e.key.toLowerCase()];
        if (symbol) {
            insertAtCursor(symbol);
            lowerMode = false;
            return;
        }
    }

    // ----------------- Greek mode -----------------

    if (greekMode) {
        const symbol = greek[e.key.toLowerCase()];
        if (symbol) {
            insertAtCursor(symbol);
            greekMode = false;
            return;
        }
    }

    // ----------------- Math mode -----------------

    if (mathMode) {
        const symbol = math[e.key.toLowerCase()];
        if (symbol) {
            insertAtCursor(symbol);
            mathMode = false;
            return;
        }
    }

    // ----------------- Equilibrium sign -----------------

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        insertAtCursor(equilibium);
        return;
    }
});
