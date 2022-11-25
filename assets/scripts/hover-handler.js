export default function hoverHandler(hoverables) {
    let hoverableElements = [];
    const hoverData = {
        hovering: false,
        keydown: false,
        current: "",
    };
    function initializeHoverData() {
        hoverableElements = hoverables;
    }

    function getHoverDataProperty(propertyName) {
        return hoverData[propertyName];
    }
    /**
     * Update when something is being hovered
     * @param {*} event
     */
    function updateHoverData(event) {
        if (event.type === "mouseenter") {
            hoverData.hovering = true;
        } else if (event.type === "mouseleave") {
            hoverData.hovering = false;
            if (event.ctrlKey) {
                hoverData.keydown = true;
            }
        } else if (event.type === "keyup" && event.key === "Control" && !hoverData.hovering) {
            hoverData.keydown = false;
        }
        if (hoverData.hovering || hoverData.keydown) {
            hoverData.current = event.currentTarget;
        } else {
            hoverData.current = null;
        }
    }
    return {
        updateHoverData,
        initializeHoverData,
        getHoverDataProperty,
    };
}
