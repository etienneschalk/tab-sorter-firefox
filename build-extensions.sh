# Build the extension
# Note: jq is required to edit JSON, see https://jqlang.github.io/jq/

# CHROME 
mkdir -p build/chrome-extension
cp -R template-extension/** build/chrome-extension
# The Background Page is not supported anymore for chrome, and useless as service_worker is used.
rm build/chrome-extension/background-tab-sorter.html
# Remove Firefox-specific settings
jq 'del(.browser_specific_settings)' template-extension/manifest.json > build/chrome-extension/manifest.json

# FIREFOX
mkdir -p build/firefox-extension
cp -R template-extension/** build/firefox-extension
# Firefox does not support yet service workers
jq '.background = { "page": "background-tab-sorter.html" }' template-extension/manifest.json > build/firefox-extension/manifest.json

# CREATE ZIP FILES
echo "Creating zip files..."
cd build/chrome-extension
zip -r ../chrome-extension.zip *
cd ../firefox-extension
zip -r ../firefox-extension.zip *
cd ../..
echo "Build complete! Extension zip files created in build/ directory."

# Remove build directory
echo "Removing build directory..."
rm -rf build/chrome-extension
rm -rf build/firefox-extension
echo "Build directory removed."