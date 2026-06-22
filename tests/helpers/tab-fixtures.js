export function tab(id, url, overrides = {}) {
  return {
    id,
    url,
    title: overrides.title ?? url,
    pinned: false,
    discarded: false,
    groupId: -1,
    lastAccessed: id,
    status: "complete",
    favIconUrl: overrides.favIconUrl ?? `https://icons.example/${id}`,
    ...overrides,
  };
}

export function tabsFromUrls(urls, overrides = {}) {
  return urls.map((url, index) =>
    tab(index + 1, url, {
      lastAccessed: index + 1,
      ...overrides,
    }),
  );
}
