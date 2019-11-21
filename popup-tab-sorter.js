import {
  sortTabs,
  eventConfig
} from "./tab-sorter.js";

const messages = {
  extensionName: browser.i18n.getMessage("extensionName"),
  buttonSortTabsByUrl: browser.i18n.getMessage("buttonSortTabsByUrl"),
  buttonSortTabsByMru: browser.i18n.getMessage("buttonSortTabsByMru")
};

const popupContent = `
<div id="container">
<h1> ${messages.extensionName} </h1>
<br />
<button class="button-primary" href="#" id="sort-tabs-url"> ${messages.buttonSortTabsByUrl} </button>
<p> (Ctrl + Shift + Space) </p>
<br />
<button class="button-primary" href="#" id="sort-tabs-mru"> ${messages.buttonSortTabsByMru} </button>
<p> (Ctrl + Alt + Space) </p>
</div>
`;

const container = new DOMParser().parseFromString(popupContent, "text/html").getElementById("container");
document.getElementById("container").innerHTML = ``;
document.getElementById("container").appendChild(container);


// Clicking on the extension "Sort tabs" icon
document.addEventListener("click", (e) => {
  eventConfig(e.target.id);
});
