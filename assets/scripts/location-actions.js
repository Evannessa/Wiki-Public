export const locationActionsData = {
    selectedLocationContainer: "",
    actions: {
        click: {
            fold: {
                handler: (event) => {
                    //TODO: Refactor this so that the element's being cached
                    const btnElement = event.currentTarget;
                    Helpers.toggleButtonActive(btnElement);
                    let infoCard = document.querySelector(".location-info__content");
                    infoCard.classList.toggle("flat");
                },
            },
            switchTab: {
                handler: (event) => {
                    const tab = event.currentTarget;
                    const target = tab.dataset.target;
                    uiHandlers.tabsHandler.switchTab(target);
                },
            },
            toggle: {
                handler: (event) => {
                    let currentTarget = event.currentTarget;
                    selectedLocationElements.imageContainer.classList.toggle("hidden");
                    selectedLocationElements.imageContainer.classList.toggle("image-mode");
                    // Helpers.toggleButtonText(currentTarget, "Hide Image", "Show Image");
                    // hide the children
                    selectedLocationElements.hexChildren.forEach((hex) => {
                        Helpers.toggleClassOnAction(currentTarget, hex, { action: "remove" });
                    });
                },
            },
            reset: {
                handler: () => {
                    // backOne()
                    resetZoom();
                },
            },
            backOne: {
                handler: () => {
                    backOne();
                },
            },
            expand: {
                handler: (event) => {
                    //TODO: refactor to keep track of these elsewhere
                    let nav = document.querySelector(".location-info");
                    let main = document.querySelector(".location-map .location-map");
                    if (nav.classList.contains("expanded")) {
                        Helpers.closeNav(nav, main);
                    } else {
                        Helpers.openNav(nav, main);
                    }
                },
            },
            open: {
                handler: (event) => {
                    let collapsibleElement = event.currentTarget;
                    Helpers.toggleCollapsible(collapsibleElement);
                },
            },
            selectLocation: {
                handler: (event) => {
                    event.preventDefault();
                    const locationEl = event.currentTarget;
                    selectLocation(locationEl);
                },
            },
            navigate: {
                handler: (event) => {
                    const current = event.currentTarget;
                    const targetId = current.dataset.guidLink;
                    const locationEl = document.querySelector(`[data-guid='${targetId}']`);
                    selectLocation(locationEl);
                },
            },
            showTooltip: {
                handler: (event) => {
                    const current = event.currentTarget;
                    const parentElement = current.parentNode;
                    let id = current.dataset.id;
                    Helpers.togglePopover(id, parentElement);
                },
            },
        },
        hover: {
            displayInfo: {
                handler: (event) => {
                    displayInfo(event);
                },
            },
            highlightHex: {
                handler: (event) => {
                    const isLeave = event.type === "mouseout" || event.type === "mouseleave";
                    // if (!isLeave) {
                    const actionElement = event.currentTarget;
                    // const targetName = actionElement.dataset.link;
                    const targetId = actionElement.dataset.guidLink;
                    // const hex = document.querySelector(`[data-id='${targetName}']`);
                    const hex = document.querySelector(`[data-guid='${targetId}']`);
                    Helpers.toggleClassOnAction(actionElement, hex, { action: "highlight" });
                    displayInfo(event, hex);
                    // Helpers.highlightAnotherElement(actionElement, hex)
                },
            },
        },
        press: {
            handleHotkey: {
                handler: (event) => {
                    console.log(event.currentTarget, event.target);
                    uiHandlers.tabsHandler.handleHotkey(event);
                },
            },
            handleHoverHotkey: {
                handler: (event) => {
                    console.log(event.currentTarget, event.target);
                    uiHandlers.tabsHandler.handleHotkey(event);
                },
            },
        },
    },
};
