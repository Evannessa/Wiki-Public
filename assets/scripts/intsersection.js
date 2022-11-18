let options = {
    root: document.querySelector("article"),
    rootMargin: "0px",
    threshold: 1.0,
};

let observer = new IntersectionObserver(callback, options);
