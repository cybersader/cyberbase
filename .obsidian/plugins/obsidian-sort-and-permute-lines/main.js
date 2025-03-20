'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var checkboxRegex = /^(\s*)- \[[^ ]\]/gi;
var MyPlugin = /** @class */ (function (_super) {
    __extends(MyPlugin, _super);
    function MyPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyPlugin.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var compare, comp;
            var _this = this;
            return __generator(this, function (_a) {
                console.log('loading ' + this.manifest.name);
                compare = new Intl.Collator(navigator.language, {
                    usage: 'sort',
                    sensitivity: 'base',
                    numeric: true,
                    ignorePunctuation: true,
                }).compare;
                this.compare = compare;
                this.addCommand({
                    id: 'sort-alphabetically-with-checkboxes',
                    name: 'Sort alphabetically with checkboxes',
                    callback: (function () { return _this.sortAlphabetically(false, false); }),
                });
                this.addCommand({
                    id: 'sort-list-alphabetically-with-checkboxes',
                    name: 'Sort current list alphabetically with checkboxes',
                    callback: (function () { return _this.sortAlphabetically(true, false); }),
                });
                this.addCommand({
                    id: 'sort-alphabetically',
                    name: 'Sort alphabetically',
                    callback: (function () { return _this.sortAlphabetically(false, true); }),
                });
                this.addCommand({
                    id: 'sort-list-alphabetically',
                    name: 'Sort current list alphabetically',
                    callback: (function () { return _this.sortAlphabetically(true, true); }),
                });
                this.addCommand({
                    id: 'sort-checkboxes',
                    name: 'Sort current list by checkboxes',
                    callback: function () { return _this.sortListRecursively(true, function (a, b) {
                        if (checkboxRegex.test(a.title.source) && !checkboxRegex.test(b.title.source))
                            return 1;
                        if (!checkboxRegex.test(a.title.source) && checkboxRegex.test(b.title.source))
                            return -1;
                        return 0;
                    }); },
                });
                this.addCommand({
                    id: 'sort-length',
                    name: 'Sort by length of line',
                    callback: (function () { return _this.sortLengthOfLine(); }),
                });
                this.addCommand({
                    id: 'sort-headings',
                    name: 'Sort headings',
                    callback: (function () { return _this.sortHeadings(); }),
                });
                this.addCommand({
                    id: 'permute-reverse',
                    name: 'Reverse lines',
                    callback: (function () { return _this.permuteReverse(); }),
                });
                this.addCommand({
                    id: 'permute-shuffle',
                    name: 'Shuffle lines',
                    callback: (function () { return _this.permuteShuffle(); }),
                });
                comp = function (a, b) { return _this.compare(a.title.formatted.trim(), b.title.formatted.trim()); };
                this.addCommand({
                    id: 'sort-list-recursively',
                    name: 'Sort current list recursively',
                    callback: (function () { return _this.sortListRecursively(true, comp); }),
                });
                this.addCommand({
                    id: 'sort-list-recursively-with-checkboxes',
                    name: 'Sort current list recursively with checkboxes',
                    callback: (function () { return _this.sortListRecursively(false, comp); }),
                });
                return [2 /*return*/];
            });
        });
    };
    MyPlugin.prototype.onunload = function () {
        console.log('unloading ' + this.manifest.name);
    };
    MyPlugin.prototype.sortAlphabetically = function (fromCurrentList, ignoreCheckboxes) {
        var _this = this;
        if (fromCurrentList === void 0) { fromCurrentList = false; }
        if (ignoreCheckboxes === void 0) { ignoreCheckboxes = true; }
        var lines = this.getLines(fromCurrentList, ignoreCheckboxes);
        if (lines.length === 0)
            return;
        var sortFunc = function (a, b) { return _this.compare(a.formatted.trim(), b.formatted.trim()); };
        lines.sort(sortFunc);
        this.setLines(lines, fromCurrentList);
    };
    MyPlugin.prototype.sortListRecursively = function (ignoreCheckboxes, compareFn) {
        var _this = this;
        var inputLines = this.getLines(true, ignoreCheckboxes);
        if (inputLines.length === 0 || inputLines.find(function (line) { return line.source.trim() == ""; }))
            return;
        var firstLineNumber = inputLines.first().lineNumber;
        var lines = __spreadArrays(new Array(firstLineNumber).fill(undefined), inputLines);
        var index = firstLineNumber;
        var cache = this.app.metadataCache.getFileCache(this.app.workspace.getActiveFile());
        var children = [];
        while (index < lines.length) {
            var newChild = this.getSortedListParts(lines, cache.listItems, index, compareFn);
            children.push(newChild);
            index = newChild.lastLine;
            index++;
        }
        children.sort(compareFn);
        var res = children.reduce(function (acc, cur) { return acc.concat(_this.listPartToList(cur)); }, []);
        this.setLines(res, true);
    };
    MyPlugin.prototype.getLineCacheFromLine = function (line, linesCache) {
        return linesCache.find(function (cacheItem) { return cacheItem.position.start.line === line; });
    };
    MyPlugin.prototype.getSortedListParts = function (lines, linesCache, index, compareFn) {
        var _a, _b, _c, _d, _e;
        var children = [];
        var startListCache = this.getLineCacheFromLine(index, linesCache);
        var title = lines[index];
        while (startListCache.parent < ((_a = this.getLineCacheFromLine(index + 1, linesCache)) === null || _a === void 0 ? void 0 : _a.parent) || (startListCache.parent < 0 && ((_b = this.getLineCacheFromLine(index + 1, linesCache)) === null || _b === void 0 ? void 0 : _b.parent) >= 0)) {
            index++;
            var newChild = this.getSortedListParts(lines, linesCache, index, compareFn);
            index = (_c = newChild.lastLine) !== null && _c !== void 0 ? _c : index;
            children.push(newChild);
        }
        var lastLine = (_e = (_d = children.last()) === null || _d === void 0 ? void 0 : _d.lastLine) !== null && _e !== void 0 ? _e : index;
        children.sort(compareFn);
        return {
            children: children,
            title: title,
            lastLine: lastLine,
        };
    };
    MyPlugin.prototype.listPartToList = function (list) {
        var _this = this;
        return list.children.reduce(function (acc, cur) { return acc.concat(_this.listPartToList(cur)); }, [list.title]);
    };
    MyPlugin.prototype.sortHeadings = function () {
        var lines = this.getLines();
        var res = this.getSortedHeadings(lines, 0, { headingLevel: 0, formatted: "", source: "", lineNumber: -1 });
        this.setLines(this.headingsToString(res).slice(1));
    };
    MyPlugin.prototype.headingsToString = function (heading) {
        var _this = this;
        var list = __spreadArrays([
            heading.title
        ], heading.lines);
        heading.headings.forEach(function (e) { return list.push.apply(list, _this.headingsToString(e)); });
        return list;
    };
    MyPlugin.prototype.getSortedHeadings = function (lines, from, heading) {
        var _this = this;
        var headings = [];
        var contentLines = [];
        var currentIndex = from;
        while (currentIndex < lines.length) {
            var current = lines[currentIndex];
            if (current.headingLevel <= heading.headingLevel) {
                break;
            }
            if (current.headingLevel) {
                headings.push(this.getSortedHeadings(lines, currentIndex + 1, current));
                currentIndex = headings.last().to;
            }
            else {
                contentLines.push(current);
            }
            currentIndex++;
        }
        return {
            lines: contentLines,
            to: headings.length > 0 ? headings.last().to : (currentIndex - 1),
            headings: headings.sort(function (a, b) {
                //First sort by heading level then alphabetically
                var res = a.title.headingLevel - b.title.headingLevel;
                if (res == 0) {
                    return _this.compare(a.title.formatted.trim(), b.title.formatted.trim());
                }
                else {
                    return res;
                }
            }),
            title: heading,
        };
    };
    MyPlugin.prototype.sortLengthOfLine = function () {
        var lines = this.getLines();
        if (lines.length === 0)
            return;
        lines.sort(function (a, b) { return a.formatted.length - b.formatted.length; });
        this.setLines(lines);
    };
    MyPlugin.prototype.permuteReverse = function () {
        var lines = this.getLines();
        if (lines.length === 0)
            return;
        lines.reverse();
        this.setLines(lines);
    };
    MyPlugin.prototype.permuteShuffle = function () {
        var lines = this.getLines();
        if (lines.length === 0)
            return;
        lines.shuffle();
        this.setLines(lines);
    };
    MyPlugin.prototype.getLines = function (fromCurrentList, ignoreCheckboxes) {
        var _a, _b;
        if (fromCurrentList === void 0) { fromCurrentList = false; }
        if (ignoreCheckboxes === void 0) { ignoreCheckboxes = true; }
        var view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view)
            return;
        var editor = view.editor;
        var file = view.file;
        var lines = editor.getValue().split("\n");
        var cache = this.app.metadataCache.getFileCache(file);
        var _c = this.getPosition(view, fromCurrentList), start = _c.start, end = _c.end;
        var headings = cache.headings;
        var links = __spreadArrays((_a = cache === null || cache === void 0 ? void 0 : cache.links) !== null && _a !== void 0 ? _a : [], (_b = cache === null || cache === void 0 ? void 0 : cache.embeds) !== null && _b !== void 0 ? _b : []);
        var myLines = lines.map(function (line, index) {
            var myLine = { source: line, formatted: line, headingLevel: undefined, lineNumber: index };
            links.forEach(function (e) {
                if (e.position.start.line != index)
                    return;
                var start = e.position.start;
                var end = e.position.end;
                myLine.formatted = myLine.formatted.replace(line.substring(start.col, end.col), e.displayText);
            });
            // Regex of cehckbox styles
            if (ignoreCheckboxes) {
                myLine.formatted = myLine.formatted.replace(checkboxRegex, "$1");
            }
            else {
                // Just a little bit dirty...
                myLine.formatted = myLine.formatted.replace(checkboxRegex, "$1ZZZZZZZZZZZZZZZZZZZZZZZZZ");
            }
            return myLine;
        });
        headings === null || headings === void 0 ? void 0 : headings.map(function (heading) { return myLines[heading.position.start.line].headingLevel = heading.level; });
        if (start != end) {
            return myLines.slice(start, end + 1);
        }
        else {
            return myLines;
        }
    };
    MyPlugin.prototype.setLines = function (lines, fromCurrentList) {
        if (fromCurrentList === void 0) { fromCurrentList = false; }
        var view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        var res = this.getPosition(view, fromCurrentList);
        var editor = view.editor;
        if (res.start != res.end) {
            editor.replaceRange(lines.map(function (e) { return e.source; }).join("\n"), { line: res.start, ch: 0 }, { line: res.end, ch: res.endLineLength });
        }
        else {
            editor.setValue(lines.map(function (e) { return e.source; }).join("\n"));
        }
    };
    MyPlugin.prototype.getPosition = function (view, fromCurrentList) {
        var _a, _b, _c;
        if (fromCurrentList === void 0) { fromCurrentList = false; }
        var cache = this.app.metadataCache.getFileCache(view.file);
        var editor = view.editor;
        var cursorStart = editor.getCursor("from").line;
        var cursorEnd = editor.getCursor("to").line;
        if (fromCurrentList) {
            var list = cache.sections.find(function (e) {
                return e.position.start.line <= cursorStart && e.position.end.line >= cursorEnd;
            });
            if (list) {
                cursorStart = list.position.start.line;
                cursorEnd = list.position.end.line;
            }
        }
        var curserEndLineLength = editor.getLine(cursorEnd).length;
        var frontStart = ((_c = (_b = (_a = cache.frontmatter) === null || _a === void 0 ? void 0 : _a.position) === null || _b === void 0 ? void 0 : _b.end) === null || _c === void 0 ? void 0 : _c.line) + 1;
        if (isNaN(frontStart)) {
            frontStart = 0;
        }
        var frontEnd = editor.lastLine();
        var frontEndLineLength = editor.getLine(frontEnd).length;
        if (cursorStart != cursorEnd) {
            return {
                start: cursorStart,
                end: cursorEnd,
                endLineLength: curserEndLineLength,
            };
        }
        else {
            return {
                start: frontStart,
                end: frontEnd,
                endLineLength: frontEndLineLength,
            };
        }
    };
    return MyPlugin;
}(obsidian.Plugin));

module.exports = MyPlugin;


/* nosourcemap */