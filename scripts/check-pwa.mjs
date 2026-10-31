import { readFileSync, existsSync } from "node:fs";
import { Script } from "node:vm";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const html = read("../index.html");
const manifestText = read("../manifest.webmanifest");
const sw = read("../sw.js");

const manifest = JSON.parse(manifestText);
assert.equal(manifest.name, "InstaPlan", "Manifest must name the app InstaPlan");
assert.equal(manifest.display, "standalone", "App should request standalone display");
assert.ok(manifest.start_url, "Manifest needs a start_url");
assert.ok(html.includes('rel="manifest" href="./manifest.webmanifest"'), "index.html must link the manifest");
assert.ok(existsSync(new URL("../icon.svg", import.meta.url)), "Manifest icon file must exist");
assert.ok(manifest.icons.some((icon) => icon.src === "./icon.svg"), "Manifest must reference icon.svg");
assert.ok(html.includes("navigator.serviceWorker.register('./sw.js')"), "Page must register the service worker");
assert.ok(sw.includes('caches.match("./index.html")'), "Service worker should provide an offline navigation fallback");

const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
assert.ok(inlineScripts.length > 0, "Expected at least one inline application script");
inlineScripts.forEach((match, index) => new Script(match[1], { filename: `index-inline-${index + 1}.js` }));
new Script(sw, { filename: "sw.js" });

console.log("InstaPlan PWA static checks passed: manifest, icon, HTML links, service worker references, JavaScript syntax.");
