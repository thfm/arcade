/* https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser */
function isMobile() {
    let match = window.matchMedia || window.msMatchMedia;
    if(match) {
        let mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

if(isMobile()) {
    document.getElementsByTagName("canvas")[0].remove();
    let mobileIncompatMsg = document.createElement("p");
    mobileIncompatMsg.innerHTML =
        "This game does not support mobile devices.";
    document.body.appendChild(mobileIncompatMsg);
}
