import { sortTabs, eventConfig } from "./tab-sorter.js";

// Using the sort-tabs shortcut defined in manifest.json
browser.commands.onCommand.addListener(function(command) {
  eventConfig(command);
});
