/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
window.chrome.app.runtime.onLaunched.addListener(function() {
  runApp();
});

/**
 * Listens for the app restarting then re-creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 */
window.chrome.app.runtime.onRestarted.addListener(function() {
  runApp();
});

/**
 * Creates the window for the application.
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
function runApp() {
  window.chrome.app.window.create(
    'browser.html',
    {
      'id': 'browserWinID',
      'innerBounds': {
        'left': 0,
        'top': 0,
        'minWidth': 1024,
        'minHeight': 768
      }
    },
    function(newWindow) {
      // Do not inject meaningful window.newWindowEvent; browser will instead
      // load the homepage
      newWindow.contentWindow.newWindowEvent = null;
    });
}