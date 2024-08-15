const FileSystem = require("fs");
const fs = require("node:fs");
const file = FileSystem.readFileSync("./history.json", "utf8");
const messages = JSON.parse(file);
const map = new Map();
console.log(messages.length);
for (const message of messages) {
    const userId = message.from_id.user_id;
    if (!map.has(userId)) {
        map.set(userId, 1);
    }
    map.set(userId, map.get(userId) + 1);
}

const object = Object.fromEntries(map.entries());
fs.writeFileSync('./test.json', JSON.stringify(object));