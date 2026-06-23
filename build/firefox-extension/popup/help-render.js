import { isFirefoxExtension } from "../lib/browser-logic.js";
import { TAB_GROUPS_API_AVAILABLE } from "../lib/settings.js";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

function renderShortcutsHelpAnswer() {
  if (isFirefoxExtension()) {
    return translate("help_how_to_update_shortcuts_answer");
  }

  return translate("help_how_to_update_shortcuts_answer_chrome").replace(
    /href="chrome:\/\/extensions\/shortcuts"/,
    'href="#"',
  );
}

function renderMruHelpSection() {
  if (isFirefoxExtension()) {
    return "";
  }

  return `
            <br>
            <h3> ${translate("help_mru_not_working_chrome_question")} </h3>
            <p> ${translate("help_mru_not_working_chrome_answer")} </p>`;
}

function renderTabGroupsNotSupportedHelpSection() {
  if (TAB_GROUPS_API_AVAILABLE) {
    return "";
  }

  const messageKey = isFirefoxExtension()
    ? "help_tab_groups_not_supported_firefox"
    : "help_tab_groups_not_supported_chrome";

  return `
            <br>
            <p class="warning-text">${translate(messageKey)}</p>`;
}

export function renderHelpSection() {
  return `
            <br>
            <h3> ${translate("help_how_to_update_shortcuts_question")} </h3>
            <p> ${renderShortcutsHelpAnswer()} </p>
            ${renderMruHelpSection()}
            ${renderTabGroupsNotSupportedHelpSection()}
            <br>
            <h3>${translate("help_encountered_a_problem_question")} </h3>
            <p> ${translate("help_encountered_a_problem_answer")} </p>`;
}
