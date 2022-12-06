export function Snackbar() {
    const snackbarElements = {
        container: "",
        textElement: "",
    };
    function initializeSnackbar() {
        snackbarElements.container = document.querySelector(".snackbar");
        snackbarElements.textElement = document.querySelector(".snackbar-text");
        window.snackbar = this;
    }
    function toggleShowSnackbar() {
        snackbarElements.container.classList.add("show");
        setTimeout(() => {
            snackbarElements.container.classList.remove("show");
        }, 2000);
    }
    function updateText(text) {
        const { textElement } = snackbarElements;
        textElement.textContent = text;
    }
    return {
        initializeSnackbar,
        updateText,
        toggleShowSnackbar,
    };
}
