import sortTabs from "./tab-sorter.js";

// Using the sort-tabs shortcut defined in manifest.json
browser.commands.onCommand.addListener(function(command) {
  if (command == "sort-tabs") {
    sortTabs();
  }
});
