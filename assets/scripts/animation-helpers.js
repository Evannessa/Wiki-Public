let fade = [
    {
        opacity: "0%",
    },
    {
        opacity: "100%",
    },
];
export function fadeIn(element) {
    // let fadeAnim = element.animate(fade, { duration: 300 });
    if (element.fadeAnim) element.fadeAnim.reverse();
}
export function fadeOut(element) {
    if (element.fadeAnim && element.fadeAnim.running) {
        //if we already have an animation going, wait until it's finished
        element.fadeAnim.addEventListener("finished", addNewFade());
    } else if (element.fadeAnim && !element.fadeAnim.running) {
        addNewFade();
    }
    function addNewFade() {
        let fadeAnim = element.animate(fade, { duration: 100, delay: 200 });
        element.fadeAnim = fadeAnim;
        element.fadeAnim.addEventListener("finished", () => {
            fadeIn(element);
        });
    }
}
