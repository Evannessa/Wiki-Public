let fadeInAnim = [
    {
        opacity: "0%",
    },
    {
        opacity: "100%",
    },
];

let fadeOutAnim = [
    {
        opacity: "100%",
    },
    {
        opacity: "0%",
    },
];
let crossFadeAnim = [
    {
        opacity: "100%",
    },
    {
        opacity: "0%",
    },
    {
        opacity: "100%",
    },
];

export function crossfade(element) {
    let fadeAnim = element.animate(crossFadeAnim, { duration: 400 });
}
// export function fadeIn(element) {
//     let fadeAnim = element.animate(fadeInAnim, { duration: 300 });
//     // if (element.fadeAnim) element.fadeAnim.reverse();
// }
// export function fadeOut(element) {
//     let fadeAnim = element.animate(fadeOutAnim, { duration: 300 });
//     if (element.fadeAnim && element.fadeAnim.running) {
//         //if we already have an animation going, wait until it's finished
//         element.fadeAnim.addEventListener("finished", addNewFade());
//     } else if (element.fadeAnim && !element.fadeAnim.running) {
//         addNewFade();
//     }
//     function addNewFade() {
//         let fadeAnim = element.animate(fadeOutAnim, { duration: 100, delay: 200 });
//         element.fadeAnim = fadeAnim;
//         element.fadeAnim.addEventListener("finished", () => {
//             fadeIn(element);
//         });
//     }
// }
