const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tempChannels.json');

function load() {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function save(channels) {
  fs.writeFileSync(filePath, JSON.stringify(channels, null, 2));
}

function add(channelId) {
  const list = load();
  if (!list.includes(channelId)) {
    list.push(channelId);
    save(list);
  }
}

function remove(channelId) {
  const list = load().filter(id => id !== channelId);
  save(list);
}

function isTracked(channelId) {
  return load().includes(channelId);
}

module.exports = { add, remove, isTracked };
