let tabs = {};
let tabIds = [];

let focusedWindowId = undefined;
let currentWindowId = undefined;

async function bootstrap() {
  const currentWindow = await chrome.windows.getCurrent();
  currentWindowId = currentWindow.id;
  const focusedWindow = await chrome.windows.getLastFocused();
  focusedWindowId = focusedWindow.id;
  loadWindowList();
}

function isInt(i) {
  return typeof i == 'number' && !(i % 1) && !isNaN(i);
}

const windowTemplate = document.getElementById('windowItem').content;
const tabTemplate = document.getElementById('tabItem').content;

async function loadWindowList() {
  const windowList = await chrome.windows.getAll({ populate: true });
  tabs = {};
  tabIds = [];
  for (let i = 0; i < windowList.length; i++) {
    windowList[i].current = windowList[i].id == currentWindowId;
    windowList[i].focused = windowList[i].id == focusedWindowId;

    for (let j = 0; j < windowList[i].tabs.length; j++) {
      tabIds[tabIds.length] = windowList[i].tabs[j].id;
      tabs[windowList[i].tabs[j].id] = windowList[i].tabs[j];
    }
  }

  const output = document.getElementById('windowList');
  output.innerHTML = '';

  for (let window of windowList) {
    const windowItem = document.importNode(windowTemplate, true);
    renderWindow(window, windowItem.children[0]);

    output.appendChild(windowItem);
  }
}

function renderWindow(window, windowItem) {
  windowItem.id = `window_${window.id}`;
  windowItem.querySelector('.window_left').id = `left_${window.id}`;
  windowItem.querySelector('.window_top').id = `top_${window.id}`;
  windowItem.querySelector('.window_width').id = `width_${window.id}`;
  windowItem.querySelector('.window_height').id = `height_${window.id}`;
  windowItem.querySelector('.window_focused').id = `focused_${window.id}`;
  windowItem.querySelector('.window_current').id = `current_${window.id}`;
  windowItem.querySelector('.window_id').innerText = window.id;
  windowItem.querySelector('.window_left').value = window.left;
  windowItem.querySelector('.window_top').value = window.top;
  windowItem.querySelector('.window_width').value = window.width;
  windowItem.querySelector('.window_height').value = window.height;
  windowItem.querySelector('.window_focused').checked = window.focused;
  windowItem.querySelector('.window_current').checked = window.current;

  windowItem.querySelector('.window_refresh').addEventListener('click', () => {
    refreshWindow(window.id);
  });

  windowItem
    .querySelector('.update_window_button')
    .addEventListener('click', () => {
      updateWindow(window.id);
    });

  windowItem
    .querySelector('.remove_window_button')
    .addEventListener('click', () => {
      removeWindow(window.id);
    });

  windowItem
    .querySelector('.refresh_selected_tab_button')
    .addEventListener('click', () => {
      refreshSelectedTab(window.id);
    });

  windowItem.querySelector('#tabList').innerHTML = '';
  for (let tab of window.tabs) {
    const tabItem = document.importNode(tabTemplate, true);
    renderTab(tab, tabItem.children[0]);
    windowItem.querySelector('#tabList').appendChild(tabItem);
  }
}

function renderTab(tab, tabItem) {
  tabItem.id = `tab_${tab.id}`;
  tabItem.querySelector('.tab_index').id = `index_${tab.id}`;
  tabItem.querySelector('.tab_window_id').id = `windowId_${tab.id}`;
  tabItem.querySelector('.tab_title').id = `title_${tab.id}`;
  tabItem.querySelector('.tab_url').id = `url_${tab.id}`;
  tabItem.querySelector('.tab_selected').id = `selected_${tab.id}`;

  tabItem.querySelector('.tab_id').innerText = `TabId: ${tab.id}`;
  tabItem.querySelector('.tab_index').value = tab.index;
  tabItem.querySelector('.tab_window_id').value = tab.windowId;
  tabItem.querySelector('.tab_title').value = tab.title;
  tabItem.querySelector('.tab_url').value = tab.url;
  tabItem.querySelector('.tab_selected').checked = tab.selected;

  tabItem.querySelector('.move_tab_button').addEventListener('click', () => {
    moveTab(tab.id);
  });
  tabItem.querySelector('.refresh_tab_button').addEventListener('click', () => {
    refreshTab(tab.id);
  });
  tabItem.querySelector('.update_tab_button').addEventListener('click', () => {
    updateTab(tab.id);
  });
  tabItem.querySelector('.remove_tab_button').addEventListener('click', () => {
    removeTab(tab.id);
  });
}

function updateTabData(id) {
  const retval = {
    url: document.getElementById('url_' + id).value,
    selected: document.getElementById('selected_' + id).value ? true : false
  };

  return retval;
}

async function updateTab(id) {
  try {
    await chrome.tabs.update(id, updateTabData(id));
  } catch (e) {
    alert(e);
  }
}

function moveTabData(id) {
  return {
    index: parseInt(document.getElementById('index_' + id).value),
    windowId: parseInt(document.getElementById('windowId_' + id).value)
  };
}

function moveTab(id) {
  chrome.tabs.move(id, moveTabData(id)).catch(alert);
}

function createTabData(id) {
  return {
    index: parseInt(document.getElementById('index_' + id).value),
    windowId: parseInt(document.getElementById('windowId_' + id).value),
    url: document.getElementById('url_' + id).value,
    selected: document.getElementById('selected_' + id).value ? true : false
  };
}

function createTab() {
  const args = createTabData('new');

  if (!isInt(args.windowId)) delete args.windowId;
  if (!isInt(args.index)) delete args.index;

  chrome.tabs.create(args).catch(alert);
}

document
  .querySelector('#create_tab_button')
  .addEventListener('click', createTab);

async function updateAll() {
  try {
    for (let i = 0; i < tabIds.length; i++) {
      await chrome.tabs.update(tabIds[i], updateTabData(tabIds[i]));
    }
  } catch (e) {
    alert(e);
  }
}

async function moveAll() {
  appendToLog('moving all');
  try {
    for (let i = 0; i < tabIds.length; i++) {
      await chrome.tabs.move(tabIds[i], moveTabData(tabIds[i]));
    }
  } catch (e) {
    alert(e);
  }
}

function removeTab(tabId) {
  chrome.tabs
    .remove(tabId)
    .then(() => {
      appendToLog('tab: ' + tabId + ' removed.');
    })
    .catch(alert);
}

function appendToLog(logLine) {
  document
    .getElementById('log')
    .appendChild(document.createElement('div')).innerText = '> ' + logLine;
}

function clearLog() {
  document.getElementById('log').innerText = '';
}

chrome.windows.onCreated.addListener(function (createInfo) {
  appendToLog('windows.onCreated -- window: ' + createInfo.id);
  loadWindowList();
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
  focusedWindowId = windowId;
  appendToLog('windows.onFocusChanged -- window: ' + windowId);
  loadWindowList();
});

chrome.windows.onRemoved.addListener(function (windowId) {
  appendToLog('windows.onRemoved -- window: ' + windowId);
  loadWindowList();
});

chrome.tabs.onCreated.addListener(function (tab) {
  appendToLog(
    'tabs.onCreated -- window: ' +
      tab.windowId +
      ' tab: ' +
      tab.id +
      ' title: ' +
      tab.title +
      ' index ' +
      tab.index +
      ' url ' +
      tab.url
  );
  loadWindowList();
});

chrome.tabs.onAttached.addListener(function (tabId, props) {
  appendToLog(
    'tabs.onAttached -- window: ' +
      props.newWindowId +
      ' tab: ' +
      tabId +
      ' index ' +
      props.newPosition
  );
  loadWindowList();
});

chrome.tabs.onMoved.addListener(function (tabId, props) {
  appendToLog(
    'tabs.onMoved -- window: ' +
      props.windowId +
      ' tab: ' +
      tabId +
      ' from ' +
      props.fromIndex +
      ' to ' +
      props.toIndex
  );
  loadWindowList();
});

async function refreshTab(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const output = document.getElementById('tab_' + tab.id);
  if (!output) return;
  renderTab(tab, output);
  appendToLog('tab refreshed -- tabId: ' + tab.id + ' url: ' + tab.url);
}

chrome.tabs.onUpdated.addListener(function (tabId, props) {
  appendToLog(
    'tabs.onUpdated -- tab: ' +
      tabId +
      ' status ' +
      props.status +
      ' url ' +
      props.url
  );
  refreshTab(tabId);
});

chrome.tabs.onDetached.addListener(function (tabId, props) {
  appendToLog(
    'tabs.onDetached -- window: ' +
      props.oldWindowId +
      ' tab: ' +
      tabId +
      ' index ' +
      props.oldPosition
  );
  loadWindowList();
});

chrome.tabs.onActivated.addListener(function (props) {
  appendToLog(
    'tabs.onActivated -- window: ' + props.windowId + ' tab: ' + props.tabId
  );
  loadWindowList();
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  appendToLog('tabs.onRemoved -- tab: ' + tabId);
  loadWindowList();
});

async function createWindow() {
  const args = {
    left: parseInt(document.getElementById('new_window_left').value),
    top: parseInt(document.getElementById('new_window_top').value),
    width: parseInt(document.getElementById('new_window_width').value),
    height: parseInt(document.getElementById('new_window_height').value),
    url: document.getElementById('new_window_url').value
  };

  if (!isInt(args.left)) delete args.left;
  if (!isInt(args.top)) delete args.top;
  if (!isInt(args.width)) delete args.width;
  if (!isInt(args.height)) delete args.height;
  if (!args.url) delete args.url;

  chrome.windows.create(args).catch(alert);
}

document
  .getElementById('create_window_button')
  .addEventListener('click', createWindow);

async function refreshWindow(windowId) {
  const window = await chrome.windows.get(windowId);
  const tabList = await chrome.tabs.query({ windowId: windowId });
  window.tabs = tabList;
  const output = document.getElementById('window_' + window.id);
  if (!output) return;
  renderWindow(window, output);
}

function updateWindowData(id) {
  const retval = {
    left: parseInt(document.getElementById('left_' + id).value),
    top: parseInt(document.getElementById('top_' + id).value),
    width: parseInt(document.getElementById('width_' + id).value),
    height: parseInt(document.getElementById('height_' + id).value)
  };
  if (!isInt(retval.left)) delete retval.left;
  if (!isInt(retval.top)) delete retval.top;
  if (!isInt(retval.width)) delete retval.width;
  if (!isInt(retval.height)) delete retval.height;

  return retval;
}

function updateWindow(id) {
  chrome.windows.update(id, updateWindowData(id)).catch(alert);
}

function removeWindow(windowId) {
  chrome.windows
    .remove(windowId)
    .then(() => {
      appendToLog('window: ' + windowId + ' removed.');
    })
    .catch(alert);
}

async function refreshSelectedTab(windowId) {
  const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
  const output = document.getElementById('tab_' + tabs[0].id);
  if (!output) return;
  renderTab(tabs[0], output);
  appendToLog(
    'selected tab refreshed -- tabId: ' + tabs[0].id + ' url:' + tabs[0].url
  );
}

document.addEventListener('DOMContentLoaded', function () {
  bootstrap();
});

document
  .querySelector('.load_window_list_button')
  .addEventListener('click', () => {
    loadWindowList();
  });
document.querySelector('.update_all_button').addEventListener('click', () => {
  updateAll();
});
document.querySelector('.move_all_button').addEventListener('click', () => {
  moveAll();
});
document.querySelector('.clear_log_button').addEventListener('click', () => {
  clearLog();
});
document.querySelector('.new_window_button').addEventListener('click', () => {
  chrome.windows.create();
});