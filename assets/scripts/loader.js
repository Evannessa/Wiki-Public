document.addEventListener("generatedElementsLoaded", (event) => {
    const loader = document.querySelector(".loader-container");
    loader.remove();
    document.body.classList.remove("loading")
});