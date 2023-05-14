# Tab Sorter

## Changelog

- 2023-05-14: Persist user parameters

## Help

- [Mozilla Docs - Your first WebExtension](https://developer.mozilla.org/en/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [Mozilla Docs - Working with the Tabs API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API)
- [Mozilla Docs - Anatomy of a WebExtension](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts)
- [Mozilla Docs - Commands](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands)
- [Mozilla Docs - Communication with background scripts](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#Communication_avec_les_scripts_darri%C3%A8re-plan)
- [Mozilla Docs - Implement a settings page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Implement_a_settings_page)

## Todo

- Less naive filtering:
  - Better analyze of the URLs (exclude 'www.')
  - Taking into account the title for same domains (eg sorting youtube videos by title and not by id for better human readability)
- See better ways of sorting if possible (currently using sort())
- Filters:
  - v URL
  - v MRU
  - Domain
  - Title (used for domain and url for example)
- v Reverse
- Extraction by icon and connection with OneTab to reduce all tabs from a same domain
- Optimization:
  - Quick reverse if a first sort was just clicked
    (like a cache ; while no tab is moved after a sorting operation, if we choose the same operation but we reverse, we just reverse the tab without sorting all of them once again)
  - Quicker sort for MRU (comparison between numbers)
  - Put current group of tabs at the end / the beginning
  - Detect duplicate table
  - implement MRU even for chrome
  - Decouple firefox and chrome code
  - Better sorting of integer

## Performance

### Looping on arrays

Firefox is on average very slower for looping than google chrome.
On Firefox, the faster loop for looping on an array seems to be forEach;
On Google Chrome, it seems to be the for loop.
