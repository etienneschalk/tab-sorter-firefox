/** Replace an element's children from extension-owned HTML template strings. */
export function replaceHtmlContent(element, html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  element.replaceChildren(...doc.body.childNodes);
}
