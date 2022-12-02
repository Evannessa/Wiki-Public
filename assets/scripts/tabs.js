export function TabsHandler(data) {
    function initializeTabs() {
        tabsData = data;
        cacheTabsElements();
    }
    function cacheTabsElements() {
        const buttons = Array.from(document.querySelectorAll(".tab"));
        const contentSections = Array.from(document.querySelectorAll(".tab-content"));

        tabsElements.buttons = [...buttons];
        tabsElements.contentSections = [...contentSections];

        const keys = Object.values(tabsData).map((obj) => obj.target);

        keys.forEach((key) => {
            if (!tabsElements.byKey.hasOwnProperty(key)) {
                tabsElements.byKey[key] = {};
            }
            tabsElements.byKey[key].button = document.querySelector(`[data-target='${key}']`);
            tabsElements.byKey[key].contentSection = document.getElementById(key);
        });
    }
    let tabsData = {};

    const tabsElements = {
        buttons: [],
        contentSections: [],
        byKey: {},
    };
    function getData() {
        return tabsData;
    }
    function setCurrent() {}
    /**
     * For handling key presses
     * @param {*} event
     */
    function handleHotkey(event) {
        let key = event.which;
        for (let tabKey in tabsData) {
            let ourTab = tabsData[tabKey];
            if (ourTab.hotkey === key) {
                switchTab(ourTab.target);
            }
        }
    }

    function switchTab(key) {
        tabsElements.buttons.forEach((tab) => {
            tab.classList.remove("active");
        });
        tabsElements.contentSections.forEach((section) => {
            section.classList.remove("active");
            section.classList.add("removed");
        });
        let tab = tabsElements.byKey[key].button;
        let contentSection = tabsElements.byKey[key].contentSection;
        tab.classList.add("active");
        // contentSection.style.setProperty("--bg-img", value);
        contentSection.classList.add("active");
        contentSection.classList.remove("removed");
    }
    return {
        initializeTabs,
        switchTab,
        handleHotkey,
        getData,
    };
}
