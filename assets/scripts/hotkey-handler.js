export const HotkeyHandler = (function () {
    function handleHotkey(event, actionsData) {
        let ourAction = Object.values(actionsData).find(
            (d) => d.hotkey === event.keyCode || d.hotkeys?.includes(event.keyCode)
        );

        if (ourAction?.hasOwnProperty("handler")) {
            const { handler, element } = ourAction;
            handler(event, element);
        }
    }
    const actions = {
        press: {
            handleHotkey: {
                handler: (event) => {},
            },
        },
    };
    return {
        handleHotkey,
    };
})();
