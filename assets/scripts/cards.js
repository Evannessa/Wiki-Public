export default function Card() {
    const elements = {
        card: "",
        mainLink: "",
    };

    function initializeCard(card) {
        let mainLink = card.querySelector(".internal-link");
        cacheElements(card, mainLink);
        addListeners();
    }
    function cacheElements(card, mainLink) {
        elements.card = card;
        elements.mainLink = mainLink;
    }
    function addListeners() {
        elements.card.addEventListener("click", handleClick);
    }

    function handleClick(event) {
        elements.mainLink.click();
    }
    return {
        initializeCard,
    };
}
