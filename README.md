# Tab Sorter

## Help
- [Mozilla Docs - Your first WebExtension](https://developer.mozilla.org/en/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [Mozilla Docs - Working with the Tabs API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API)
- [Mozilla Docs - Anatomy of a WebExtension](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts)
- [Mozilla Docs - Commands](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands)
- [Mozilla Docs - Communication with background scripts](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#Communication_avec_les_scripts_darri%C3%A8re-plan)
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
- Reverse
