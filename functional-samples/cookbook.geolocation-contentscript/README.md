This recipe shows how to get `geolocation` access within a [content script][5]

## Context

To get geolocation information in extensions, use the same [`navigator.geolocation`][6] DOM API that any website normally would. This demo shows how to access this data in a [content script][5]. We also have demos for a [Service Worker][4](via [offscreenDocument][2], and using a [popup][3].

## Running this extension

1. Clone this repository.
1. Load this directory in Chrome as an [unpacked extension][1].
1. Open the Extension menu and click the extension named "Geolocation - content script".

[1]: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked
[2]: https://developer.chrome.com/docs/extensions/reference/offscreen/
[3]: functional-samples/cookbook.geolocation-popup
[4]: functional-samples/cookbook.geolocation-offscreen
[5]: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
[6]: https://developer.mozilla.org/docs/Web/API/Navigator/geolocation