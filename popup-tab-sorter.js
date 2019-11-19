import sortTabs from "./tab-sorter.js";

// Clicking on the extension "Sort tabs" button
document.addEventListener("click", (e) => {
  if (e.target.id === "sort-tabs") {
    sortTabs();
  }
});
