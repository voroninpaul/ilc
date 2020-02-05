import scrollRestorer from '@mapbox/scroll-restorer';
scrollRestorer.start({ autoRestore: false })

let globalSpinner, spinnerTimeout;
const runGlobalSpinner = () => {
    const tmplSpinner = window.ilcConfig && window.ilcConfig.tmplSpinner;
    if (!tmplSpinner || spinnerTimeout) return;

    spinnerTimeout = setTimeout(() => {
        globalSpinner = document.createElement('div');
        globalSpinner.innerHTML = tmplSpinner;
        document.body.appendChild(globalSpinner);
    }, 200);
};
const removeGlobalSpinner = () => {
    if (globalSpinner) {
        globalSpinner.remove();
        globalSpinner = null;
    }

    clearTimeout(spinnerTimeout);
    spinnerTimeout = null;
};

const fakeSlots = [];
const hiddenSlots = [];
const contentListeners = [];

const onAllSlotsLoaded = () => {
    fakeSlots.forEach(node => node.remove());
    fakeSlots.length = 0;
    hiddenSlots.forEach(node => node.style.display = '');
    hiddenSlots.length = 0;
    removeGlobalSpinner();
    document.body.removeAttribute('name');
    scrollRestorer.restoreScroll(window.history.state ? window.history : {state: {scroll: {x: 0, y: 0}}});
};

export const addContentListener = slotName => {
    runGlobalSpinner();

    if (window.location.hash) {
        document.body.setAttribute('name', window.location.hash.slice(1));
    }

    const observer = new MutationObserver((mutationsList, observer) => {
        for(let mutation of mutationsList) {
            if (mutation.addedNodes.length) {
                observer.disconnect();
                contentListeners.splice(contentListeners.indexOf(observer), 1);
                !contentListeners.length && onAllSlotsLoaded();
            }
        }
    });
    contentListeners.push(observer);
    const targetNode = document.getElementById(slotName);
    targetNode.style.display = 'none'; // we will show all new slots, only when all will be settled
    hiddenSlots.push(targetNode);
    observer.observe(targetNode, { childList: true });
};

export const renderFakeSlot = nodeId => {
    const targetNode = document.getElementById(nodeId);
    const clonedNode = targetNode.cloneNode(true);
    clonedNode.removeAttribute('id');
    fakeSlots.push(clonedNode);
    targetNode.parentNode.insertBefore(clonedNode, targetNode.nextSibling);
    targetNode.style.display = 'none'; // we hide old slot because fake already in the DOM.
    hiddenSlots.push(targetNode);
};
