# Build the extension
# Note: jq is required to edit JSON, see https://jqlang.github.io/jq/

# CHROME 
mkdir -p build/chrome-extension
cp -R template-extension/** build/chrome-extension
# The Background Page is not supported anymore for chrome, and useless as service_worker is used.
rm build/chrome-extension/background-tab-sorter.html

# FIREFOX
mkdir -p build/firefox-extension
cp -R template-extension/** build/firefox-extension
# Firefox does not support yet service workers
jq '.background = { "page": "background-tab-sorter.html" }' template-extension/manifest.json > build/firefox-extension/manifest.json
