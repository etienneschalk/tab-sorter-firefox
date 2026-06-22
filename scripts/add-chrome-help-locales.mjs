#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const localesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../template-extension/_locales",
);

const CHROME_SHORTCUTS_LINK =
  '<a href="chrome://extensions/shortcuts" class="chrome-shortcuts-link">chrome://extensions/shortcuts</a>';

/** @type {Record<string, string>} */
const TRANSLATIONS = {
  en: `The extension comes with predefined shortcuts for some sorting methods. Open ${CHROME_SHORTCUTS_LINK} in Chrome to view or change them.`,
  fr: `L'extension est livrée avec des raccourcis prédéfinis pour certaines méthodes de tri. Ouvrez ${CHROME_SHORTCUTS_LINK} dans Chrome pour les consulter ou les modifier.`,
  de: `Die Erweiterung enthält vordefinierte Tastenkürzel für einige Sortiermethoden. Öffnen Sie ${CHROME_SHORTCUTS_LINK} in Chrome, um sie anzuzeigen oder zu ändern.`,
  es: `La extensión incluye atajos predefinidos para algunos métodos de ordenación. Abra ${CHROME_SHORTCUTS_LINK} en Chrome para verlos o cambiarlos.`,
  it: `L'estensione include scorciatoie predefinite per alcuni metodi di ordinamento. Apri ${CHROME_SHORTCUTS_LINK} in Chrome per visualizzarle o modificarle.`,
  pt_BR: `A extensão inclui atalhos predefinidos para alguns métodos de ordenação. Abra ${CHROME_SHORTCUTS_LINK} no Chrome para visualizá-los ou alterá-los.`,
  pt_PT: `A extensão inclui atalhos predefinidos para alguns métodos de ordenação. Abra ${CHROME_SHORTCUTS_LINK} no Chrome para os ver ou alterar.`,
  ja: `この拡張機能には、一部の並べ替え方法用のショートカットがあらかじめ設定されています。Chrome で ${CHROME_SHORTCUTS_LINK} を開いて表示または変更できます。`,
  zh_CN: `此扩展程序为部分排序方式提供了预设快捷键。在 Chrome 中打开 ${CHROME_SHORTCUTS_LINK} 即可查看或更改。`,
  zh_TW: `此擴充功能為部分排序方式提供預設快捷鍵。在 Chrome 中開啟 ${CHROME_SHORTCUTS_LINK} 即可查看或變更。`,
  ru: `В расширении есть предустановленные сочетания клавиш для некоторых методов сортировки. Откройте ${CHROME_SHORTCUTS_LINK} в Chrome, чтобы просмотреть или изменить их.`,
  pl: `Rozszerzenie zawiera predefiniowane skróty klawiszowe dla niektórych metod sortowania. Otwórz ${CHROME_SHORTCUTS_LINK} w Chrome, aby je wyświetlić lub zmienić.`,
  nl: `De extensie bevat vooraf ingestelde sneltoetsen voor sommige sorteermethoden. Open ${CHROME_SHORTCUTS_LINK} in Chrome om ze te bekijken of te wijzigen.`,
  ko: `이 확장 프로그램에는 일부 정렬 방식에 대한 기본 단축키가 있습니다. Chrome에서 ${CHROME_SHORTCUTS_LINK}를 열어 확인하거나 변경하세요.`,
  tr: `Eklenti, bazı sıralama yöntemleri için önceden tanımlı kısayollarla gelir. Görüntülemek veya değiştirmek için Chrome'da ${CHROME_SHORTCUTS_LINK} adresini açın.`,
  ar: `تأتي الإضافة باختصارات محددة مسبقًا لبعض طرق الترتيب. افتح ${CHROME_SHORTCUTS_LINK} في Chrome لعرضها أو تغييرها.`,
  he: `לתוסף יש קיצורי דרך מוגדרים מראש לחלק משיטות המיון. פתחו ${CHROME_SHORTCUTS_LINK} ב-Chrome כדי לצפות בהם או לשנות אותם.`,
  cs: `Rozšíření obsahuje předdefinované zkratky pro některé metody řazení. Otevřete v Chrome ${CHROME_SHORTCUTS_LINK}, abyste je zobrazili nebo změnili.`,
  da: `Udvidelsen har foruddefinerede genveje til nogle sorteringsmetoder. Åbn ${CHROME_SHORTCUTS_LINK} i Chrome for at se eller ændre dem.`,
  nb: `Utvidelsen har forhåndsdefinerte snarveier for noen sorteringsmetoder. Åpne ${CHROME_SHORTCUTS_LINK} i Chrome for å vise eller endre dem.`,
  sv: `Tillägget har fördefinierade kortkommandon för vissa sorteringsmetoder. Öppna ${CHROME_SHORTCUTS_LINK} i Chrome för att visa eller ändra dem.`,
  fi: `Laajennuksessa on ennalta määritetyt pikanäppäimet joillekin lajittelutavoille. Avaa Chromessa ${CHROME_SHORTCUTS_LINK} tarkastellaksesi tai muuttaaksesi niitä.`,
  hu: `A bővítmény előre definiált gyorsbillentyűkkel érkezik egyes rendezési módokhoz. Nyissa meg a ${CHROME_SHORTCUTS_LINK} címet a Chrome-ban a megtekintéshez vagy módosításhoz.`,
  ro: `Extensia vine cu scurtături predefinite pentru unele metode de sortare. Deschideți ${CHROME_SHORTCUTS_LINK} în Chrome pentru a le vedea sau modifica.`,
  el: `Το πρόσθετο διαθέτει προκαθορισμένες συντομεύσεις για ορισμένες μεθόδους ταξινόμησης. Ανοίξτε το ${CHROME_SHORTCUTS_LINK} στο Chrome για να τις δείτε ή να τις αλλάξετε.`,
};

for (const locale of readdirSync(localesDir)) {
  const filePath = path.join(localesDir, locale, "messages.json");
  const messages = JSON.parse(readFileSync(filePath, "utf8"));

  delete messages.help_chrome_manage_shortcuts_link;
  messages.help_how_to_update_shortcuts_answer_chrome = {
    message: TRANSLATIONS[locale] ?? TRANSLATIONS.en,
  };

  const sorted = Object.fromEntries(
    Object.keys(messages)
      .sort()
      .map((key) => [key, messages[key]]),
  );

  writeFileSync(filePath, `${JSON.stringify(sorted, null, 2)}\n`);
}

console.log("Simplified Chrome shortcut help in all locales.");
