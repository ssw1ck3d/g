/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
let Context$1 = class Context {
  constructor(values) {
    for (const k in values) this[k] = values[k];
  }
  sub(newValues) {
    if (newValues === undefined) newValues = {};
    const sub = Object.create(this);

    const alreadyApplied = {};
    for (const k in sub) {
      if (sub[k] instanceof Context) {
        const newValuesForK = newValues.hasOwnProperty(k)
          ? newValues[k]
          : undefined;
        sub[k] = sub[k].sub(newValuesForK);
        alreadyApplied[k] = true;
      }
    }

    for (const k in newValues) {
      if (alreadyApplied[k]) continue;
      sub[k] = newValues[k];
    }

    return sub;
  }
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class Exit extends Error {
  constructor(code) {
    super(`exit ${code}`);
    this.code = code;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_basename = {
  name: "basename",
  usage: "basename PATH [SUFFIX]",
  description:
    "Print PATH without leading directory segments.\n\n" +
    "If SUFFIX is provided, it is removed from the end of the result.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    let string = ctx.locals.positionals[0];
    const suffix = ctx.locals.positionals[1];

    if (string === undefined) {
      await ctx.externs.err.write("basename: Missing path argument\n");
      throw new Exit(1);
    }
    if (ctx.locals.positionals.length > 2) {
      await ctx.externs.err.write(
        "basename: Too many arguments, expected 1 or 2\n",
      );
      throw new Exit(1);
    }

    // https://pubs.opengroup.org/onlinepubs/9699919799/utilities/basename.html

    // 1. If string is a null string, it is unspecified whether the resulting string is '.' or a null string.
    //    In either case, skip steps 2 through 6.
    if (string === "") {
      string = ".";
    } else {
      // 2. If string is "//", it is implementation-defined whether steps 3 to 6 are skipped or processed.
      // NOTE: We process it normally.

      // 3. If string consists entirely of <slash> characters, string shall be set to a single <slash> character.
      //    In this case, skip steps 4 to 6.
      if (/^\/+$/.test(string)) {
        string = "/";
      } else {
        // 4. If there are any trailing <slash> characters in string, they shall be removed.
        string = string.replace(/\/+$/, "");

        // 5. If there are any <slash> characters remaining in string, the prefix of string up to and including
        //    the last <slash> character in string shall be removed.
        const lastSlashIndex = string.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          string = string.substring(lastSlashIndex + 1);
        }

        // 6. If the suffix operand is present, is not identical to the characters remaining in string, and is
        //    identical to a suffix of the characters remaining in string, the suffix suffix shall be removed
        //    from string. Otherwise, string is not modified by this step. It shall not be considered an error
        //    if suffix is not found in string.
        if (
          suffix !== undefined &&
          suffix !== string &&
          string.endsWith(suffix)
        ) {
          string = string.substring(0, string.length - suffix.length);
        }
      }
    }

    // The resulting string shall be written to standard output.
    await ctx.externs.out.write(string + "\n");
  },
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) ; else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

var pathBrowserify = posix;

var path_ = /*@__PURE__*/getDefaultExportFromCjs(pathBrowserify);

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const resolveRelativePath = (vars, relativePath) => {
  if (!relativePath) {
    // If relativePath is undefined, return home directory
    return vars.home;
  }
  if (relativePath.startsWith("/")) {
    return relativePath;
  }
  if (relativePath.startsWith("~")) {
    return path_.resolve(vars.home, "." + relativePath.slice(1));
  }
  return path_.resolve(vars.pwd, relativePath);
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_cat = {
  name: "cat",
  usage: "cat [FILE...]",
  description:
    "Concatenate the FILE(s) and print the result.\n\n" +
    "If no FILE is given, or a FILE is `-`, read the standard input.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  input: {
    syncLines: true,
  },
  output: "text",
  execute: async (ctx) => {
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    const paths = [...positionals];
    if (paths.length < 1) paths.push("-");

    for (const relPath of paths) {
      if (relPath === "-") {
        let line, done;
        const next_line = async () => {
          ({ value: line, done } = await ctx.externs.in_.read());
          console.log("CAT LOOP", { line, done });
        };
        for (await next_line(); !done; await next_line()) {
          await ctx.externs.out.write(line);
        }
        continue;
      }
      const absPath = resolveRelativePath(ctx.vars, relPath);

      const result = await filesystem.read(absPath);

      await ctx.externs.out.write(result);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_cd = {
  name: "cd",
  usage: "cd PATH",
  description: "Change the current directory to PATH.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    // ctx.params to access processed args
    // ctx.args to access raw args
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    let [target] = positionals;
    target = resolveRelativePath(ctx.vars, target);

    const result = await filesystem.readdir(target);

    if (result.$ === "error") {
      await ctx.externs.err.write("cd: error: " + result.message + "\n");
      throw new Exit(1);
    }

    ctx.vars.pwd = target;
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const SHELL_VERSIONS = [
  {
    v: "0.2.4",
    changes: [
      "more completers for tab-completion",
      "help updates",
      '"which" command added',
      '"date" command added',
      "improvements when running under node.js",
    ],
  },
  {
    v: "0.2.3",
    changes: [
      '"printf" command added',
      '"help" command updated',
      '"errno" command added',
      "POSIX error code associations added",
    ],
  },
  {
    v: "0.2.2",
    changes: [
      "wc works with BLOB inputs",
      '"~" path resolution fixed',
      '"head" command added',
      '"tail" command updated',
      '"ls" symlink support improved',
      '"sort" command added',
      "Testing improved",
      '"cd" with no arguments works',
      "Filesystem errors are more consistent",
      '"help" output improved',
      '"pwd" argument processing updated',
    ],
  },
  {
    v: "0.2.1",
    changes: [
      "commands: true, false",
      "commands: basename, dirname",
      "more node.js support",
      "wc command",
      "sleep command",
      "improved coreutils documentation",
      "updates to existing coreutils",
      "readline fixes",
    ],
  },
  {
    v: "0.2.0",
    changes: [
      "brand change: Phoenix Shell",
      "open-sourced under AGPL-3.0",
      "new commands: ai, txt2img, jq, and more",
      "added login command",
      "coreutils updates",
      "added command substitution",
      "parser improvements",
    ],
  },
  {
    v: "0.1.10",
    changes: ["new input parser", "add pwd command"],
  },
  {
    v: "0.1.9",
    changes: [
      "add help command",
      "add changelog command",
      "add ioctl messages for window size",
      "add env.ROWS and env.COLS",
    ],
  },
  {
    v: "0.1.8",
    changes: ["add neofetch command", "add simple tab completion"],
  },
  {
    v: "0.1.7",
    changes: ["add clear and printenv"],
  },
  {
    v: "0.1.6",
    changes: ["add redirect syntax"],
  },
  {
    v: "0.1.5",
    changes: ["add cp command"],
  },
  {
    v: "0.1.4",
    changes: ["improve error handling"],
  },
  {
    v: "0.1.3",
    changes: [
      "fixes for existing commands",
      "mv added",
      "cat added",
      "readline history (transient) added",
    ],
  },
  {
    v: "0.1.2",
    changes: ["add echo", "fix synchronization of pipe coupler"],
  },
];

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

async function printVersion(ctx, version) {
  await ctx.externs.out.write(`\x1B[35;1m[v${version.v}]\x1B[0m\n`);
  for (const change of version.changes) {
    await ctx.externs.out.write(`\x1B[32;1m+\x1B[0m ${change}\n`);
  }
}

var module_changelog = {
  name: "changelog",
  description:
    "Print the changelog for the Phoenix Shell, ordered oldest to newest.",
  args: {
    $: "simple-parser",
    allowPositionals: false,
    options: {
      latest: {
        description: "Print only the changes for the most recent version",
        type: "boolean",
      },
    },
  },
  execute: async (ctx) => {
    if (ctx.locals.values.latest) {
      await printVersion(ctx, SHELL_VERSIONS[0]);
      return;
    }

    for (const version of SHELL_VERSIONS.toReversed()) {
      await printVersion(ctx, version);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_clear = {
  name: "clear",
  usage: "clear",
  description: "Clear the terminal output.",
  args: {
    // TODO: add 'none-parser'
    $: "simple-parser",
    allowPositionals: false,
  },
  execute: async (ctx) => {
    await ctx.externs.out.write("\x1B[H\x1B[2J");
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_cp = {
  name: "cp",
  usage: [
    "cp [OPTIONS] SOURCE DESTINATION",
    "cp [OPTIONS] SOURCE... DIRECTORY",
  ],
  description:
    "Copy the SOURCE to DESTINATION, or multiple SOURCE(s) to DIRECTORY.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      recursive: {
        description: "Copy directories recursively",
        type: "boolean",
        short: "R",
      },
    },
  },
  execute: async (ctx) => {
    const { positionals, values } = ctx.locals;
    const { out, err } = ctx.externs;
    const { filesystem } = ctx.platform;

    if (positionals.length < 1) {
      await err.write("cp: missing file operand\n");
      throw new Exit(1);
    }

    const srcRelPath = positionals.shift();

    if (positionals.length < 1) {
      const aft = positionals[0];
      await err.write(`cp: missing destination file operand after '${aft}'\n`);
      throw new Exit(1);
    }

    const dstRelPath = positionals.shift();

    const srcAbsPath = resolveRelativePath(ctx.vars, srcRelPath);
    let dstAbsPath = resolveRelativePath(ctx.vars, dstRelPath);

    const srcStat = await filesystem.stat(srcAbsPath);
    if (srcStat && srcStat.is_dir && !values.recursive) {
      await err.write(
        `cp: -R not specified; skipping directory '${srcRelPath}'\n`,
      );
      throw new Exit(1);
    }

    await filesystem.copy(srcAbsPath, dstAbsPath);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// "When no formatting operand is specified, the output in the POSIX locale shall be equivalent to specifying:"
const DEFAULT_FORMAT = "+%a %b %e %H:%M:%S %Z %Y";

function padStart(number, length, padChar) {
  let string = number.toString();
  if (string.length >= length) {
    return string;
  }

  return padChar.repeat(length - string.length) + string;
}

function highlight$1(text) {
  return `\x1B[92m${text}\x1B[0m`;
}

var module_date = {
  name: "date",
  usage: "date [OPTIONS] [+FORMAT]",
  description:
    "Print the system date and time\n\n" +
    "If FORMAT is provided, it controls the date format used.",
  helpSections: {
    "Format Sequences":
      "The following format sequences are understood:\n\n" +
      `    ${highlight$1("%a")}     Weekday name, abbreviated.\n` +
      `    ${highlight$1("%A")}     Weekday name\n` +
      `    ${highlight$1("%b")}     Month name, abbreviated\n` +
      `    ${highlight$1("%B")}     Month name\n` +
      `    ${highlight$1("%c")}     Default date and time representation\n` +
      `    ${highlight$1("%C")}     Century, 2 digits padded with '0'\n` +
      `    ${highlight$1("%d")}     Day of the month, 2 digits padded with '0'\n` +
      `    ${highlight$1("%D")}     Date in the format mm/dd/yy\n` +
      `    ${highlight$1("%e")}     Day of the month, 2 characters padded with leading spaces\n` +
      `    ${highlight$1("%h")}     Same as ${highlight$1("%b")}\n` +
      `    ${highlight$1("%H")}     Hour (24-hour clock), 2 digits padded with '0'\n` +
      `    ${highlight$1("%I")}     Hour (12-hour clock), 2 digits padded with '0'\n` +
      // `    ${highlight('%j')}     TODO: Day of the year, 3 digits padded with '0'\n` +
      `    ${highlight$1("%m")}     Month, 2 digits padded with '0', with January = 01\n` +
      `    ${highlight$1("%M")}     Minutes, 2 digits padded with '0'\n` +
      `    ${highlight$1("%n")}     A newline character\n` +
      `    ${highlight$1("%p")}     AM or PM\n` +
      `    ${highlight$1("%r")}     Time (12-hour clock) with AM/PM, as 'HH:MM:SS AM/PM'\n` +
      `    ${highlight$1("%S")}     Seconds, 2 digits padded with '0'\n` +
      `    ${highlight$1("%t")}     A tab character\n` +
      `    ${highlight$1("%T")}     Time (24-hour clock), as 'HH:MM:SS'\n` +
      `    ${highlight$1("%u")}     Weekday as a number, with Monday = 1 and Sunday = 7\n` +
      // `    ${highlight('%U')}     TODO: Week of the year (Sunday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Sunday shall be considered to be in week 0.\n` +
      // `    ${highlight('%V')}     TODO: Week of the year (Monday as the first day of the week) as a decimal number [01,53]. If the week containing January 1 has four or more days in the new year, then it shall be considered week 1; otherwise, it shall be the last week of the previous year, and the next week shall be week 1.\n` +
      `    ${highlight$1("%w")}     Weekday as a number, with Sunday = 0\n` +
      // `    ${highlight('%W')}     TODO: Week of the year (Monday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Monday shall be considered to be in week 0.\n` +
      `    ${highlight$1("%x")}     Default date representation\n` +
      `    ${highlight$1("%X")}     Default time representation\n` +
      `    ${highlight$1("%y")}     Year within century, 2 digits padded with '0'\n` +
      `    ${highlight$1("%Y")}     Year\n` +
      `    ${highlight$1("%Z")}     Timezone name, if it can be determined\n` +
      `    ${highlight$1("%%")}     A percent sign\n`,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { out, err } = ctx.externs;
    const { positionals } = ctx.locals;

    if (positionals.length > 1) {
      await err.write("date: Too many arguments\n");
      throw new Exit(1);
    }

    let format = positionals.shift() ?? DEFAULT_FORMAT;

    if (!format.startsWith("+")) {
      await err.write("date: Format does not begin with `+`\n");
      throw new Exit(1);
    }
    format = format.substring(1);

    // TODO: Should we use the server time instead? Maybe put that behind an option.
    const date = new Date();
    const locale = "en-US"; // TODO: POSIX: Pull this from the user's settings.

    let output = "";
    for (let i = 0; i < format.length; i++) {
      let char = format[i];
      if (char === "%") {
        char = format[++i];
        switch (char) {
          // "Locale's abbreviated weekday name."
          case "a": {
            output += date.toLocaleDateString(locale, { weekday: "short" });
            break;
          }

          // "Locale's full weekday name."
          case "A": {
            output += date.toLocaleDateString(locale, { weekday: "long" });
            break;
          }

          // "Locale's abbreviated month name."
          case "b":
          // "A synonym for %b."
          case "h": {
            output += date.toLocaleDateString(locale, { month: "short" });
            break;
          }

          // "Locale's full month name."
          case "B": {
            output += date.toLocaleDateString(locale, { month: "long" });
            break;
          }

          // "Locale's appropriate date and time representation."
          case "c": {
            output += date.toLocaleString(locale);
            break;
          }

          // "Century (a year divided by 100 and truncated to an integer) as a decimal number [00,99]."
          case "C": {
            output += Math.trunc(date.getFullYear() / 100);
            break;
          }

          // "Day of the month as a decimal number [01,31]."
          case "d": {
            output += padStart(date.getDate(), 2, "0");
            break;
          }

          // "Date in the format mm/dd/yy."
          case "D": {
            const month = padStart(date.getMonth() + 1, 2, "0");
            const day = padStart(date.getDate(), 2, "0");
            const year = padStart(date.getFullYear() % 100, 2, "0");
            output += `${month}/${day}/${year}`;
            break;
          }

          // "Day of the month as a decimal number [1,31] in a two-digit field with leading <space>
          // character fill."
          case "e": {
            output += padStart(date.getDate(), 2, " ");
            break;
          }

          // "Hour (24-hour clock) as a decimal number [00,23]."
          case "H": {
            output += padStart(date.getHours(), 2, "0");
            break;
          }

          // "Hour (12-hour clock) as a decimal number [01,12]."
          case "I": {
            output += padStart(date.getHours() % 12 || 12, 2, "0");
            break;
          }

          // TODO: "Day of the year as a decimal number [001,366]."
          case "j":
            break;

          // "Month as a decimal number [01,12]."
          case "m": {
            // getMonth() starts at 0 for January
            output += padStart(date.getMonth() + 1, 2, "0");
            break;
          }

          // "Minute as a decimal number [00,59]."
          case "M": {
            output += padStart(date.getMinutes(), 2, "0");
            break;
          }

          // "A <newline>."
          case "n":
            output += "\n";
            break;

          // "Locale's equivalent of either AM or PM."
          case "p": {
            // TODO: We should access this from the locale.
            output += date.getHours() < 12 ? "AM" : "PM";
            break;
          }

          // "12-hour clock time [01,12] using the AM/PM notation; in the POSIX locale, this shall be
          // equivalent to %I : %M : %S %p."
          case "r": {
            const rawHours = date.getHours();
            const hours = padStart(rawHours % 12 || 12, 2, "0");
            // TODO: We should access this from the locale.
            const am_pm = rawHours < 12 ? "AM" : "PM";
            const minutes = padStart(date.getMinutes(), 2, "0");
            const seconds = padStart(date.getSeconds(), 2, "0");
            output += `${hours}:${minutes}:${seconds} ${am_pm}`;
            break;
          }

          // "Seconds as a decimal number [00,60]."
          case "S": {
            output += padStart(date.getSeconds(), 2, "0");
            break;
          }

          // "A <tab>."
          case "t":
            output += "\t";
            break;

          // "24-hour clock time [00,23] in the format HH:MM:SS."
          case "T": {
            const hours = padStart(date.getHours(), 2, "0");
            const minutes = padStart(date.getMinutes(), 2, "0");
            const seconds = padStart(date.getSeconds(), 2, "0");
            output += `${hours}:${minutes}:${seconds}`;
            break;
          }

          // "Weekday as a decimal number [1,7] (1=Monday)."
          case "u": {
            // getDay() returns 0 for Sunday
            output += date.getDay() || 7;
            break;
          }

          // TODO: "Week of the year (Sunday as the first day of the week) as a decimal number [00,53].
          //       All days in a new year preceding the first Sunday shall be considered to be in week 0."
          case "U":
            break;

          // TODO: "Week of the year (Monday as the first day of the week) as a decimal number [01,53].
          //       If the week containing January 1 has four or more days in the new year, then it shall be
          //       considered week 1; otherwise, it shall be the last week of the previous year, and the next
          //       week shall be week 1."
          case "V":
            break;

          // "Weekday as a decimal number [0,6] (0=Sunday)."
          case "w": {
            output += date.getDay();
            break;
          }

          // TODO: "Week of the year (Monday as the first day of the week) as a decimal number [00,53].
          //       All days in a new year preceding the first Monday shall be considered to be in week 0."
          case "W":
            break;

          // "Locale's appropriate date representation."
          case "x": {
            output += date.toLocaleDateString(locale);
            break;
          }

          // "Locale's appropriate time representation."
          case "X": {
            output += date.toLocaleTimeString(locale);
            break;
          }

          // "Year within century [00,99]."
          case "y": {
            output += date.getFullYear() % 100;
            break;
          }

          // "Year with century as a decimal number."
          case "Y": {
            output += date.getFullYear();
            break;
          }

          // "Timezone name, or no characters if no timezone is determinable."
          case "Z": {
            output += date.toLocaleDateString(locale, {
              timeZoneName: "short",
            });
            break;
          }

          // "A <percent-sign> character."
          case "%":
            output += "%";
            break;

          // We reached the end of the string, just output the %.
          case undefined:
            output += "%";
            break;

          // If nothing matched, just output the input verbatim
          default:
            output += "%" + char;
            break;
        }
        continue;
      }
      output += char;
    }
    output += "\n";

    await out.write(output);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_dcall = {
  name: "driver-call",
  usage: "driver-call METHOD [JSON]",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const [method, json] = positionals;

    const { drivers } = ctx.platform;

    let a_interface, a_method, a_args;
    if (method === "test") {
      // a_interface = 'puter-kvstore';
      // a_method = 'get';
      // a_args = { key: 'something' };
      (a_interface = "puter-image-generation"), (a_method = "generate");
      a_args = {
        prompt: "a blue cat",
      };
    } else {
      [a_interface, a_method] = method.split(":");
      try {
        a_args = JSON.parse(json);
      } catch (e) {
        a_args = {};
      }
    }

    const result = await drivers.call({
      interface: a_interface,
      method: a_method,
      args: a_args,
    });

    await ctx.externs.out.write(result);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_dirname = {
  name: "dirname",
  usage: "dirname PATH",
  description: "Print PATH without its final segment.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    let string = ctx.locals.positionals[0];
    const removeTrailingSlashes = (input) => {
      return input.replace(/\/+$/, "");
    };

    if (string === undefined) {
      await ctx.externs.err.write("dirname: Missing path argument\n");
      throw new Exit(1);
    }
    if (ctx.locals.positionals.length > 1) {
      await ctx.externs.err.write("dirname: Too many arguments, expected 1\n");
      throw new Exit(1);
    }

    // https://pubs.opengroup.org/onlinepubs/9699919799/utilities/dirname.html
    let skipToAfterStep8 = false;

    // 1. If string is //, skip steps 2 to 5.
    if (string !== "//") {
      // 2. If string consists entirely of <slash> characters, string shall be set to a single <slash> character.
      //    In this case, skip steps 3 to 8.
      if (string === "/".repeat(string.length)) {
        string = "/";
        skipToAfterStep8 = true;
      } else {
        // 3. If there are any trailing <slash> characters in string, they shall be removed.
        string = removeTrailingSlashes(string);

        // 4. If there are no <slash> characters remaining in string, string shall be set to a single <period> character.
        //    In this case, skip steps 5 to 8.
        if (string.indexOf("/") === -1) {
          string = ".";
          skipToAfterStep8 = true;
        }

        // 5. If there are any trailing non- <slash> characters in string, they shall be removed.
        else {
          const lastSlashIndex = string.lastIndexOf("/");
          if (lastSlashIndex === -1) {
            string = "";
          } else {
            string = string.substring(0, lastSlashIndex);
          }
        }
      }
    }

    if (!skipToAfterStep8) {
      // 6. If the remaining string is //, it is implementation-defined whether steps 7 and 8 are skipped or processed.
      // NOTE: We process it normally.

      // 7. If there are any trailing <slash> characters in string, they shall be removed.
      string = removeTrailingSlashes(string);

      // 8. If the remaining string is empty, string shall be set to a single <slash> character.
      if (string.length === 0) {
        string = "/";
      }
    }

    // The resulting string shall be written to standard output.
    await ctx.externs.out.write(string + "\n");
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/*
    Echo Escapes Implementations
    ----------------------------
    
    This documentation describes how functions in this file
    should be implemented.

    SITUATION
        The function is passed an object called `fns` containing
        functions to interact with the caller.

        It can be assumped that the called has already advanced
        a "text cursor" just past the first character identifying
        the escape sequence. For example, for escape sequence `\a`
        the text cursor will be positioned immediately after `a`.

    INPUTS
        function: peek()
            returns the character at the position of the text cursor

        function: advance(n=1)
            advances the text cursor `n` bytes forward

        function: markIgnored
            informs the caller that the escape sequence should be
            treated as literal text
        
        function: output
            commands the caller to write a string

        function: outputETX
            informs the caller that this is the end of text;
            \c is Ctrl+C is ETX
*/

// TODO: get these values from a common place
const NUL = String.fromCharCode(1);
const BEL$1 = String.fromCharCode(7);
const BS$1 = String.fromCharCode(8);
const VT$1 = String.fromCharCode(0x0b);
const FF$1 = String.fromCharCode(0x0c);
const ESC = String.fromCharCode(0x1b);

const HEX_REGEX = /^[A-Fa-f0-9]/;
const OCT_REGEX = /^[0-7]/;

const echo_escapes = {
  a: (caller) => caller.output(BEL$1),
  b: (caller) => caller.output(BS$1),
  c: (caller) => caller.outputETX(),
  e: (caller) => caller.output(ESC),
  f: (caller) => caller.output(FF$1),
  n: (caller) => caller.output("\n"),
  r: (caller) => caller.output("\r"),
  t: (caller) => caller.output("\t"),
  v: (caller) => caller.output(VT$1),
  x: (caller) => {
    let hexchars = "";
    while (caller.peek().match(HEX_REGEX)) {
      hexchars += caller.peek();
      caller.advance();

      if (hexchars.length === 2) break;
    }
    if (hexchars.length === 0) {
      caller.markIgnored();
      return;
    }
    caller.output(String.fromCharCode(Number.parseInt(hexchars, 16)));
  },
  0: (caller) => {
    let octchars = "";
    while (caller.peek().match(OCT_REGEX)) {
      octchars += caller.peek();
      caller.advance();

      if (octchars.length === 3) break;
    }
    if (octchars.length === 0) {
      caller.output(NUL);
      return;
    }
    caller.output(String.fromCharCode(Number.parseInt(hexchars, 8)));
  },
  "\\": (caller) => caller.output("\\"),
};

const processEscapes = (str) => {
  let output = "";

  let state = null;
  const states = {};
  states.STATE_ESCAPE = (i) => {
    state = states.STATE_NORMAL;

    let ignored = false;

    const chr = str[i];
    i++;
    const apiToCaller = {
      advance: (n) => {
        n = n ?? 1;
        i += n;
      },
      peek: () => str[i],
      output: (text) => (output += text),
      markIgnored: () => (ignored = true),
      outputETX: () => {
        state = states.STATE_ETX;
      },
    };
    echo_escapes[chr](apiToCaller);

    if (ignored) {
      output += "\\" + str[i];
      return;
    }

    return i;
  };
  states.STATE_NORMAL = (i) => {
    console.log("str@i", str[i]);
    if (str[i] === "\\") {
      console.log("escape state?");
      state = states.STATE_ESCAPE;
      return;
    }
    output += str[i];
  };
  states.STATE_ETX = () => str.length;
  state = states.STATE_NORMAL;

  for (let i = 0; i < str.length; ) {
    i = state(i) ?? i + 1;
  }

  return output;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_echo = {
  name: "echo",
  usage: "echo [OPTIONS] INPUTS...",
  description: "Print the inputs to standard output.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      "no-newline": {
        description: "Do not print a trailing newline",
        type: "boolean",
        short: "n",
      },
      "enable-escapes": {
        description: "Interpret backslash escape sequences",
        type: "boolean",
        short: "e",
      },
      "disable-escapes": {
        description: "Disable interpreting backslash escape sequences",
        type: "boolean",
        short: "E",
      },
    },
  },
  execute: async (ctx) => {
    const { positionals, values } = ctx.locals;

    let output = "";
    let notFirst = false;
    for (const positional of positionals) {
      if (notFirst) {
        output += " ";
      } else notFirst = true;
      output += positional;
    }

    if (!values.n) {
      output += "\n";
    }

    if (values.e && !values.E) {
      console.log("processing");
      output = processEscapes(output);
    }

    const lines = output.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      await ctx.externs.out.write(line + (isLast ? "" : "\n"));
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_env = {
  name: "env",
  usage: "env",
  description: "Print environment variables, one per line, as NAME=VALUE.",
  args: {
    // TODO: add 'none-parser'
    $: "simple-parser",
    allowPositionals: false,
  },
  execute: async (ctx) => {
    const env = ctx.env;
    const out = ctx.externs.out;

    for (const k in env) {
      await out.write(`${k}=${env[k]}\n`);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const ErrorCodes = {
  EACCES: Symbol.for("EACCES"),
  EADDRINUSE: Symbol.for("EADDRINUSE"),
  ECONNREFUSED: Symbol.for("ECONNREFUSED"),
  ECONNRESET: Symbol.for("ECONNRESET"),
  EEXIST: Symbol.for("EEXIST"),
  EFBIG: Symbol.for("EFBIG"),
  EINVAL: Symbol.for("EINVAL"),
  EIO: Symbol.for("EIO"),
  EISDIR: Symbol.for("EISDIR"),
  EMFILE: Symbol.for("EMFILE"),
  ENOENT: Symbol.for("ENOENT"),
  ENOSPC: Symbol.for("ENOSPC"),
  ENOTDIR: Symbol.for("ENOTDIR"),
  ENOTEMPTY: Symbol.for("ENOTEMPTY"),
  EPERM: Symbol.for("EPERM"),
  EPIPE: Symbol.for("EPIPE"),
  ETIMEDOUT: Symbol.for("ETIMEDOUT"),
};

// Codes taken from `errno` on Linux.
const ErrorMetadata = new Map([
  [ErrorCodes.EPERM, { code: 1, description: "Operation not permitted" }],
  [ErrorCodes.ENOENT, { code: 2, description: "File or directory not found" }],
  [ErrorCodes.EIO, { code: 5, description: "IO error" }],
  [ErrorCodes.EACCES, { code: 13, description: "Permission denied" }],
  [ErrorCodes.EEXIST, { code: 17, description: "File already exists" }],
  [ErrorCodes.ENOTDIR, { code: 20, description: "Is not a directory" }],
  [ErrorCodes.EISDIR, { code: 21, description: "Is a directory" }],
  [ErrorCodes.EINVAL, { code: 22, description: "Argument invalid" }],
  [ErrorCodes.EMFILE, { code: 24, description: "Too many open files" }],
  [ErrorCodes.EFBIG, { code: 27, description: "File too big" }],
  [ErrorCodes.ENOSPC, { code: 28, description: "Device out of space" }],
  [ErrorCodes.EPIPE, { code: 32, description: "Pipe broken" }],
  [ErrorCodes.ENOTEMPTY, { code: 39, description: "Directory is not empty" }],
  [ErrorCodes.EADDRINUSE, { code: 98, description: "Address already in use" }],
  [ErrorCodes.ECONNRESET, { code: 104, description: "Connection reset" }],
  [ErrorCodes.ETIMEDOUT, { code: 110, description: "Connection timed out" }],
  [ErrorCodes.ECONNREFUSED, { code: 111, description: "Connection refused" }],
]);

const errorFromIntegerCode = (code) => {
  for (const [errorCode, metadata] of ErrorMetadata) {
    if (metadata.code === code) {
      return errorCode;
    }
  }
  return undefined;
};

class PosixError extends Error {
  // posixErrorCode can be either a string, or one of the ErrorCodes above.
  // If message is undefined, a default message will be used.
  constructor(posixErrorCode, message) {
    let posixCode;
    if (typeof posixErrorCode === "symbol") {
      if (ErrorCodes[Symbol.keyFor(posixErrorCode)] !== posixErrorCode) {
        throw new Error(`Unrecognized POSIX error code: '${posixErrorCode}'`);
      }
      posixCode = posixErrorCode;
    } else {
      const code = ErrorCodes[posixErrorCode];
      if (!code)
        throw new Error(`Unrecognized POSIX error code: '${posixErrorCode}'`);
      posixCode = code;
    }

    super(message ?? ErrorMetadata.get(posixCode).description);
    this.posixCode = posixCode;
  }

  //
  // Helpers for constructing a PosixError when you don't already have an error message.
  //
  static AccessNotPermitted({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.EACCES,
      message ?? (path ? `Access not permitted to: '${path}'` : undefined),
    );
  }
  static AddressInUse({ message, address } = {}) {
    return new PosixError(
      ErrorCodes.EADDRINUSE,
      message ?? (address ? `Address '${address}' in use` : undefined),
    );
  }
  static ConnectionRefused({ message } = {}) {
    return new PosixError(ErrorCodes.ECONNREFUSED, message);
  }
  static ConnectionReset({ message } = {}) {
    return new PosixError(ErrorCodes.ECONNRESET, message);
  }
  static PathAlreadyExists({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.EEXIST,
      message ?? (path ? `Path already exists: '${path}'` : undefined),
    );
  }
  static FileTooLarge({ message } = {}) {
    return new PosixError(ErrorCodes.EFBIG, message);
  }
  static InvalidArgument({ message } = {}) {
    return new PosixError(ErrorCodes.EINVAL, message);
  }
  static IO({ message } = {}) {
    return new PosixError(ErrorCodes.EIO, message);
  }
  static IsDirectory({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.EISDIR,
      message ?? (path ? `Path is directory: '${path}'` : undefined),
    );
  }
  static TooManyOpenFiles({ message } = {}) {
    return new PosixError(ErrorCodes.EMFILE, message);
  }
  static DoesNotExist({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.ENOENT,
      message ?? (path ? `Path not found: '${path}'` : undefined),
    );
  }
  static NotEnoughSpace({ message } = {}) {
    return new PosixError(ErrorCodes.ENOSPC, message);
  }
  static IsNotDirectory({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.ENOTDIR,
      message ?? (path ? `Path is not a directory: '${path}'` : undefined),
    );
  }
  static DirectoryIsNotEmpty({ message, path } = {}) {
    return new PosixError(
      ErrorCodes.ENOTEMPTY,
      message ?? (path ? `Directory is not empty: '${path}'` : undefined),
    );
  }
  static OperationNotPermitted({ message } = {}) {
    return new PosixError(ErrorCodes.EPERM, message);
  }
  static BrokenPipe({ message } = {}) {
    return new PosixError(ErrorCodes.EPIPE, message);
  }
  static TimedOut({ message } = {}) {
    return new PosixError(ErrorCodes.ETIMEDOUT, message);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const maxErrorNameLength = Object.keys(ErrorCodes).reduce(
  (longest, name) => Math.max(longest, name.length),
  0,
);
const maxNumberLength = 3;

async function printSingleErrno(errorCode, out) {
  const metadata = ErrorMetadata.get(errorCode);
  const paddedName =
    errorCode.description +
    " ".repeat(maxErrorNameLength - errorCode.description.length);
  const code = metadata.code.toString();
  const paddedCode = " ".repeat(maxNumberLength - code.length) + code;
  await out.write(`${paddedName} ${paddedCode} ${metadata.description}\n`);
}

var module_errno = {
  name: "errno",
  usage: "errno [OPTIONS] [NAME-OR-CODE...]",
  description: "Look up and describe errno codes.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      list: {
        description: "List all errno values",
        type: "boolean",
        short: "l",
      },
      search: {
        description:
          "Search for errors whose descriptions contain NAME-OR-CODEs, case-insensitively",
        type: "boolean",
        short: "s",
      },
    },
  },
  execute: async (ctx) => {
    const { err, out } = ctx.externs;
    const { positionals, values } = ctx.locals;

    if (values.search) {
      for (const [errorCode, metadata] of ErrorMetadata) {
        const description = metadata.description.toLowerCase();
        let matches = true;
        for (const nameOrCode of positionals) {
          if (!description.includes(nameOrCode.toLowerCase())) {
            matches = false;
            break;
          }
        }
        if (matches) {
          await printSingleErrno(errorCode, out);
        }
      }
      return;
    }

    if (values.list) {
      for (const errorCode of ErrorMetadata.keys()) {
        await printSingleErrno(errorCode, out);
      }
      return;
    }

    let failedToMatchSomething = false;
    const fail = async (nameOrCode) => {
      await err.write(`ERROR: Not understood: ${nameOrCode}\n`);
      failedToMatchSomething = true;
    };

    for (const nameOrCode of positionals) {
      let errorCode = ErrorCodes[nameOrCode.toUpperCase()];
      if (errorCode) {
        await printSingleErrno(errorCode, out);
        continue;
      }

      const code = Number.parseInt(nameOrCode);
      if (!isFinite(code)) {
        await fail(nameOrCode);
        continue;
      }
      errorCode = errorFromIntegerCode(code);
      if (errorCode) {
        await printSingleErrno(errorCode, out);
        continue;
      }

      await fail(nameOrCode);
    }

    if (failedToMatchSomething) {
      throw new Exit(1);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_false = {
  name: "false",
  usage: "false",
  description: "Do nothing, and return a failure code.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    throw new Exit(1);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const lxor = (a, b) => (a ? !b : b);

var module_grep = {
  name: "grep",
  usage: "grep [OPTIONS] PATTERN FILE...",
  description: "Search FILE(s) for PATTERN, and print any matches.",
  input: {
    syncLines: true,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      "ignore-case": {
        description: "Match the pattern case-insensitively",
        type: "boolean",
        short: "i",
      },
      "invert-match": {
        description: "Print lines that do not match the pattern",
        type: "boolean",
        short: "v",
      },
      "line-number": {
        description: "Print the line number before each result",
        type: "boolean",
        short: "n",
      },
      recursive: {
        description: "Recursively search in directories",
        type: "boolean",
        short: "r",
      },
    },
  },
  output: "text",
  execute: async (ctx) => {
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    const [pattern, ...files] = positionals;

    const do_grep_dir = async (path) => {
      const entries = await filesystem.readdir(path);

      for (const entry of entries) {
        const entryPath = path_.join(path, entry.name);

        if (entry.type === "directory") {
          if (values.recursive) {
            await do_grep_dir(entryPath);
          }
        } else {
          await do_grep_file(entryPath);
        }
      }
    };

    const do_grep_line = async (line) => {
      if (line.endsWith("\n")) line = line.slice(0, -1);
      const re = new RegExp(pattern, values["ignore-case"] ? "i" : "");

      console.log(
        "Attempting to match line",
        line,
        "with pattern",
        pattern,
        "and re",
        re,
        "and parameters",
        values,
      );

      if (lxor(values["invert-match"], re.test(line))) {
        const lineNumber = values["line-number"] ? i + 1 : "";
        const lineToPrint = lineNumber ? lineNumber + ":" : "" + line;

        console.log(`LINE{${lineToPrint}}`);
        await ctx.externs.out.write(lineToPrint + "\n");
      }
    };

    const do_grep_lines = async (lines) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        await do_grep_line(line);
      }
    };

    const do_grep_file = async (path) => {
      console.log("about to read path", path);
      const data_blob = await filesystem.read(path);
      const data_string = await data_blob.text();

      const lines = data_string.split("\n");

      await do_grep_lines(lines);
    };

    if (files.length === 0) {
      if (values.recursive) {
        files.push(".");
      } else {
        files.push("-");
      }
    }

    console.log("FILES", files);

    for (let file of files) {
      if (file === "-") {
        for (;;) {
          const { value, done } = await ctx.externs.in_.read();
          if (done) break;
          await do_grep_line(value);
        }
      } else {
        file = resolveRelativePath(ctx.vars, file);
        const stat = await filesystem.stat(file);
        if (stat.is_dir) {
          if (values.recursive) {
            await do_grep_dir(file);
          } else {
            await ctx.externs.err.write("grep: " + file + ": Is a directory\n");
          }
        } else {
          await do_grep_file(file);
        }
      }
    }
  },
};

// Iterate the given file, one line at a time.
// TODO: Make this read one line at a time, instead of all at once.
async function* fileLines(
  ctx,
  relPath,
  options = { dashIsStdin: true },
) {
  let lines = [];
  if (options.dashIsStdin && relPath === "-") {
    lines = await ctx.externs.in_.collect();
  } else {
    const absPath = resolveRelativePath(ctx.vars, relPath);
    const fileData = await ctx.platform.filesystem.read(absPath);
    if (fileData instanceof Blob) {
      const arrayBuffer = await fileData.arrayBuffer();
      const fileText = new TextDecoder().decode(arrayBuffer);
      lines = fileText.split(/\n|\r|\r\n/).map((it) => it + "\n");
    } else if (typeof fileData === "string") {
      lines = fileData.split(/\n|\r|\r\n/).map((it) => it + "\n");
    } else {
      // ArrayBuffer or TypedArray
      const fileText = new TextDecoder().decode(fileData);
      lines = fileText.split(/\n|\r|\r\n/).map((it) => it + "\n");
    }
  }

  for (const line of lines) {
    yield line;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_head = {
  name: "head",
  usage: "head [OPTIONS] [FILE]",
  description:
    "Read a file and print the first lines to standard output.\n\n" +
    "Defaults to 10 lines unless --lines is given. " +
    "If no FILE is provided, or FILE is `-`, read standard input.",
  input: {
    syncLines: true,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      lines: {
        description: "Print the last COUNT lines",
        type: "string",
        short: "n",
        valueName: "COUNT",
      },
    },
  },
  execute: async (ctx) => {
    const { out, err } = ctx.externs;
    const { positionals, values } = ctx.locals;

    if (positionals.length > 1) {
      // TODO: Support multiple files (this is POSIX)
      await err.write("head: Only one FILE parameter is allowed\n");
      throw new Exit(1);
    }
    const relPath = positionals[0] || "-";

    let lineCount = 10;

    if (values.lines) {
      const parsedLineCount = Number.parseFloat(values.lines);
      if (
        isNaN(parsedLineCount) ||
        !Number.isInteger(parsedLineCount) ||
        parsedLineCount < 1
      ) {
        await err.write(`head: Invalid number of lines '${values.lines}'\n`);
        throw new Exit(1);
      }
      lineCount = parsedLineCount;
    }

    let processedLineCount = 0;
    for await (const line of fileLines(ctx, relPath)) {
      await out.write(line);
      processedLineCount++;
      if (processedLineCount >= lineCount) break;
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// TODO: Detect ANSI escape sequences in the text and treat them as 0 width?
// TODO: Ensure this works with multi-byte characters (UTF-8)
const wrapText = (text, width) => {
  // If width was invalid, just return the original text as a failsafe.
  if (typeof width !== "number" || width < 1) return [text];

  const lines = [];
  // This reduces all whitespace to single space characters. Is that a problem?
  const words = text.split(/\s+/);

  let currentLine = "";
  const splitWordIfTooLong = (word) => {
    while (word.length > width) {
      lines.push(word.substring(0, width - 1) + "-");
      word = word.substring(width - 1);
    }

    currentLine = word;
  };

  for (let word of words) {
    if (currentLine.length === 0) {
      splitWordIfTooLong(word);
      continue;
    }
    if (currentLine.length + 1 + word.length > width) {
      // Next line
      lines.push(currentLine);
      splitWordIfTooLong(word);
      continue;
    }
    currentLine += " " + word;
  }
  lines.push(currentLine);

  return lines;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const TAB_SIZE$1 = 8;

const DEFAULT_OPTIONS = {
  help: {
    description: "Display this help text, and exit",
    type: "boolean",
  },
};

const printUsage = async (command, out, vars) => {
  const { name, usage, description, args, helpSections } = command;
  const options = Object.create(DEFAULT_OPTIONS);
  Object.assign(options, args.options);

  const heading = async (text) => {
    await out.write(`\x1B[34;1m${text}:\x1B[0m\n`);
  };
  const colorOption = (text) => {
    return `\x1B[92m${text}\x1B[0m`;
  };
  const colorOptionArgument = (text) => {
    return `\x1B[91m${text}\x1B[0m`;
  };

  await heading("Usage");
  if (!usage) {
    let output = name;
    if (options) {
      output += " [OPTIONS]";
    }
    if (args.allowPositionals) {
      output += " INPUTS...";
    }
    await out.write(`  ${output}\n\n`);
  } else if (typeof usage === "string") {
    await out.write(`  ${usage}\n\n`);
  } else {
    for (const line of usage) {
      await out.write(`  ${line}\n`);
    }
    await out.write("\n");
  }

  if (description) {
    const wrappedLines = wrapText(description, vars.size.cols);
    for (const line of wrappedLines) {
      await out.write(`${line}\n`);
    }
    await out.write(`\n`);
  }

  if (options) {
    await heading("Options");

    for (const optionName in options) {
      let optionText = "  ";
      let indentSize = optionText.length;
      const option = options[optionName];
      if (option.short) {
        optionText += colorOption("-" + option.short) + ", ";
        indentSize += `-${option.short}, `.length;
      } else {
        optionText += `    `;
        indentSize += `    `.length;
      }
      optionText += colorOption(`--${optionName}`);
      indentSize += `--${optionName}`.length;
      if (option.type !== "boolean") {
        const valueName = option.valueName || "VALUE";
        optionText += `=${colorOptionArgument(valueName)}`;
        indentSize += `=${valueName}`.length;
      }
      if (option.description) {
        const indentSizeIncludingTab = (size) => {
          return (Math.floor(size / TAB_SIZE$1) + 1) * TAB_SIZE$1 + 1;
        };

        // Wrap the description based on the terminal width, with each line indented.
        let remainingWidth =
          vars.size.cols - indentSizeIncludingTab(indentSize);
        let skipIndentOnFirstLine = true;

        // If there's not enough room after a very long option name, start on the next line.
        if (remainingWidth < 30) {
          optionText += "\n";
          indentSize = 8;
          remainingWidth = vars.size.cols - indentSizeIncludingTab(indentSize);
          skipIndentOnFirstLine = false;
        }

        const wrappedDescriptionLines = wrapText(
          option.description,
          remainingWidth,
        );
        for (const line of wrappedDescriptionLines) {
          if (skipIndentOnFirstLine) {
            skipIndentOnFirstLine = false;
          } else {
            optionText += " ".repeat(indentSize);
          }
          optionText += `\t ${line}\n`;
        }
      } else {
        optionText += "\n";
      }
      await out.write(optionText);
    }
    await out.write("\n");
  }

  if (helpSections) {
    for (const [title, contents] of Object.entries(helpSections)) {
      await heading(title);
      // FIXME: Wrap the text nicely.
      await out.write(contents);
      await out.write("\n\n");
    }
  }
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_help = {
  name: "help",
  usage: ["help", "help COMMAND"],
  description:
    "Print help information for a specific command, or list available commands.\n\n" +
    "If COMMAND is provided, print the documentation for that command. " +
    "Otherwise, list all the commands that are available.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const { builtins } = ctx.registries;

    const { out, err } = ctx.externs;

    if (positionals.length > 1) {
      await err.write("help: Too many arguments, expected 0 or 1\n");
      throw new Exit(1);
    }

    if (positionals.length === 1) {
      const commandName = positionals[0];
      const command = builtins[commandName];
      if (!command) {
        await err.write(`help: No builtin found named '${commandName}'\n`);
        throw new Exit(1);
      }
      await printUsage(command, out, ctx.vars);
      return;
    }

    const heading = (txt) => {
      out.write(`\x1B[34;1m~ ${txt} ~\x1B[0m\n`);
    };

    heading("available commands");
    out.write("Use \x1B[34;1mhelp COMMAND-NAME\x1B[0m for more information\n");
    for (const k in builtins) {
      out.write("  - " + k + "\n");
    }
    out.write("\n");
    heading("available features");
    out.write("  - pipes; ex: ls | tail -n 2\n");
    out.write("  - redirects; ex: ls > some_file.txt\n");
    out.write("  - simple tab completion\n");
    out.write("  - in-memory command history\n");
    out.write("\n");
    heading("what's coming up?");
    out.write("  - keep watching for \x1B[34;1mmore\x1B[0m (est: v0.1.11)\n");
    // out.write('  - \x1B[34;1mcurl\x1B[0m up with your favorite terminal (est: TBA)\n')
  },
};

var jsonQuery$1 = {exports: {}};

var state = State$1;

function State$1(options, params, handleQuery){

  options = options || {};

  //this.options = options
  this.handleQuery = handleQuery;
  this.options = options;
  this.locals = this.options.locals || {};
  this.globals = this.options.globals || {};
  this.rootContext = firstNonNull(options.data, options.rootContext, options.context, options.source);
  this.parent = options.parent;
  this.override = options.override;
  this.filters = options.filters || {};
  this.params = params || options.params || [];
  this.context = firstNonNull(options.currentItem, options.context, options.source);
  this.currentItem = firstNonNull(this.context, options.rootContext, options.data);
  this.currentKey = null;
  this.currentReferences = [];
  this.currentParents = [];
}

State$1.prototype = {

  // current manipulation
  setCurrent: function(key, value){
    if (this.currentItem || this.currentKey || this.currentParents.length>0){
      this.currentParents.push({key: this.currentKey, value: this.currentItem});
    }
    this.currentItem = value;
    this.currentKey = key;
  },

  resetCurrent: function(){
    this.currentItem = null;
    this.currentKey = null;
    this.currentParents = [];
  },

  force: function(def){
    var parent = this.currentParents[this.currentParents.length-1];
    if (!this.currentItem && parent && (this.currentKey != null)){
      this.currentItem = def || {};
      parent.value[this.currentKey] = this.currentItem;
    }
    return !!this.currentItem
  },

  getLocal: function(localName){
    if (~localName.indexOf('/')){
      var result = null;
      var parts = localName.split('/');

      for (var i=0;i<parts.length;i++){
        var part = parts[i];
        if (i == 0){
          result = this.locals[part];
        } else if (result && result[part]){
          result = result[part];
        }
      }

      return result
    } else {
      return this.locals[localName]
    }
  },

  getGlobal: function(globalName){
    if (~globalName.indexOf('/')){
      var result = null;
      var parts = globalName.split('/');

      for (var i=0;i<parts.length;i++){
        var part = parts[i];
        if (i == 0){
          result = this.globals[part];
        } else if (result && result[part]){
          result = result[part];
        }
      }

      return result
    } else {
      return this.globals[globalName]
    }
  },

  getFilter: function(filterName){
    if (~filterName.indexOf('/')){
      var result = null;
      var filterParts = filterName.split('/');

      for (var i=0;i<filterParts.length;i++){
        var part = filterParts[i];
        if (i == 0){
          result = this.filters[part];
        } else if (result && result[part]){
          result = result[part];
        }
      }

      return result
    } else {
      return this.filters[filterName]
    }
  },

  addReferences: function(references){
    if (references){
      references.forEach(this.addReference, this);
    }
  },

  addReference: function(ref){
    if (ref instanceof Object && !~this.currentReferences.indexOf(ref)){
      this.currentReferences.push(ref);
    }
  },

  // helper functions
  getValues: function(values, callback){
    return values.map(this.getValue, this)
  },

  getValue: function (value) {
    return this.getValueFrom(value, null)
  },

  getValueFrom: function (value, item) {
    if (value._param != null){
      return this.params[value._param]
    } else if (value._sub){

      var options = copy(this.options);
      options.force = null;
      options.currentItem = item;

      var result = this.handleQuery(value._sub, options, this.params);
      this.addReferences(result.references);
      return result.value

    } else {
      return value
    }
  },

  deepQuery: function(source, tokens, options, callback){

    for (var key in source){
      if (key in source){

        var options = copy(this.options);
        options.currentItem = source[key];

        var result = this.handleQuery(tokens, options, this.params);

        if (result.value){
          return result
        }
      }
    }

    return null
  }

};

function firstNonNull(args){
  for (var i=0;i<arguments.length;i++){
    if (arguments[i] != null){
      return arguments[i]
    }
  }
}

function copy(obj){
  var result = {};
  if (obj){
    for (var key in obj){
      if (key in obj){
        result[key] = obj[key];
      }
    }
  }
  return result
}

var tokenize$1 = {exports: {}};

var depthSplit_1 = depthSplit;

function depthSplit (text, delimiter, opts) {
  var max = opts && opts.max || Infinity;
  var includeDelimiters = opts && opts.includeDelimiters || false;

  var depth = 0;
  var start = 0;
  var result = [];
  var zones = [];

  text.replace(/([\[\(\{])|([\]\)\}])/g, function (current, open, close, offset) {
    if (open) {
      if (depth === 0) {
        zones.push([start, offset]);
      }
      depth += 1;
    } else if (close) {
      depth -= 1;
      if (depth === 0) {
        start = offset + current.length;
      }
    }
  });

  if (depth === 0 && start < text.length) {
    zones.push([start, text.length]);
  }

  start = 0;

  for (var i = 0; i < zones.length && max > 0; i++) {
    for (
      var pos = zones[i][0], match = delimiter.exec(text.slice(pos, zones[i][1]));
      match && max > 1;
      pos += match.index + match[0].length, start = pos, match = delimiter.exec(text.slice(pos, zones[i][1]))
    ) {
      result.push(text.slice(start, match.index + pos));
      if (includeDelimiters) {
        result.push(match[0]);
      }
      max -= 1;
    }
  }

  if (start < text.length) {
    result.push(text.slice(start));
  }

  return result
}

tokenize$1.exports;

(function (module) {
	// todo: syntax checking
	// todo: test handle args
	var depthSplit = depthSplit_1;

	module.exports = function(query, shouldAssignParamIds){
	  if (!query) return []

	  var result = []
	    , char
	    , nextChar = query.charAt(0)
	    , bStart = 0
	    , bEnd = 0
	    , partOffset = 0
	    , pos = 0
	    , depth = 0
	    , mode = 'get'
	    , deepQuery = null;

	  // if query contains params then number them
	  if (shouldAssignParamIds){
	    query = assignParamIds(query);
	  }

	  var tokens = {
	    '.': {mode: 'get'},
	    ':': {mode: 'filter'},
	    '|': {handle: 'or'},
	    '[': {open: 'select'},
	    ']': {close: 'select'},
	    '{': {open: 'meta'},
	    '}': {close: 'meta'},
	    '(': {open: 'args'},
	    ')': {close: 'args'}
	  };

	  function push(item){
	    if (deepQuery){
	      deepQuery.push(item);
	    } else {
	      result.push(item);
	    }
	  }

	  var handlers = {
	    get: function(buffer){
	      var trimmed = typeof buffer === 'string' ? buffer.trim() : null;
	      if (trimmed){
	        push({get:trimmed});
	      }
	    },
	    select: function(buffer){
	      if (buffer){
	        push(tokenizeSelect(buffer));
	      } else {
	        // deep query override
	        var x = {deep: []};
	        result.push(x);
	        deepQuery = x.deep;
	      }
	    },
	    filter: function(buffer){
	      if (buffer){
	        push({filter:buffer.trim()});
	      }
	    },
	    or: function(){
	      deepQuery = null;
	      result.push({or:true});
	      partOffset = i + 1;
	    },
	    args: function(buffer){
	      var args = tokenizeArgs(buffer);
	      result[result.length-1].args = args;
	    }
	  };

	  function handleBuffer(){
	    var buffer = query.slice(bStart, bEnd);
	    if (handlers[mode]){
	      handlers[mode](buffer);
	    }
	    mode = 'get';
	    bStart = bEnd + 1;
	  }

	  for (var i = 0;i < query.length;i++){
 char = nextChar; nextChar = query.charAt(i + 1);
	    pos = i - partOffset;

	    // root query check
	    if (pos === 0 && (char !== ':' && char !== '.')){
	      result.push({root:true});
	    }

	    // parent query check
	    if (pos === 0 && (char === '.' && nextChar === '.')){
	      result.push({parent:true});
	    }

	    var token = tokens[char];
	    if (token){

	      // set mode
	      if (depth === 0 && (token.mode || token.open)){
	        handleBuffer();
	        mode = token.mode || token.open;
	      }

	      if (depth === 0 && token.handle){
	        handleBuffer();
	        handlers[token.handle]();
	      }

	      if (token.open){
	        depth += 1;
	      } else if (token.close){
	        depth -= 1;
	      }

	      // reset mode to get
	      if (depth === 0 && token.close){
	        handleBuffer();
	      }

	    }

	    bEnd = i + 1;

	  }

	  handleBuffer();
	  return result
	};

	function tokenizeArgs(argsQuery){
	  if (argsQuery === ',') return [',']
	  return depthSplit(argsQuery, /,/).map(function(s){
	    return handleSelectPart(s.trim())
	  })
	}

	function tokenizeSelect (selectQuery) {
	  if (selectQuery === '*') {
	    return {
	      values: true
	    }
	  } else if (selectQuery === '**') {
	    return {
	      values: true,
	      deep: true
	    }
	  }

	  var multiple = false;
	  if (selectQuery.charAt(0) === '*') {
	    multiple = true;
	    selectQuery = selectQuery.slice(1);
	  }

	  var booleanParts = depthSplit(selectQuery, /&|\|/, { includeDelimiters: true });
	  if (booleanParts.length > 1) {
	    var result = [
	      getSelectPart(booleanParts[0].trim())
	    ];
	    for (var i = 1; i < booleanParts.length; i += 2) {
	      var part = getSelectPart(booleanParts[i + 1].trim());
	      if (part) {
	        part.booleanOp = booleanParts[i];
	        result.push(part);
	      }
	    }
	    return {
	      multiple: multiple,
	      boolean: true,
	      select: result
	    }
	  } else {
	    var result = getSelectPart(selectQuery.trim());
	    if (!result) {
	      return {
	        get: handleSelectPart(selectQuery.trim())
	      }
	    } else {
	      if (multiple) {
	        result.multiple = true;
	      }
	      return result
	    }
	  }
	}

	function getSelectPart (selectQuery) {
	  var parts = depthSplit(selectQuery, /(!)?(=|~|\:|<=|>=|<|>)/, { max: 2, includeDelimiters: true });
	  if (parts.length === 3) {
	    var negate = parts[1].charAt(0) === '!';
	    var key = handleSelectPart(parts[0].trim());
	    var result = {
	      negate: negate,
	      op: negate ? parts[1].slice(1) : parts[1]
	    };
	    if (result.op === ':') {
	      result.select = [key, {_sub: module.exports(':' + parts[2].trim())}];
	    } else if (result.op === '~') {
	      var value = handleSelectPart(parts[2].trim());
	      if (typeof value === 'string') {
	        var reDef = parts[2].trim().match(/^\/(.*)\/([a-z]?)$/);
	        if (reDef) {
	          result.select = [key, new RegExp(reDef[1], reDef[2])];
	        } else {
	          result.select = [key, value];
	        }
	      } else {
	        result.select = [key, value];
	      }
	    } else {
	      result.select = [key, handleSelectPart(parts[2].trim())];
	    }
	    return result
	  }
	}

	function isInnerQuery (text) {
	  return text.charAt(0) === '{' && text.charAt(text.length-1) === '}'
	}

	function handleSelectPart(part){
	  if (isInnerQuery(part)){
	    var innerQuery = part.slice(1, -1);
	    return {_sub: module.exports(innerQuery)}
	  } else {
	    return paramToken(part)
	  }
	}

	function paramToken(text){
	  if (text.charAt(0) === '?'){
	    var num = parseInt(text.slice(1));
	    if (!isNaN(num)){
	      return {_param: num}
	    } else {
	      return text
	    }
	  } else {
	    return text
	  }
	}



	function assignParamIds(query){
	  var index = 0;
	  return query.replace(/\?/g, function(match){
	    return match + (index++)
	  })
	}
} (tokenize$1));

var tokenizeExports = tokenize$1.exports;

var State = state;
var tokenize = tokenizeExports;

var tokenizedCache = {};

jsonQuery$1.exports = function jsonQuery (query, options) {

  // extract params for ['test[param=?]', 'value'] type queries
  var params = options && options.params || null;
  if (Array.isArray(query)) {
    params = query.slice(1);
    query = query[0];
  }

  if (!tokenizedCache[query]) {
    tokenizedCache[query] = tokenize(query, true);
  }

  return handleQuery(tokenizedCache[query], options, params)
};


jsonQuery$1.exports.lastParent = function (query) {
  var last = query.parents[query.parents.length - 1];
  if (last) {
    return last.value
  } else {
    return null
  }
};


function handleQuery (tokens, options, params) {
  var state = new State(options, params, handleQuery);

  for (var i = 0; i < tokens.length; i++) {
    if (handleToken(tokens[i], state)) {
      break
    }
  }

  // flush
  handleToken(null, state);

  // set databind hooks
  if (state.currentItem instanceof Object) {
    state.addReference(state.currentItem);
  } else {
    var parentObject = getLastParentObject(state.currentParents);
    if (parentObject) {
      state.addReference(parentObject);
    }
  }

  return {
    value: state.currentItem,
    key: state.currentKey,
    references: state.currentReferences,
    parents: state.currentParents
  }
}

function handleToken (token, state) {
  // state: setCurrent, getValue, getValues, resetCurrent, deepQuery, rootContext, currentItem, currentKey, options, filters

  if (token == null) {
    // process end of query
    if (!state.currentItem && state.options.force) {
      state.force(state.options.force);
    }
  } else if (token.values) {
    if (state.currentItem) {
      var keys = Object.keys(state.currentItem);
      var values = [];
      keys.forEach(function (key) {
        if (token.deep && Array.isArray(state.currentItem[key])) {
          state.currentItem[key].forEach(function (item) {
            values.push(item);
          });
        } else {
          values.push(state.currentItem[key]);
        }
      });
      state.setCurrent(keys, values);
    } else {
      state.setCurrent(keys, []);
    }
  } else if (token.get) {
    var key = state.getValue(token.get);
    if (shouldOverride(state, key)) {
      state.setCurrent(key, state.override[key]);
    } else {
      if (state.currentItem || (state.options.force && state.force({}))) {
        if (isDeepAccessor(state.currentItem, key) || token.multiple) {
          var values = state.currentItem.map(function (item) {
            return item[key]
          }).filter(isDefined);

          values = Array.prototype.concat.apply([], values); // flatten

          state.setCurrent(key, values);
        } else {
          state.setCurrent(key, state.currentItem[key]);
        }
      } else {
        state.setCurrent(key, null);
      }
    }
  } else if (token.select) {
    if (Array.isArray(state.currentItem) || (state.options.force && state.force([]))) {
      var match = (token.boolean ? token.select : [token]).map(function (part) {
        if (part.op === ':') {
          var key = state.getValue(part.select[0]);
          return {
            func: function (item) {
              if (key) {
                item = item[key];
              }
              return state.getValueFrom(part.select[1], item)
            },
            negate: part.negate,
            booleanOp: part.booleanOp
          }
        } else {
          var selector = state.getValues(part.select);
          if (!state.options.allowRegexp && part.op === '~' && selector[1] instanceof RegExp) throw new Error('options.allowRegexp is not enabled.')
          return {
            key: selector[0],
            value: selector[1],
            negate: part.negate,
            booleanOp: part.booleanOp,
            op: part.op
          }
        }
      });

      if (token.multiple) {
        var keys = [];
        var value = [];
        state.currentItem.forEach(function (item, i) {
          if (matches(item, match)) {
            keys.push(i);
            value.push(item);
          }
        });
        state.setCurrent(keys, value);
      } else {
        if (!state.currentItem.some(function (item, i) {
          if (matches(item, match)) {
            state.setCurrent(i, item);
            return true
          }
        })) {
          state.setCurrent(null, null);
        }
      }
    } else {
      state.setCurrent(null, null);
    }
  } else if (token.root) {
    state.resetCurrent();
    if (token.args && token.args.length) {
      state.setCurrent(null, state.getValue(token.args[0]));
    } else {
      state.setCurrent(null, state.rootContext);
    }
  } else if (token.parent) {
    state.resetCurrent();
    state.setCurrent(null, state.options.parent);
  } else if (token.or) {
    if (state.currentItem) {
      return true
    } else {
      state.resetCurrent();
      state.setCurrent(null, state.context);
    }
  } else if (token.filter) {
    var helper = state.getLocal(token.filter) || state.getGlobal(token.filter);
    if (typeof helper === 'function') {
      // function(input, args...)
      var values = state.getValues(token.args || []);
      var result = helper.apply(state.options, [state.currentItem].concat(values));
      state.setCurrent(null, result);
    } else {
      // fallback to old filters
      var filter = state.getFilter(token.filter);
      if (typeof filter === 'function') {
        var values = state.getValues(token.args || []);
        var result = filter.call(state.options, state.currentItem, {args: values, state: state, data: state.rootContext});
        state.setCurrent(null, result);
      }
    }
  } else if (token.deep) {
    if (state.currentItem) {
      if (token.deep.length === 0) {
        return
      }

      var result = state.deepQuery(state.currentItem, token.deep, state.options);
      if (result) {
        state.setCurrent(result.key, result.value);
        for (var i = 0; i < result.parents.length; i++) {
          state.currentParents.push(result.parents[i]);
        }
      } else {
        state.setCurrent(null, null);
      }
    } else {
      state.currentItem = null;
    }
  }
}

function matches (item, parts) {
  var result = false;
  for (var i = 0; i < parts.length; i++) {
    var opts = parts[i];
    var r = false;
    if (opts.func) {
      r = opts.func(item);
    } else if (opts.op === '~') {
      if (opts.value instanceof RegExp) {
        r = item[opts.key] && !!item[opts.key].match(opts.value);
      } else {
        r = item[opts.key] && !!~item[opts.key].indexOf(opts.value);
      }
    } else if (opts.op === '=') {
      if ((item[opts.key] === true && opts.value === 'true') || (item[opts.key] === false && opts.value === 'false')) {
        r = true;
      } else {
        r = item[opts.key] == opts.value;
      }
    } else if (opts.op === '>') {
      r = item[opts.key] > opts.value;
    } else if (opts.op === '<') {
      r = item[opts.key] < opts.value;
    } else if (opts.op === '>=') {
      r = item[opts.key] >= opts.value;
    } else if (opts.op === '<=') {
      r = item[opts.key] <= opts.value;
    }

    if (opts.negate) {
      r = !r;
    }
    if (opts.booleanOp === '&') {
      result = result && r;
    } else if (opts.booleanOp === '|') {
      result = result || r;
    } else {
      result = r;
    }
  }

  return result
}

function isDefined(value) {
  return typeof value !== 'undefined'
}

function shouldOverride (state, key) {
  return state.override && state.currentItem === state.rootContext && state.override[key] !== undefined
}

function isDeepAccessor (currentItem, key) {
  return currentItem instanceof Array && parseInt(key) != key
}

function getLastParentObject (parents) {
  for (var i = 0; i < parents.length; i++) {
    if (!(parents[i + 1]) || !(parents[i + 1].value instanceof Object)) {
      return parents[i].value
    }
  }
}

var jsonQueryExports = jsonQuery$1.exports;
var jsonQuery = /*@__PURE__*/getDefaultExportFromCjs(jsonQueryExports);

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const signals = Object.freeze({
  SIGINT: 2,
  SIGQUIT: 3,
});

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_jq = {
  name: "jq",
  usage: "jq FILTER [FILE...]",
  description:
    "Process JSON input FILE(s) according to FILTER.\n\n" +
    "Reads from standard input if no FILE is provided.",
  input: {
    syncLines: true,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {

    const { positionals } = ctx.locals;
    const [query] = positionals;

    // Read one line at a time
    const { in_, out, err } = ctx.externs;

    let rslv_sigint;
    const p_int = new Promise((rslv) => (rslv_sigint = rslv));
    ctx.externs.sig.on((signal) => {
      if (signal === signals.SIGINT) {
        rslv_sigint({ is_sigint: true });
      }
    });

    let line, done;
    const next_line = async () => {
      let is_sigint = false;
      ({
        value: line,
        done,
        is_sigint,
      } = await Promise.race([p_int, in_.read()]));
      if (is_sigint) {
        throw new Exit(130);
      }
      // ({ value: line, done } = await in_.read());
    };
    for (await next_line(); !done; await next_line()) {
      let data;
      try {
        data = JSON.parse(line);
      } catch (e) {
        await err.write("Error: " + e.message + "\n");
        continue;
      }
      const result = jsonQuery(query, { data });
      await out.write(JSON.stringify(result.value) + "\n");
    }
  },
};

var ansiRegex$1 = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

const ansiRegex = ansiRegex$1;

var stripAnsi$3 = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var wcwidth$4 = {exports: {}};

var clone$1 = {exports: {}};

(function (module) {
	var clone = (function() {

	/**
	 * Clones (copies) an Object using deep copying.
	 *
	 * This function supports circular references by default, but if you are certain
	 * there are no circular references in your object, you can save some CPU time
	 * by calling clone(obj, false).
	 *
	 * Caution: if `circular` is false and `parent` contains circular references,
	 * your program may enter an infinite loop and crash.
	 *
	 * @param `parent` - the object to be cloned
	 * @param `circular` - set to true if the object to be cloned may contain
	 *    circular references. (optional - true by default)
	 * @param `depth` - set to a number if the object is only to be cloned to
	 *    a particular depth. (optional - defaults to Infinity)
	 * @param `prototype` - sets the prototype to be used when cloning an object.
	 *    (optional - defaults to parent prototype).
	*/
	function clone(parent, circular, depth, prototype) {
	  if (typeof circular === 'object') {
	    depth = circular.depth;
	    prototype = circular.prototype;
	    circular.filter;
	    circular = circular.circular;
	  }
	  // maintain two arrays for circular references, where corresponding parents
	  // and children have the same index
	  var allParents = [];
	  var allChildren = [];

	  var useBuffer = typeof Buffer != 'undefined';

	  if (typeof circular == 'undefined')
	    circular = true;

	  if (typeof depth == 'undefined')
	    depth = Infinity;

	  // recurse this function so we don't reset allParents and allChildren
	  function _clone(parent, depth) {
	    // cloning null always returns null
	    if (parent === null)
	      return null;

	    if (depth == 0)
	      return parent;

	    var child;
	    var proto;
	    if (typeof parent != 'object') {
	      return parent;
	    }

	    if (clone.__isArray(parent)) {
	      child = [];
	    } else if (clone.__isRegExp(parent)) {
	      child = new RegExp(parent.source, __getRegExpFlags(parent));
	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
	    } else if (clone.__isDate(parent)) {
	      child = new Date(parent.getTime());
	    } else if (useBuffer && Buffer.isBuffer(parent)) {
	      if (Buffer.allocUnsafe) {
	        // Node.js >= 4.5.0
	        child = Buffer.allocUnsafe(parent.length);
	      } else {
	        // Older Node.js versions
	        child = new Buffer(parent.length);
	      }
	      parent.copy(child);
	      return child;
	    } else {
	      if (typeof prototype == 'undefined') {
	        proto = Object.getPrototypeOf(parent);
	        child = Object.create(proto);
	      }
	      else {
	        child = Object.create(prototype);
	        proto = prototype;
	      }
	    }

	    if (circular) {
	      var index = allParents.indexOf(parent);

	      if (index != -1) {
	        return allChildren[index];
	      }
	      allParents.push(parent);
	      allChildren.push(child);
	    }

	    for (var i in parent) {
	      var attrs;
	      if (proto) {
	        attrs = Object.getOwnPropertyDescriptor(proto, i);
	      }

	      if (attrs && attrs.set == null) {
	        continue;
	      }
	      child[i] = _clone(parent[i], depth - 1);
	    }

	    return child;
	  }

	  return _clone(parent, depth);
	}

	/**
	 * Simple flat clone using prototype, accepts only objects, usefull for property
	 * override on FLAT configuration object (no nested props).
	 *
	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
	 * works.
	 */
	clone.clonePrototype = function clonePrototype(parent) {
	  if (parent === null)
	    return null;

	  var c = function () {};
	  c.prototype = parent;
	  return new c();
	};

	// private utility functions

	function __objToStr(o) {
	  return Object.prototype.toString.call(o);
	}	clone.__objToStr = __objToStr;

	function __isDate(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Date]';
	}	clone.__isDate = __isDate;

	function __isArray(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Array]';
	}	clone.__isArray = __isArray;

	function __isRegExp(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
	}	clone.__isRegExp = __isRegExp;

	function __getRegExpFlags(re) {
	  var flags = '';
	  if (re.global) flags += 'g';
	  if (re.ignoreCase) flags += 'i';
	  if (re.multiline) flags += 'm';
	  return flags;
	}	clone.__getRegExpFlags = __getRegExpFlags;

	return clone;
	})();

	if (module.exports) {
	  module.exports = clone;
	} 
} (clone$1));

var cloneExports = clone$1.exports;

var clone = cloneExports;

var defaults$2 = function(options, defaults) {
  options = options || {};

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = clone(defaults[key]);
    }
  });

  return options;
};

var combining$1 = [
    [ 0x0300, 0x036F ], [ 0x0483, 0x0486 ], [ 0x0488, 0x0489 ],
    [ 0x0591, 0x05BD ], [ 0x05BF, 0x05BF ], [ 0x05C1, 0x05C2 ],
    [ 0x05C4, 0x05C5 ], [ 0x05C7, 0x05C7 ], [ 0x0600, 0x0603 ],
    [ 0x0610, 0x0615 ], [ 0x064B, 0x065E ], [ 0x0670, 0x0670 ],
    [ 0x06D6, 0x06E4 ], [ 0x06E7, 0x06E8 ], [ 0x06EA, 0x06ED ],
    [ 0x070F, 0x070F ], [ 0x0711, 0x0711 ], [ 0x0730, 0x074A ],
    [ 0x07A6, 0x07B0 ], [ 0x07EB, 0x07F3 ], [ 0x0901, 0x0902 ],
    [ 0x093C, 0x093C ], [ 0x0941, 0x0948 ], [ 0x094D, 0x094D ],
    [ 0x0951, 0x0954 ], [ 0x0962, 0x0963 ], [ 0x0981, 0x0981 ],
    [ 0x09BC, 0x09BC ], [ 0x09C1, 0x09C4 ], [ 0x09CD, 0x09CD ],
    [ 0x09E2, 0x09E3 ], [ 0x0A01, 0x0A02 ], [ 0x0A3C, 0x0A3C ],
    [ 0x0A41, 0x0A42 ], [ 0x0A47, 0x0A48 ], [ 0x0A4B, 0x0A4D ],
    [ 0x0A70, 0x0A71 ], [ 0x0A81, 0x0A82 ], [ 0x0ABC, 0x0ABC ],
    [ 0x0AC1, 0x0AC5 ], [ 0x0AC7, 0x0AC8 ], [ 0x0ACD, 0x0ACD ],
    [ 0x0AE2, 0x0AE3 ], [ 0x0B01, 0x0B01 ], [ 0x0B3C, 0x0B3C ],
    [ 0x0B3F, 0x0B3F ], [ 0x0B41, 0x0B43 ], [ 0x0B4D, 0x0B4D ],
    [ 0x0B56, 0x0B56 ], [ 0x0B82, 0x0B82 ], [ 0x0BC0, 0x0BC0 ],
    [ 0x0BCD, 0x0BCD ], [ 0x0C3E, 0x0C40 ], [ 0x0C46, 0x0C48 ],
    [ 0x0C4A, 0x0C4D ], [ 0x0C55, 0x0C56 ], [ 0x0CBC, 0x0CBC ],
    [ 0x0CBF, 0x0CBF ], [ 0x0CC6, 0x0CC6 ], [ 0x0CCC, 0x0CCD ],
    [ 0x0CE2, 0x0CE3 ], [ 0x0D41, 0x0D43 ], [ 0x0D4D, 0x0D4D ],
    [ 0x0DCA, 0x0DCA ], [ 0x0DD2, 0x0DD4 ], [ 0x0DD6, 0x0DD6 ],
    [ 0x0E31, 0x0E31 ], [ 0x0E34, 0x0E3A ], [ 0x0E47, 0x0E4E ],
    [ 0x0EB1, 0x0EB1 ], [ 0x0EB4, 0x0EB9 ], [ 0x0EBB, 0x0EBC ],
    [ 0x0EC8, 0x0ECD ], [ 0x0F18, 0x0F19 ], [ 0x0F35, 0x0F35 ],
    [ 0x0F37, 0x0F37 ], [ 0x0F39, 0x0F39 ], [ 0x0F71, 0x0F7E ],
    [ 0x0F80, 0x0F84 ], [ 0x0F86, 0x0F87 ], [ 0x0F90, 0x0F97 ],
    [ 0x0F99, 0x0FBC ], [ 0x0FC6, 0x0FC6 ], [ 0x102D, 0x1030 ],
    [ 0x1032, 0x1032 ], [ 0x1036, 0x1037 ], [ 0x1039, 0x1039 ],
    [ 0x1058, 0x1059 ], [ 0x1160, 0x11FF ], [ 0x135F, 0x135F ],
    [ 0x1712, 0x1714 ], [ 0x1732, 0x1734 ], [ 0x1752, 0x1753 ],
    [ 0x1772, 0x1773 ], [ 0x17B4, 0x17B5 ], [ 0x17B7, 0x17BD ],
    [ 0x17C6, 0x17C6 ], [ 0x17C9, 0x17D3 ], [ 0x17DD, 0x17DD ],
    [ 0x180B, 0x180D ], [ 0x18A9, 0x18A9 ], [ 0x1920, 0x1922 ],
    [ 0x1927, 0x1928 ], [ 0x1932, 0x1932 ], [ 0x1939, 0x193B ],
    [ 0x1A17, 0x1A18 ], [ 0x1B00, 0x1B03 ], [ 0x1B34, 0x1B34 ],
    [ 0x1B36, 0x1B3A ], [ 0x1B3C, 0x1B3C ], [ 0x1B42, 0x1B42 ],
    [ 0x1B6B, 0x1B73 ], [ 0x1DC0, 0x1DCA ], [ 0x1DFE, 0x1DFF ],
    [ 0x200B, 0x200F ], [ 0x202A, 0x202E ], [ 0x2060, 0x2063 ],
    [ 0x206A, 0x206F ], [ 0x20D0, 0x20EF ], [ 0x302A, 0x302F ],
    [ 0x3099, 0x309A ], [ 0xA806, 0xA806 ], [ 0xA80B, 0xA80B ],
    [ 0xA825, 0xA826 ], [ 0xFB1E, 0xFB1E ], [ 0xFE00, 0xFE0F ],
    [ 0xFE20, 0xFE23 ], [ 0xFEFF, 0xFEFF ], [ 0xFFF9, 0xFFFB ],
    [ 0x10A01, 0x10A03 ], [ 0x10A05, 0x10A06 ], [ 0x10A0C, 0x10A0F ],
    [ 0x10A38, 0x10A3A ], [ 0x10A3F, 0x10A3F ], [ 0x1D167, 0x1D169 ],
    [ 0x1D173, 0x1D182 ], [ 0x1D185, 0x1D18B ], [ 0x1D1AA, 0x1D1AD ],
    [ 0x1D242, 0x1D244 ], [ 0xE0001, 0xE0001 ], [ 0xE0020, 0xE007F ],
    [ 0xE0100, 0xE01EF ]
];

var defaults$1 = defaults$2;
var combining = combining$1;

var DEFAULTS$1 = {
  nul: 0,
  control: 0
};

wcwidth$4.exports = function wcwidth(str) {
  return wcswidth(str, DEFAULTS$1)
};

wcwidth$4.exports.config = function(opts) {
  opts = defaults$1(opts || {}, DEFAULTS$1);
  return function wcwidth(str) {
    return wcswidth(str, opts)
  }
};

/*
 *  The following functions define the column width of an ISO 10646
 *  character as follows:
 *  - The null character (U+0000) has a column width of 0.
 *  - Other C0/C1 control characters and DEL will lead to a return value
 *    of -1.
 *  - Non-spacing and enclosing combining characters (general category
 *    code Mn or Me in the
 *    Unicode database) have a column width of 0.
 *  - SOFT HYPHEN (U+00AD) has a column width of 1.
 *  - Other format characters (general category code Cf in the Unicode
 *    database) and ZERO WIDTH
 *    SPACE (U+200B) have a column width of 0.
 *  - Hangul Jamo medial vowels and final consonants (U+1160-U+11FF)
 *    have a column width of 0.
 *  - Spacing characters in the East Asian Wide (W) or East Asian
 *    Full-width (F) category as
 *    defined in Unicode Technical Report #11 have a column width of 2.
 *  - All remaining characters (including all printable ISO 8859-1 and
 *    WGL4 characters, Unicode control characters, etc.) have a column
 *    width of 1.
 *  This implementation assumes that characters are encoded in ISO 10646.
*/

function wcswidth(str, opts) {
  if (typeof str !== 'string') return wcwidth$3(str, opts)

  var s = 0;
  for (var i = 0; i < str.length; i++) {
    var n = wcwidth$3(str.charCodeAt(i), opts);
    if (n < 0) return -1
    s += n;
  }

  return s
}

function wcwidth$3(ucs, opts) {
  // test for 8-bit control characters
  if (ucs === 0) return opts.nul
  if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0)) return opts.control

  // binary search in table of non-spacing characters
  if (bisearch(ucs)) return 0

  // if we arrive here, ucs is not a combining or C0/C1 control character
  return 1 +
      (ucs >= 0x1100 &&
       (ucs <= 0x115f ||                       // Hangul Jamo init. consonants
        ucs == 0x2329 || ucs == 0x232a ||
        (ucs >= 0x2e80 && ucs <= 0xa4cf &&
         ucs != 0x303f) ||                     // CJK ... Yi
        (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
        (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compatibility Ideographs
        (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
        (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compatibility Forms
        (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
        (ucs >= 0xffe0 && ucs <= 0xffe6) ||
        (ucs >= 0x20000 && ucs <= 0x2fffd) ||
        (ucs >= 0x30000 && ucs <= 0x3fffd)));
}

function bisearch(ucs) {
  var min = 0;
  var max = combining.length - 1;
  var mid;

  if (ucs < combining[0][0] || ucs > combining[max][1]) return false

  while (max >= min) {
    mid = Math.floor((min + max) / 2);
    if (ucs > combining[mid][1]) min = mid + 1;
    else if (ucs < combining[mid][0]) max = mid - 1;
    else return true
  }

  return false
}

var wcwidthExports = wcwidth$4.exports;

var stripAnsi$2 = stripAnsi$3;
var wcwidth$2 = wcwidthExports;

var width = function(str) {
  return wcwidth$2(stripAnsi$2(str))
};

var utils$1 = {};

var wcwidth$1 = width;

/**
 * repeat string `str` up to total length of `len`
 *
 * @param String str string to repeat
 * @param Number len total length of output string
 */

function repeatString(str, len) {
  return Array.apply(null, {length: len + 1}).join(str).slice(0, len)
}

/**
 * Pad `str` up to total length `max` with `chr`.
 * If `str` is longer than `max`, padRight will return `str` unaltered.
 *
 * @param String str string to pad
 * @param Number max total length of output string
 * @param String chr optional. Character to pad with. default: ' '
 * @return String padded str
 */

function padRight$1(str, max, chr) {
  str = str != null ? str : '';
  str = String(str);
  var length = max - wcwidth$1(str);
  if (length <= 0) return str
  return str + repeatString(chr || ' ', length)
}

/**
 * Pad `str` up to total length `max` with `chr`.
 * If `str` is longer than `max`, padCenter will return `str` unaltered.
 *
 * @param String str string to pad
 * @param Number max total length of output string
 * @param String chr optional. Character to pad with. default: ' '
 * @return String padded str
 */

function padCenter$1(str, max, chr) {
  str = str != null ? str : '';
  str = String(str);
  var length = max - wcwidth$1(str);
  if (length <= 0) return str
  var lengthLeft = Math.floor(length/2);
  var lengthRight = length - lengthLeft;
  return repeatString(chr || ' ', lengthLeft) + str + repeatString(chr || ' ', lengthRight)
}

/**
 * Pad `str` up to total length `max` with `chr`, on the left.
 * If `str` is longer than `max`, padRight will return `str` unaltered.
 *
 * @param String str string to pad
 * @param Number max total length of output string
 * @param String chr optional. Character to pad with. default: ' '
 * @return String padded str
 */

function padLeft$1(str, max, chr) {
  str = str != null ? str : '';
  str = String(str);
  var length = max - wcwidth$1(str);
  if (length <= 0) return str
  return repeatString(chr || ' ', length) + str
}

/**
 * Split a String `str` into lines of maxiumum length `max`.
 * Splits on word boundaries. Preserves existing new lines.
 *
 * @param String str string to split
 * @param Number max length of each line
 * @return Array Array containing lines.
 */

function splitIntoLines$1(str, max) {
  function _splitIntoLines(str, max) {
    return str.trim().split(' ').reduce(function(lines, word) {
      var line = lines[lines.length - 1];
      if (line && wcwidth$1(line.join(' ')) + wcwidth$1(word) < max) {
        lines[lines.length - 1].push(word); // add to line
      }
      else lines.push([word]); // new line
      return lines
    }, []).map(function(l) {
      return l.join(' ')
    })
  }
  return str.split('\n').map(function(str) {
    return _splitIntoLines(str, max)
  }).reduce(function(lines, line) {
    return lines.concat(line)
  }, [])
}

/**
 * Add spaces and `truncationChar` between words of
 * `str` which are longer than `max`.
 *
 * @param String str string to split
 * @param Number max length of each line
 * @param Number truncationChar character to append to split words
 * @return String
 */

function splitLongWords$1(str, max, truncationChar) {
  str = str.trim();
  var result = [];
  var words = str.split(' ');
  var remainder = '';

  var truncationWidth = wcwidth$1(truncationChar);

  while (remainder || words.length) {
    if (remainder) {
      var word = remainder;
      remainder = '';
    } else {
      var word = words.shift();
    }

    if (wcwidth$1(word) > max) {
      // slice is based on length no wcwidth
      var i = 0;
      var wwidth = 0;
      var limit = max - truncationWidth;
      while (i < word.length) {
        var w = wcwidth$1(word.charAt(i));
        if (w + wwidth > limit) {
          break
        }
        wwidth += w;
        ++i;
      }

      remainder = word.slice(i); // get remainder
      // save remainder for next loop

      word = word.slice(0, i); // grab truncated word
      word += truncationChar; // add trailing … or whatever
    }
    result.push(word);
  }

  return result.join(' ')
}


/**
 * Truncate `str` into total width `max`
 * If `str` is shorter than `max`,  will return `str` unaltered.
 *
 * @param String str string to truncated
 * @param Number max total wcwidth of output string
 * @return String truncated str
 */

function truncateString$1(str, max) {

  str = str != null ? str : '';
  str = String(str);

  if(max == Infinity) return str

  var i = 0;
  var wwidth = 0;
  while (i < str.length) {
    var w = wcwidth$1(str.charAt(i));
    if(w + wwidth > max)
      break
    wwidth += w;
    ++i;
  }
  return str.slice(0, i)
}



/**
 * Exports
 */

utils$1.padRight = padRight$1;
utils$1.padCenter = padCenter$1;
utils$1.padLeft = padLeft$1;
utils$1.splitIntoLines = splitIntoLines$1;
utils$1.splitLongWords = splitLongWords$1;
utils$1.truncateString = truncateString$1;

var wcwidth = width;

var _require = utils$1,
    padRight = _require.padRight,
    padCenter = _require.padCenter,
    padLeft = _require.padLeft,
    splitIntoLines = _require.splitIntoLines,
    splitLongWords = _require.splitLongWords,
    truncateString = _require.truncateString;

var DEFAULT_HEADING_TRANSFORM = function DEFAULT_HEADING_TRANSFORM(key) {
  return key.toUpperCase();
};

var DEFAULT_DATA_TRANSFORM = function DEFAULT_DATA_TRANSFORM(cell, column, index) {
  return cell;
};

var DEFAULTS = Object.freeze({
  maxWidth: Infinity,
  minWidth: 0,
  columnSplitter: ' ',
  truncate: false,
  truncateMarker: '…',
  preserveNewLines: false,
  paddingChr: ' ',
  showHeaders: true,
  headingTransform: DEFAULT_HEADING_TRANSFORM,
  dataTransform: DEFAULT_DATA_TRANSFORM
});

var columnify = function (items) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  var columnConfigs = options.config || {};
  delete options.config; // remove config so doesn't appear on every column.

  var maxLineWidth = options.maxLineWidth || Infinity;
  if (maxLineWidth === 'auto') maxLineWidth = process.stdout.columns || Infinity;
  delete options.maxLineWidth; // this is a line control option, don't pass it to column

  // Option defaults inheritance:
  // options.config[columnName] => options => DEFAULTS
  options = mixin({}, DEFAULTS, options);

  options.config = options.config || Object.create(null);

  options.spacing = options.spacing || '\n'; // probably useless
  options.preserveNewLines = !!options.preserveNewLines;
  options.showHeaders = !!options.showHeaders;
  options.columns = options.columns || options.include; // alias include/columns, prefer columns if supplied
  var columnNames = options.columns || []; // optional user-supplied columns to include

  items = toArray(items, columnNames);

  // if not suppled column names, automatically determine columns from data keys
  if (!columnNames.length) {
    items.forEach(function (item) {
      for (var columnName in item) {
        if (columnNames.indexOf(columnName) === -1) columnNames.push(columnName);
      }
    });
  }

  // initialize column defaults (each column inherits from options.config)
  var columns = columnNames.reduce(function (columns, columnName) {
    var column = Object.create(options);
    columns[columnName] = mixin(column, columnConfigs[columnName]);
    return columns;
  }, Object.create(null));

  // sanitize column settings
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    column.name = columnName;
    column.maxWidth = Math.ceil(column.maxWidth);
    column.minWidth = Math.ceil(column.minWidth);
    column.truncate = !!column.truncate;
    column.align = column.align || 'left';
  });

  // sanitize data
  items = items.map(function (item) {
    var result = Object.create(null);
    columnNames.forEach(function (columnName) {
      // null/undefined -> ''
      result[columnName] = item[columnName] != null ? item[columnName] : '';
      // toString everything
      result[columnName] = '' + result[columnName];
      if (columns[columnName].preserveNewLines) {
        // merge non-newline whitespace chars
        result[columnName] = result[columnName].replace(/[^\S\n]/gmi, ' ');
      } else {
        // merge all whitespace chars
        result[columnName] = result[columnName].replace(/\s/gmi, ' ');
      }
    });
    return result;
  });

  // transform data cells
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    items = items.map(function (item, index) {
      var col = Object.create(column);
      item[columnName] = column.dataTransform(item[columnName], col, index);

      var changedKeys = Object.keys(col);
      // disable default heading transform if we wrote to column.name
      if (changedKeys.indexOf('name') !== -1) {
        if (column.headingTransform !== DEFAULT_HEADING_TRANSFORM) return;
        column.headingTransform = function (heading) {
          return heading;
        };
      }
      changedKeys.forEach(function (key) {
        return column[key] = col[key];
      });
      return item;
    });
  });

  // add headers
  var headers = {};
  if (options.showHeaders) {
    columnNames.forEach(function (columnName) {
      var column = columns[columnName];

      if (!column.showHeaders) {
        headers[columnName] = '';
        return;
      }

      headers[columnName] = column.headingTransform(column.name);
    });
    items.unshift(headers);
  }
  // get actual max-width between min & max
  // based on length of data in columns
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    column.width = items.map(function (item) {
      return item[columnName];
    }).reduce(function (min, cur) {
      // if already at maxWidth don't bother testing
      if (min >= column.maxWidth) return min;
      return Math.max(min, Math.min(column.maxWidth, Math.max(column.minWidth, wcwidth(cur))));
    }, 0);
  });

  // split long words so they can break onto multiple lines
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    items = items.map(function (item) {
      item[columnName] = splitLongWords(item[columnName], column.width, column.truncateMarker);
      return item;
    });
  });

  // wrap long lines. each item is now an array of lines.
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    items = items.map(function (item, index) {
      var cell = item[columnName];
      item[columnName] = splitIntoLines(cell, column.width);

      // if truncating required, only include first line + add truncation char
      if (column.truncate && item[columnName].length > 1) {
        item[columnName] = splitIntoLines(cell, column.width - wcwidth(column.truncateMarker));
        var firstLine = item[columnName][0];
        if (!endsWith(firstLine, column.truncateMarker)) item[columnName][0] += column.truncateMarker;
        item[columnName] = item[columnName].slice(0, 1);
      }
      return item;
    });
  });

  // recalculate column widths from truncated output/lines
  columnNames.forEach(function (columnName) {
    var column = columns[columnName];
    column.width = items.map(function (item) {
      return item[columnName].reduce(function (min, cur) {
        if (min >= column.maxWidth) return min;
        return Math.max(min, Math.min(column.maxWidth, Math.max(column.minWidth, wcwidth(cur))));
      }, 0);
    }).reduce(function (min, cur) {
      if (min >= column.maxWidth) return min;
      return Math.max(min, Math.min(column.maxWidth, Math.max(column.minWidth, cur)));
    }, 0);
  });

  var rows = createRows(items, columns, columnNames, options.paddingChr); // merge lines into rows
  // conceive output
  return rows.reduce(function (output, row) {
    return output.concat(row.reduce(function (rowOut, line) {
      return rowOut.concat(line.join(options.columnSplitter));
    }, []));
  }, []).map(function (line) {
    return truncateString(line, maxLineWidth);
  }).join(options.spacing);
};

/**
 * Convert wrapped lines into rows with padded values.
 *
 * @param Array items data to process
 * @param Array columns column width settings for wrapping
 * @param Array columnNames column ordering
 * @return Array items wrapped in arrays, corresponding to lines
 */

function createRows(items, columns, columnNames, paddingChr) {
  return items.map(function (item) {
    var row = [];
    var numLines = 0;
    columnNames.forEach(function (columnName) {
      numLines = Math.max(numLines, item[columnName].length);
    });
    // combine matching lines of each rows

    var _loop = function _loop(i) {
      row[i] = row[i] || [];
      columnNames.forEach(function (columnName) {
        var column = columns[columnName];
        var val = item[columnName][i] || ''; // || '' ensures empty columns get padded
        if (column.align === 'right') row[i].push(padLeft(val, column.width, paddingChr));else if (column.align === 'center' || column.align === 'centre') row[i].push(padCenter(val, column.width, paddingChr));else row[i].push(padRight(val, column.width, paddingChr));
      });
    };

    for (var i = 0; i < numLines; i++) {
      _loop(i);
    }
    return row;
  });
}

/**
 * Object.assign
 *
 * @return Object Object with properties mixed in.
 */

function mixin() {
  if (Object.assign) return Object.assign.apply(Object, arguments);
  return ObjectAssign.apply(undefined, arguments);
}

function ObjectAssign(target, firstSource) {

  if (target === undefined || target === null) throw new TypeError("Cannot convert first argument to object");

  var to = Object(target);

  var hasPendingException = false;
  var pendingException;

  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) continue;

    var keysArray = Object.keys(Object(nextSource));
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      try {
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
      } catch (e) {
        if (!hasPendingException) {
          hasPendingException = true;
          pendingException = e;
        }
      }
    }

    if (hasPendingException) throw pendingException;
  }
  return to;
}

/**
 * Adapted from String.prototype.endsWith polyfill.
 */

function endsWith(target, searchString, position) {
  position = position || target.length;
  position = position - searchString.length;
  var lastIndex = target.lastIndexOf(searchString);
  return lastIndex !== -1 && lastIndex === position;
}

function toArray(items, columnNames) {
  if (Array.isArray(items)) return items;
  var rows = [];
  for (var key in items) {
    var item = {};
    item[columnNames[0] || 'key'] = key;
    item[columnNames[1] || 'value'] = items[key];
    rows.push(item);
  }
  return rows;
}

var columnify$1 = /*@__PURE__*/getDefaultExportFromCjs(columnify);

var stringWidth$2 = {exports: {}};

var isFullwidthCodePoint$2 = {exports: {}};

/* eslint-disable yoda */

const isFullwidthCodePoint$1 = codePoint => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		codePoint >= 0x1100 && (
			codePoint <= 0x115F || // Hangul Jamo
			codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
			// Hangul Jamo Extended-A
			(0xA960 <= codePoint && codePoint <= 0xA97C) ||
			// Hangul Syllables
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			// CJK Compatibility Ideographs
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			// Vertical Forms
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
			// Halfwidth and Fullwidth Forms
			(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			// Kana Supplement
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			// Enclosed Ideographic Supplement
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}

	return false;
};

isFullwidthCodePoint$2.exports = isFullwidthCodePoint$1;
isFullwidthCodePoint$2.exports.default = isFullwidthCodePoint$1;

var isFullwidthCodePointExports = isFullwidthCodePoint$2.exports;

var emojiRegex$1 = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

const stripAnsi$1 = stripAnsi$3;
const isFullwidthCodePoint = isFullwidthCodePointExports;
const emojiRegex = emojiRegex$1;

const stringWidth$1 = string => {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi$1(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex(), '  ');

	let width = 0;

	for (let i = 0; i < string.length; i++) {
		const code = string.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint(code) ? 2 : 1;
	}

	return width;
};

stringWidth$2.exports = stringWidth$1;
// TODO: remove this in the next major version
stringWidth$2.exports.default = stringWidth$1;

var stringWidthExports = stringWidth$2.exports;

const stringWidth = stringWidthExports;
const stripAnsi = stripAnsi$3;

const concat = Array.prototype.concat;
const defaults = {
	character: ' ',
	newline: '\n',
	padding: 2,
	sort: true,
	width: 0,
};

function byPlainText(a, b) {
	const plainA = stripAnsi(a);
	const plainB = stripAnsi(b);

	if (plainA === plainB) {
		return 0;
	}

	if (plainA > plainB) {
		return 1;
	}

	return -1;
}

function makeArray() {
	return [];
}

function makeList(count) {
	return Array.apply(null, Array(count));
}

function padCell(fullWidth, character, value) {
	const valueWidth = stringWidth(value);
	const filler = makeList(fullWidth - valueWidth + 1);

	return value + filler.join(character);
}

function toRows(rows, cell, i) {
	rows[i % rows.length].push(cell);

	return rows;
}

function toString(arr) {
	return arr.join('');
}

function columns(values, options) {
	values = concat.apply([], values);
	options = Object.assign({}, defaults, options);

	let cells = values.filter(Boolean).map(String);

	if (options.sort !== false) {
		cells = cells.sort(byPlainText);
	}

	const termWidth = options.width || process.stdout.columns;
	const cellWidth =
		Math.max.apply(null, cells.map(stringWidth)) + options.padding;
	const columnCount = Math.floor(termWidth / cellWidth) || 1;
	const rowCount = Math.ceil(cells.length / columnCount) || 1;

	if (columnCount === 1) {
		return cells.join(options.newline);
	}

	return cells
		.map(padCell.bind(null, cellWidth, options.character))
		.reduce(toRows, makeList(rowCount).map(makeArray))
		.map(toString)
		.join(options.newline);
}

var cliColumns = columns;

var cli_columns = /*@__PURE__*/getDefaultExportFromCjs(cliColumns);

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// formatLsTimestamp(): written by AI
function formatLsTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to JavaScript Date
  const now = new Date();

  const optionsCurrentYear = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const optionsPreviousYear = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  // Check if the year of the date is the same as the current year
  if (date.getFullYear() === now.getFullYear()) {
    // Format for current year
    return date.toLocaleString("en-US", optionsCurrentYear).replace(",", ""); // Remove comma from time);
  } else {
    // Format for previous year
    return date.toLocaleString("en-US", optionsPreviousYear).replace(",", ""); // Remove comma from time);
  }
}

const B_to_human_readable = (B) => {
  const KiB = B / 1024;
  const MiB = KiB / 1024;
  const GiB = MiB / 1024;
  const TiB = GiB / 1024;
  if (TiB > 1) {
    return `${TiB.toFixed(3)} TiB`;
  } else if (GiB > 1) {
    return `${GiB.toFixed(3)} GiB`;
  } else if (MiB > 1) {
    return `${MiB.toFixed(3)} MiB`;
  } else {
    return `${KiB.toFixed(3)} KiB`;
  }
};

var module_ls = {
  name: "ls",
  usage: "ls [OPTIONS] [PATH...]",
  description: "List directory contents.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      all: {
        description: "List all entries, including those starting with `.`",
        type: "boolean",
        short: "a",
      },
      long: {
        description: "List entries in long format, as a table",
        type: "boolean",
        short: "l",
      },
      "human-readable": {
        description:
          "Print sizes in a human readable format (eg 12MiB, 3GiB), instead of byte counts",
        type: "boolean",
        short: "h",
      },
      time: {
        description:
          "Specify which time to display, one of atime (access time), ctime (creation time), or mtime (modification time)",
        type: "string",
      },
      S: {
        description: "Sort the results",
        type: "boolean",
      },
      t: {
        description: "Sort by time, newest first. See --time",
        type: "boolean",
      },
      reverse: {
        description: "Reverse the sort direction",
        type: "boolean",
        short: "r",
      },
    },
  },
  execute: async (ctx) => {
    console.log("ls context", ctx);
    console.log("env.COLS", ctx.env.COLS);
    // ctx.params to access processed args
    // ctx.args to access raw args
    const { positionals, values, pwd } = ctx.locals;
    const { filesystem } = ctx.platform;

    const paths = positionals.length < 1 ? [pwd] : positionals;

    const showHeadings =
      paths.length > 1
        ? async ({ i, path }) => {
            if (i !== 0) await ctx.externs.out.write("\n");
            await ctx.externs.out.write(path + ":\n");
          }
        : () => {};

    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      await showHeadings({ i, path });
      path = resolveRelativePath(ctx.vars, path);
      let result = await filesystem.readdir(path);
      console.log("ls items", result);

      if (!values.all) {
        result = result.filter((item) => !item.name.startsWith("."));
      }

      const reverse_sort = values.reverse;
      const decsort = (delegate) => {
        if (!reverse_sort) return delegate;
        return (a, b) => -delegate(a, b);
      };

      const time_properties = {
        mtime: "modified",
        ctime: "created",
        atime: "accessed",
      };

      if (values.t) {
        const timeprop = time_properties[values.time || "mtime"];
        result = result.sort(
          decsort((a, b) => {
            return b[timeprop] - a[timeprop];
          }),
        );
      }

      if (values.S) {
        result = result.sort(
          decsort((a, b) => {
            if (a.is_dir && !b.is_dir) return 1;
            if (!a.is_dir && b.is_dir) return -1;
            return b.size - a.size;
          }),
        );
      }

      // const write_item = values.long
      //     ? item => {
      //         let line = '';
      //         line += item.is_dir ? 'd' : item.is_symlink ? 'l' : '-';
      //         line += ' ';
      //         line += item.is_dir ? 'N/A' : item.size;
      //         line += ' ';
      //         line += item.name;
      //         return line;
      //     }
      //     : item => item.name
      //
      const icons = {
        // d: '📁',
        // l: '🔗',
      };

      const colors = {
        "d-": "blue",
        ds: "magenta",
        "l-": "cyan",
      };

      const col_to_ansi = {
        blue: "34",
        cyan: "36",
        green: "32",
        magenta: "35",
      };

      const col = (type, text) => {
        if (!colors[type]) return text;
        return `\x1b[${col_to_ansi[colors[type]]};1m${text}\x1b[0m`;
      };

      const POSIX = filesystem.capabilities["readdir.posix-mode"];

      const simpleTypeForItem = (item) => {
        return (
          (item.is_dir ? "d" : item.is_symlink ? "l" : "-") +
          (item.subdomains && item.subdomains.length ? "s" : "-")
        );
      };

      if (values.long) {
        const time = values.time || "mtime";
        const items = result.map((item) => {
          const ts = item[time_properties[time]];
          const www = !item.subdomains
            ? "N/A"
            : !item.subdomains.length
              ? "---"
              : item.subdomains[0].address +
                (item.subdomains.length > 1
                  ? ` +${item.subdomains.length - 1}`
                  : "");
          const type = simpleTypeForItem(item);
          const mode = POSIX ? item.mode_human_readable : null;

          let size = item.size;
          if (values["human-readable"]) {
            size = B_to_human_readable(size);
          }
          if (item.is_dir && !POSIX) size = "N/A";
          return {
            ...item,
            user: item.uid,
            group: item.gid,
            mode,
            type: icons[type] || type,
            name: col(type, item.name),
            www: www,
            size: size,
            [time_properties[time]]: formatLsTimestamp(ts),
          };
        });
        const text = columnify$1(items, {
          columns: [
            POSIX ? "mode" : "type",
            "name",
            ...(POSIX ? ["user", "group"] : []),
            ...(filesystem.capabilities["readdir.www"] ? ["www"] : []),
            "size",
            time_properties[time],
          ],
          maxLineWidth: ctx.env.COLS,
          config: {
            // json: {
            //     maxWidth: 20,
            // }
          },
        });
        const lines = text.split("\n");
        for (const line of lines) {
          await ctx.externs.out.write(line + "\n");
        }
        continue;
      }

      console.log("what is", cli_columns);

      const names = result.map((item) => {
        return col(simpleTypeForItem(item), item.name);
      });
      const text = cli_columns(names, {
        width: ctx.env.COLS,
      });

      const lines = text.split("\n");

      for (const line of lines) {
        await ctx.externs.out.write(line + "\n");
      }
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_man = {
  name: "man",
  usage: "man",
  description: "Stub command. Please use `help` instead.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    await ctx.externs.out.write(
      "`\x1B[34;1mman\x1B[0m` is not supported. " +
        "Please use `\x1B[34;1mhelp COMMAND\x1B[0m` for documentation.\n",
    );
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const validate_string = (str, meta) => {
  if (str === undefined) {
    if (!meta.allow_empty) {
      throw new Error(`${meta?.name} is required`);
    }
    return "";
  }

  if (typeof str !== "string") {
    throw new Error(`${meta?.name} must be a string`);
  }

  if (!meta.allow_empty && str.length === 0) {
    throw new Error(`${meta?.name} must not be empty`);
  }

  return str;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const EMPTY = Object.freeze({});

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// DRY: very similar to `cd`
var module_mkdir = {
  name: "mkdir",
  usage: "mkdir [OPTIONS] PATH",
  description: "Create a directory at PATH.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      parents: {
        description:
          "Create parent directories if they do not exist. Do not treat existing directories as an error",
        type: "boolean",
        short: "p",
      },
    },
  },
  decorators: { errors: EMPTY },
  execute: async (ctx) => {
    // ctx.params to access processed args
    // ctx.args to access raw args
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    let [target] = positionals;

    try {
      validate_string(target, { name: "path" });
    } catch (e) {
      await ctx.externs.err.write(`mkdir: ${e.message}\n`);
      throw new Exit(1);
    }

    target = resolveRelativePath(ctx.vars, target);

    const result = await filesystem.mkdir(target, {
      createMissingParents: values.parents,
    });

    if (result && result.$ === "error") {
      await ctx.externs.err.write(`mkdir: ${result.message}\n`);
      throw new Exit(1);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_mv = {
  name: "mv",
  usage: "mv SOURCE DESTINATION",
  description: "Move SOURCE file or directory to DESTINATION.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const { out, err } = ctx.externs;
    const { filesystem } = ctx.platform;

    if (positionals.length < 1) {
      await err.write("mv: missing file operand\n");
      throw new Exit(1);
    }

    const srcRelPath = positionals.shift();

    if (positionals.length < 1) {
      const aft = positionals[0];
      await err.write(`mv: missing destination file operand after '${aft}'\n`);
      throw new Exit(1);
    }

    const dstRelPath = positionals.shift();

    const srcAbsPath = resolveRelativePath(ctx.vars, srcRelPath);
    let dstAbsPath = resolveRelativePath(ctx.vars, dstRelPath);

    await filesystem.move(srcAbsPath, dstAbsPath);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const logo = `
\x1B[37m    ▄█████████████████    \x1B[31m███████\x1B[0m
\x1B[37m   ▄██████████████████    \x1B[31m███████\x1B[0m
\x1B[37m ▄████████████████████    \x1B[31m███████\x1B[0m
\x1B[37m ████████▀     ▀██████    \x1B[0m
\x1B[37m▄██████▀        ██████    \x1B[33m███████\x1B[0m
\x1B[37m██████▀         ██████    \x1B[33m███████\x1B[0m
\x1B[37m██████          ██████    \x1B[33m███████\x1B[0m
\x1B[37m██████          ██████    \x1B[0m
\x1B[37m██████          ██████    \x1B[32m███████\x1B[0m
\x1B[37m██████          ██████    \x1B[32m███████\x1B[0m
\x1B[37m██████▄        ▄██████    \x1B[32m███████\x1B[0m
\x1B[37m███████▄      ▄███████    \x1B[0m
\x1B[37m █████████████████████    \x1B[34m███████\x1B[0m
\x1B[37m  ████████████████████    \x1B[34m███████\x1B[0m
\x1B[37m   ▀█████████▀ ▀██████    \x1B[34m███████\x1B[0m
`.slice(1);

function pad(str, l, r) {
  var tmp = new Array(l).join(" ");
  str = "" + str;
  var strClean = str.replace(/\u001b\[[^m]+m/g, "");

  return r
    ? tmp.slice(0, l - strClean.length) +
        str.slice(0, l + str.length - strClean.length)
    : str.slice(0, l + str.length - strClean.length) +
        tmp.slice(0, l - strClean.length);
}

var module_phetch = {
  name: "phetch",
  usage: "phetch",
  description: "Print information about the system.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      json: {
        description: "Output as a JSON string.",
        type: "boolean",
        short: "j",
      },
    },
  },
  execute: async (ctx) => {
    const { anura } = ctx.externs;

    const C25 = (n) => `\x1B[38;5;${n}m`;
    const B25 = (n) => `\x1B[48;5;${n}m`;
    const COL = C25(27);
    const END = "\x1B[0m";
    const lines = logo.split("\n").map((line) => pad(line, 37, false));

    const { codename, pretty } = anura.version;

    const uptimeS = Math.floor(performance.now() / 1000);
    let formattedUptime;

    const days = Math.floor(uptimeS / 86400);
    const hours = Math.floor((uptimeS % 86400) / 3600);
    const minutes = Math.floor((uptimeS % 3600) / 60);
    const seconds = uptimeS % 60;

    if (days > 0) {
      formattedUptime = `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      formattedUptime = `${hours} hours, ${minutes} minutes`;
    } else if (minutes > 0) {
      formattedUptime = `${minutes} minutes, ${seconds} seconds`;
    } else {
      formattedUptime = `${seconds} seconds`;
    }

    const commands = Object.keys(ctx.registries.builtins).length;

    if (ctx.locals.values.json) {
      await ctx.externs.out.write(
        JSON.stringify({
          os: "AnuraOS",
          version: anura.version,
          uptime: {
            days,
            hours,
            minutes,
            seconds,
            pretty: formattedUptime,
          },
          commands,
          shell: `Phoenix Shell v${SHELL_VERSIONS[0].v}`,
          cpu: navigator.hardwareConcurrency,
          online: navigator.onLine,
        }) + "\n",
      );
      return;
    }

    lines[0] += COL + ctx.env.USER + END + "@" + COL + ctx.env.HOSTNAME + END;
    lines[1] += "-----------------";
    lines[2] +=
      COL + "OS" + END + ": AnuraOS " + pretty + " (" + codename + ")";
    lines[3] += COL + "Uptime" + END + ": " + formattedUptime;
    lines[4] += COL + "Commands" + END + ": " + commands;
    lines[5] += COL + "Shell" + END + ": Phoenix Shell v" + SHELL_VERSIONS[0].v;
    lines[6] +=
      COL + "CPU" + END + ": " + navigator.hardwareConcurrency + " cores";
    lines[7] += COL + "Online" + END + ": " + (navigator.onLine ? "Yes" : "No");

    for (let i = 0; i < 16; i++) {
      let ri = i < 8 ? 13 : 14;
      let esc = i < 9 ? `\x1B[3${i}m\x1B[4${i}m` : C25(i) + B25(i);
      lines[ri] += esc + "   ";
    }
    lines[13] += "\x1B[0m";
    lines[14] += "\x1B[0m";

    for (const line of lines) {
      await ctx.externs.out.write(line + "\n");
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: get these values from a common place
// DRY: Copied from echo_escapes.js
const BEL = String.fromCharCode(7);
const BS = String.fromCharCode(8);
const VT = String.fromCharCode(0x0b);
const FF = String.fromCharCode(0x0c);

function parseFormat(input, startOffset) {
  let i = startOffset;

  if (input[i] !== "%") {
    throw new Error("Called parseFormat() without a format specifier!");
  }
  i++;

  const result = {
    flags: {
      leftJustify: false,
      prefixWithSign: false,
      prefixWithSpaceIfWithoutSign: false,
      alternativeForm: false,
      padWithLeadingZeroes: false,
    },
    fieldWidth: null,
    precision: null,
    conversionSpecifier: null,

    newOffset: startOffset,
  };

  // Output a single % for '%%' or '%' followed by the end of the input.
  if (input[i] === "%") {
    i++;
    result.conversionSpecifier = "%";
    result.newOffset = i;
    return result;
  }

  const consumeInteger = () => {
    const startIndex = i;
    while (input[i] >= "0" && input[i] <= "9") {
      i++;
    }
    if (startIndex === i) {
      return null;
    }

    const integerString = input.substring(startIndex, i);
    return Number.parseInt(integerString, 10);
  };

  // Flags
  const possibleFlags = "-+ #0";
  while (possibleFlags.includes(input[i])) {
    switch (input[i]) {
      case "-":
        result.flags.leftJustify = true;
        break;
      case "+":
        result.flags.prefixWithSign = true;
        break;
      case " ":
        result.flags.prefixWithSpaceIfWithoutSign = true;
        break;
      case "#":
        result.flags.alternativeForm = true;
        break;
      case "0":
        result.flags.padWithLeadingZeroes = true;
        break;
    }
    i++;
  }

  // Field width
  result.fieldWidth = consumeInteger();

  // Precision
  if (input[i] === ".") {
    i++;
    result.precision = consumeInteger() || 0;
  }

  // Conversion specifier
  const possibleConversionSpecifiers = "cdeEfFgGiousxX";
  if (possibleConversionSpecifiers.includes(input[i])) {
    result.conversionSpecifier = input[i];
    i++;
  } else {
    throw new Error(
      `Invalid conversion specifier '${input.substring(startOffset, i + 1)}'`,
    );
  }

  result.newOffset = i;
  return result;
}

function formatOutput(parsedFormat, remainingArguments) {
  const { flags, fieldWidth, precision, conversionSpecifier } = parsedFormat;

  const padAndAlignString = (input) => {
    if (!fieldWidth || input.length >= fieldWidth) {
      return input;
    }

    const padding = " ".repeat(fieldWidth - input.length);
    return flags.leftJustify ? input + padding : padding + input;
  };

  const formatInteger = (integer, specifier) => {
    const unsigned = "ouxX".includes(specifier);
    const radix = (() => {
      switch (specifier) {
        case "o":
          return 8;
        case "x":
        case "X":
          return 16;
        default:
          return 10;
      }
    })();

    // POSIX doesn't specify what we should do to format a negative number as %u.
    // Common behavior seems to be bit-casting it to unsigned.
    if (unsigned && integer < 0) {
      integer = integer >>> 0;
    }

    let digits = Math.abs(integer).toString(radix);
    if (specifier === "o" && flags.alternativeForm && digits[0] !== "0") {
      // "For the o conversion specifier, it shall increase the precision to force the first digit of the result to be a zero."
      // (Where 'it' is the alternative form flag.)
      digits = "0" + digits;
    }
    const signOrPrefix = (() => {
      if (flags.alternativeForm) {
        if (specifier === "x") return "0x";
        if (specifier === "X") return "0X";
      }
      if (unsigned) return "";
      if (integer < 0) return "-";
      if (flags.prefixWithSign) return "+";
      if (flags.prefixWithSpaceIfWithoutSign) return " ";
      return "";
    })();

    // Expand digits with 0s, up to `precision` characters.
    // "The default precision shall be 1."
    const usedPrecision = precision ?? 1;
    // Special case: "The result of converting a zero value with a precision of 0 shall be no characters."
    if (usedPrecision === 0 && integer === 0) {
      digits = "";
    } else if (digits.length < precision) {
      digits = "0".repeat(precision - digits.length) + digits;
    }

    // Pad up to `fieldWidth` with spaces or 0s.
    const width = signOrPrefix.length + digits.length;
    let output = signOrPrefix + digits;
    if (width < fieldWidth) {
      if (flags.leftJustify) {
        output = signOrPrefix + digits + " ".repeat(fieldWidth - width);
      } else if (precision === null && flags.padWithLeadingZeroes) {
        // "For d, i , o, u, x, and X conversion specifiers, if a precision is specified, the '0' flag shall be ignored."
        output = signOrPrefix + "0".repeat(fieldWidth - width) + digits;
      } else {
        output = " ".repeat(fieldWidth - width) + signOrPrefix + digits;
      }
    }

    if (specifier === specifier.toUpperCase()) {
      output = output.toUpperCase();
    }

    return output;
  };

  const formatFloat = (float, specifier) => {
    if (float === undefined) float = 0;

    const sign = (() => {
      if (float < 0) return "-";
      if (flags.prefixWithSign) return "+";
      if (flags.prefixWithSpaceIfWithoutSign) return " ";
      return "";
    })();
    const floatString = (() => {
      // NaN and Infinity are the same regardless of representation
      if (!isFinite(float)) {
        return float.toString();
      }

      const formatExponential = (mantissaString, exponent) => {
        // #: "For [...] e, E, [...] conversion specifiers, the result shall always contain a radix character,
        // even if no digits follow the radix character."
        if (flags.alternativeForm && !mantissaString.includes(".")) {
          mantissaString += ".";
        }

        // "The exponent shall always contain at least two digits."
        const exponentOutput = (() => {
          if (exponent <= -10 || exponent >= 10) return exponent.toString();
          if (exponent < 0) return "-0" + Math.abs(exponent).toString();
          return "+0" + Math.abs(exponent).toString();
        })();
        return mantissaString + "e" + exponentOutput;
      };

      switch (specifier) {
        // TODO: %a and %A, floats in hexadecimal
        case "e":
        case "E": {
          // "When the precision is missing, six digits shall be written after the radix character"
          const usedPrecision = precision ?? 6;
          // We unfortunately can't fully rely on toExponential() because printf has different formatting rules.
          const [mantissaString, exponentString] = Math.abs(float)
            .toExponential(usedPrecision)
            .split("e");
          const exponent = Number.parseInt(exponentString);
          return formatExponential(mantissaString, exponent);
        }
        case "f":
        case "F": {
          // "If the precision is omitted from the argument, six digits shall be written after the radix character"
          const usedPrecision = precision ?? 6;
          const result = Math.abs(float).toFixed(usedPrecision);
          if (flags.alternativeForm && usedPrecision === 0) {
            // #: "For [...] f, F, [...] conversion specifiers, the result shall always contain a radix character,
            // even if no digits follow the radix character."
            return result + ".";
          }
          return result;
        }
        case "g":
        case "G": {
          // Default isn't specified in the spec, but 6 matches behavior of other implementations.
          const usedPrecision = precision ?? 6;

          // "The style used depends on the value converted: style e (or E) shall be used only if the exponent
          // resulting from the conversion is less than -4 or greater than or equal to the precision."
          // We add a digit of precision to make sure we don't break things when rounding later.
          const [mantissaString, exponentString] = Math.abs(float)
            .toExponential(usedPrecision + 1)
            .split("e");
          const mantissa = Number.parseFloat(mantissaString);
          const exponent = Number.parseInt(exponentString);

          // Unfortunately, `float.toPrecision()` doesn't use the same rules as printf to decide whether to
          // use decimal or exponential representation, so we have to construct the output ourselves.
          const usingExponential = exponent > usedPrecision || exponent < -4;
          if (usingExponential) {
            const decimalDigits = Math.max(
              0,
              usedPrecision - (mantissa < 1 ? 0 : 1),
            );
            // "Trailing zeros are removed from the result."
            let mantissaOutput = mantissa
              .toFixed(decimalDigits)
              .replace(/\.0+/, "");
            return formatExponential(mantissaOutput, exponent);
          }

          // Decimal representation
          const result = Math.abs(float).toPrecision(usedPrecision);
          if (flags.alternativeForm && usedPrecision === 0) {
            // #: "For [...] g, and G conversion specifiers, the result shall always contain a radix character,
            // even if no digits follow the radix character."
            return result + ".";
          }
          // Trailing zeros are removed from the result.
          return result.replace(/\.0+/, "");
        }
        default:
          throw new Error(`Invalid float specifier '${specifier}'`);
      }
    })();

    // Pad up to `fieldWidth` with spaces or 0s.
    const width = sign.length + floatString.length;
    let output = sign + floatString;
    if (width < fieldWidth) {
      if (flags.leftJustify) {
        output = sign + floatString + " ".repeat(fieldWidth - width);
      } else if (flags.padWithLeadingZeroes && isFinite(float)) {
        output = sign + "0".repeat(fieldWidth - width) + floatString;
      } else {
        output = " ".repeat(fieldWidth - width) + sign + floatString;
      }
    }

    if (specifier === specifier.toUpperCase()) {
      output = output.toUpperCase();
    } else {
      output = output.toLowerCase();
    }

    return output;
  };

  switch (conversionSpecifier) {
    // TODO: a,A: Float in hexadecimal format
    // TODO: b: binary data with escapes
    // TODO: Any other common options that are not in the posix spec

    // Integers
    case "d":
    case "i":
    case "o":
    case "u":
    case "x":
    case "X": {
      return formatInteger(
        Number.parseInt(remainingArguments.shift()) || 0,
        conversionSpecifier,
      );
    }

    // Floating point numbers
    case "e":
    case "E":
    case "f":
    case "F":
    case "g":
    case "G": {
      return formatFloat(
        Number.parseFloat(remainingArguments.shift()),
        conversionSpecifier,
      );
    }

    // Single character
    case "c": {
      const argument = remainingArguments.shift() || "";
      // It's unspecified whether an empty string produces a null byte or nothing.
      // We'll go with nothing for now.
      return padAndAlignString(argument[0] || "");
    }

    // String
    case "s": {
      let argument = remainingArguments.shift() || "";
      if (precision && precision < argument.length) {
        argument = argument.substring(0, precision);
      }
      return padAndAlignString(argument);
    }

    // Percent sign
    case "%":
      return "%";
  }
}

function highlight(text) {
  return `\x1B[92m${text}\x1B[0m`;
}

// https://pubs.opengroup.org/onlinepubs/9699919799/utilities/printf.html
var module_printf = {
  name: "printf",
  usage: "printf FORMAT [ARGUMENT...]",
  description:
    "Write a formatted string to standard output.\n\n" +
    "The output is determined by FORMAT, with any escape sequences replaced, and any format strings applied to the following ARGUMENTs.\n\n" +
    "FORMAT is written repeatedly until all ARGUMENTs are consumed. If FORMAT does not consume any ARGUMENTs, it is only written once.",
  helpSections: {
    "Escape Sequences":
      "The following escape sequences are understood:\n\n" +
      `    ${highlight("\\\\")}     A literal \\\n` +
      `    ${highlight("\\a")}     Terminal BELL\n` +
      `    ${highlight("\\b")}     Backspace\n` +
      `    ${highlight("\\f")}     Form-feed\n` +
      `    ${highlight("\\n")}     Newline\n` +
      `    ${highlight("\\r")}     Carriage return\n` +
      `    ${highlight("\\t")}     Horizontal tab\n` +
      `    ${highlight("\\v")}     Vertical tab\n` +
      `    ${highlight("\\###")}   A byte with the octal value of ### (between 1 and 3 digits)`,
    "Format Strings":
      "Format strings behave like C printf. " +
      "A format string is, in order: a `%`, zero or more flags, a width, a precision, and a conversion specifier. " +
      "All except the initial `%` and the conversion specifier are optional.\n\n" +
      "Flags:\n\n" +
      `    ${highlight("-")}       Left-justify the result\n` +
      `    ${highlight("+")}       For numeric types, always include a sign character\n` +
      `    ${highlight("' '")}     ${highlight("(space)")} For numeric types, include a space where the sign would go for positive numbers. Overridden by ${highlight("+")}.\n` +
      `    ${highlight("#")}       Use alternative form, depending on the conversion:\n` +
      `            ${highlight("o")}              Ensure result is always prefixed with a '0'\n` +
      `            ${highlight("x,X")}            Prefix result with '0x' or '0X' respectively\n` +
      `            ${highlight("e,E,f,F,g,G")}    Always include a decimal point. For ${highlight("g,G")}, also keep trailing 0s\n\n` +
      "Width:\n\n" +
      "A number, for how many characters the result should occupy.\n\n" +
      "Precision:\n\n" +
      "A '.' followed optionally by a number. If no number is specified, it is taken as 0. Effect depends on the conversion:\n\n" +
      `    ${highlight("d,i,o,u,x,X")}    Determines the minimum number of digits\n` +
      `    ${highlight("e,E,f,F")}        Determines the number of digits after the decimal point\n\n` +
      `    ${highlight("g,G")}            Determines the number of significant figures\n\n` +
      `    ${highlight("s")}              Determines the maximum number of characters to be printed\n\n` +
      "Conversion specifiers:\n\n" +
      `    ${highlight("%")}       A literal '%'\n` +
      `    ${highlight("s")}       ARGUMENT as a string\n` +
      `    ${highlight("c")}       The first character of ARGUMENT as a string\n` +
      `    ${highlight("d,i")}     ARGUMENT as a number, formatted as a signed decimal integer\n` +
      `    ${highlight("u")}       ARGUMENT as a number, formatted as an unsigned decimal integer\n` +
      `    ${highlight("o")}       ARGUMENT as a number, formatted as an unsigned octal integer\n` +
      `    ${highlight("x,X")}     ARGUMENT as a number, formatted as an unsigned hexadecimal integer, in lower or uppercase respectively\n` +
      `    ${highlight("e,E")}     ARGUMENT as a number, formatted as a float in exponential notation, in lower or uppercase respectively\n` +
      `    ${highlight("f,F")}     ARGUMENT as a number, formatted as a float in decimal notation, in lower or uppercase respectively\n` +
      `    ${highlight("g,G")}     ARGUMENT as a number, formatted as a float in either decimal or exponential notation, in lower or uppercase respectively`,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { out, err } = ctx.externs;
    const { positionals } = ctx.locals;
    const [format, ...remainingArguments] = ctx.locals.positionals;

    if (positionals.length === 0) {
      await err.write("printf: Missing format argument\n");
      throw new Exit(1);
    }

    // We process the format as many times as needed to consume all of remainingArguments, but always at least once.
    do {
      const previousRemainingArgumentCount = remainingArguments.length;
      let output = "";

      for (let i = 0; i < format.length; ++i) {
        let char = format[i];
        // Escape sequences
        if (char === "\\") {
          char = format[++i];
          switch (char) {
            case undefined: {
              // We reached the end of the string, just output the slash.
              output += "\\";
              break;
            }
            case "\\":
              output += "\\";
              break;
            case "a":
              output += BEL;
              break;
            case "b":
              output += BS;
              break;
            case "f":
              output += FF;
              break;
            case "n":
              output += "\n";
              break;
            case "r":
              output += "\r";
              break;
            case "t":
              output += "\t";
              break;
            case "v":
              output += VT;
              break;
            default: {
              // 1 to 3-digit octal number
              if (char >= "0" && char <= "9") {
                const digitsStartI = i;
                if (format[i + 1] >= "0" && format[i + 1] <= "9") {
                  i++;
                  if (format[i + 1] >= "0" && format[i + 1] <= "9") {
                    i++;
                  }
                }

                const octalString = format.substring(digitsStartI, i + 1);
                const octalValue = Number.parseInt(octalString, 8);
                output += String.fromCodePoint(octalValue);
                break;
              }

              // Unrecognized, so just output the sequence verbatim.
              output += "\\" + char;
              break;
            }
          }
          continue;
        }

        // Conversion specifiers
        if (char === "%") {
          // Parse the conversion specifier
          let parsedFormat;
          try {
            parsedFormat = parseFormat(format, i);
          } catch (e) {
            await err.write(`printf: ${e.message}\n`);
            throw new Exit(1);
          }
          i = parsedFormat.newOffset - 1; // -1 because we're about to increment i in the loop header

          // Output the result
          output += formatOutput(parsedFormat, remainingArguments);
          continue;
        }

        // Everything else is copied directly.
        // TODO: Append these to the output in batches, for performance?
        output += char;
      }

      await out.write(output);

      // "If the format operand contains no conversion specifications and argument operands are present, the results are unspecified."
      // We handle this by printing it once and stopping.
      if (remainingArguments.length === previousRemainingArgumentCount) {
        break;
      }
    } while (remainingArguments.length > 0);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_printhist = {
  name: "printhist",
  usage: "printhist",
  description: "Print shell history.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { historyManager } = ctx.externs;
    console.log("test????", ctx);
    for (const item of historyManager.items) {
      await ctx.externs.out.write(item + "\n");
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_pwd = {
  name: "pwd",
  usage: "pwd",
  description: "Print the current working directory.",
  args: {
    $: "simple-parser",
    allowPositionals: false,
  },
  execute: async (ctx) => {
    await ctx.externs.out.write(ctx.vars.pwd + "\n");
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: add logic to check if directory is empty
// TODO: add check for `--dir`
// TODO: allow multiple paths

// DRY: very similar to `cd`
var module_rm = {
  name: "rm",
  usage: "rm [OPTIONS] PATH",
  description: "Remove the file or directory at PATH.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      dir: {
        description: "Remove empty directories",
        type: "boolean",
        short: "d",
      },
      recursive: {
        description: "Recursively remove directories and their contents",
        type: "boolean",
        short: "r",
      },
      force: {
        description: "Ignore non-existent paths, and never prompt",
        type: "boolean",
        short: "f",
      },
    },
  },
  execute: async (ctx) => {
    // ctx.params to access processed args
    // ctx.args to access raw args
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    let [target] = positionals;
    target = resolveRelativePath(ctx.vars, target);

    await filesystem.rm(target, { recursive: values.recursive });
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: add logic to check if directory is empty
// TODO: add check for `--dir`
// TODO: allow multiple paths

// DRY: very similar to `cd`
var module_rmdir = {
  name: "rmdir",
  usage: "rmdir [OPTIONS] DIRECTORY",
  description: "Remove the DIRECTORY if it is empty.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      parents: {
        description: "Also remove empty parent directories",
        type: "boolean",
        short: "p",
      },
    },
  },
  execute: async (ctx) => {
    // ctx.params to access processed args
    // ctx.args to access raw args
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    let [target] = positionals;
    target = resolveRelativePath(ctx.vars, target);

    await filesystem.rmdir(target);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_sample_data = {
  name: "sample-data",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const [what] = positionals;

    if (what === "blob") {
      // Hello world blob
      const blob = new Blob(["Hello, world!"]);
      console.log("before writing");
      await ctx.externs.out.write(blob);
      console.log("after writing");
      return;
    }

    console.log("before writing");
    await ctx.externs.out.write("Hello, World!\n");
    console.log("after writing");
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_sleep = {
  name: "sleep",
  usage: "sleep TIME",
  description:
    "Pause for at least TIME seconds, where TIME is a positive number.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    if (positionals.length !== 1) {
      await ctx.externs.err.write(
        "sleep: Exactly one TIME parameter is required",
      );
      throw new Exit(1);
    }

    let time = Number.parseFloat(positionals[0]);
    if (isNaN(time) || time < 0) {
      await ctx.externs.err.write(
        "sleep: Invalid TIME parameter; must be a positive number",
      );
      throw new Exit(1);
    }

    await new Promise((r) => setTimeout(r, time * 1000));
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_sort = {
  name: "sort",
  usage: "sort [FILE...]",
  description:
    "Sort the combined lines from the files provided, and output them.\n\n" +
    "If no FILE is specified, or FILE is `-`, read standard input.",
  input: {
    syncLines: true,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      "dictionary-order": {
        description: "Only consider alphanumeric characters and whitespace",
        type: "boolean",
        short: "d",
      },
      "ignore-case": {
        description: "Sort case-insensitively",
        type: "boolean",
        short: "f",
      },
      "ignore-nonprinting": {
        description: "Only consider printable characters",
        type: "boolean",
        short: "i",
      },
      output: {
        description: "Output to this file, instead of standard output",
        type: "string",
        short: "o",
      },
      unique: {
        description: "Remove duplicates of previous lines",
        type: "boolean",
        short: "u",
      },
      reverse: {
        description: "Sort in reverse order",
        type: "boolean",
        short: "r",
      },
    },
  },
  execute: async (ctx) => {
    const { in_, out, err } = ctx.externs;
    const { positionals, values } = ctx.locals;
    const { filesystem } = ctx.platform;

    let relPaths = [...positionals];
    if (relPaths.length === 0) {
      relPaths.push("-");
    }

    const lines = [];

    for (const relPath of relPaths) {
      if (relPath === "-") {
        lines.push(...(await in_.collect()));
      } else {
        const absPath = resolveRelativePath(ctx.vars, relPath);
        const fileData = await filesystem.read(absPath);
        // DRY: Similar logic in wc and tail
        if (fileData instanceof Blob) {
          const arrayBuffer = await fileData.arrayBuffer();
          const fileText = new TextDecoder().decode(arrayBuffer);
          lines.push(...fileText.split(/\n|\r|\r\n/).map((it) => it + "\n"));
        } else if (typeof fileData === "string") {
          lines.push(...fileData.split(/\n|\r|\r\n/).map((it) => it + "\n"));
        } else {
          // ArrayBuffer or TypedArray
          const fileText = new TextDecoder().decode(fileData);
          lines.push(...fileText.split(/\n|\r|\r\n/).map((it) => it + "\n"));
        }
      }
    }

    const compareStrings = (a, b) => {
      let aIndex = 0;
      let bIndex = 0;

      const skipIgnored = (string, index) => {
        if (values["dictionary-order"] && values["ignore-nonprinting"]) {
          // Combining --dictionary-order and --ignore-nonprinting is unspecified.
          // We'll treat that as "must be alphanumeric only".
          while (index < string.length && !/[a-zA-Z0-9]/.test(string[index])) {
            index++;
          }
          return index;
        }
        if (values["dictionary-order"]) {
          // Only consider whitespace and alphanumeric characters
          while (
            index < string.length &&
            !/[a-zA-Z0-9\s]/.test(string[index])
          ) {
            index++;
          }
          return index;
        }
        if (values["ignore-nonprinting"]) {
          // Only consider printing characters
          // So, ignore anything below an ascii space, inclusive. TODO: detect unicode control characters too?
          while (index < string.length && string[index] <= " ") {
            index++;
          }
          return index;
        }

        return index;
      };

      aIndex = skipIgnored(a, aIndex);
      bIndex = skipIgnored(b, bIndex);
      while (aIndex < a.length && bIndex < b.length) {
        // POSIX: Sorting should be locale-dependent
        let comparedCharA = a[aIndex];
        let comparedCharB = b[bIndex];
        if (values["ignore-case"]) {
          comparedCharA = comparedCharA.toUpperCase();
          comparedCharB = comparedCharB.toUpperCase();
        }

        if (comparedCharA !== comparedCharB) {
          if (values.reverse) {
            return comparedCharA < comparedCharB ? 1 : -1;
          }
          return comparedCharA < comparedCharB ? -1 : 1;
        }

        aIndex++;
        bIndex++;
        aIndex = skipIgnored(a, aIndex);
        bIndex = skipIgnored(b, bIndex);
      }

      // If we got here, we reached the end of one of the strings.
      // If we reached the end of both, they're equal. Otherwise, return whichever ended.
      if (aIndex >= a.length) {
        if (bIndex >= b.length) {
          return 0;
        }
        return -1;
      }
      return 1;
    };

    lines.sort(compareStrings);

    let resultLines = lines;
    if (values.unique) {
      resultLines = lines.filter((value, index, array) => {
        return !index || compareStrings(value, array[index - 1]) !== 0;
      });
    }

    if (values.output) {
      const outputPath = resolveRelativePath(ctx.vars, values.output);
      await filesystem.write(outputPath, resultLines.join(""));
    } else {
      for (const line of resultLines) {
        await out.write(line);
      }
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_tail = {
  name: "tail",
  usage: "tail [OPTIONS] [FILE]",
  description:
    "Read a file and print the last lines to standard output.\n\n" +
    "Defaults to 10 lines unless --lines is given. " +
    "If no FILE is provided, or FILE is `-`, read standard input.",
  input: {
    syncLines: true,
  },
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      lines: {
        description: "Print the last COUNT lines",
        type: "string",
        short: "n",
        valueName: "COUNT",
      },
    },
  },
  execute: async (ctx) => {
    const { out, err } = ctx.externs;
    const { positionals, values } = ctx.locals;

    if (positionals.length > 1) {
      // TODO: Support multiple files (this is an extension to POSIX, but available in the GNU tail)
      await err.write("tail: Only one FILE parameter is allowed\n");
      throw new Exit(1);
    }
    const relPath = positionals[0] || "-";

    let lineCount = 10;

    if (values.lines) {
      const parsedLineCount = Number.parseFloat(values.lines);
      if (
        isNaN(parsedLineCount) ||
        !Number.isInteger(parsedLineCount) ||
        parsedLineCount < 1
      ) {
        await err.write(`tail: Invalid number of lines '${values.lines}'\n`);
        throw new Exit(1);
      }
      lineCount = parsedLineCount;
    }

    let lines = [];
    for await (const line of fileLines(ctx, relPath)) {
      lines.push(line);
      // We keep lineCount+1 lines, to account for a possible trailing blank line.
      if (lines.length > lineCount + 1) {
        lines.shift();
      }
    }

    // Ignore trailing blank line
    if (lines.length > 0 && lines[lines.length - 1] === "\n") {
      lines.pop();
    }
    // Now we remove the extra line if it's there.
    if (lines.length > lineCount) {
      lines.shift();
    }

    for (const line of lines) {
      await out.write(line);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_touch = {
  name: "touch",
  usage: "touch FILE...",
  description:
    "Mark the FILE(s) as accessed and modified at the current time, creating them if they do not exist.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const { filesystem } = ctx.platform;

    if (positionals.length === 0) {
      await ctx.externs.err.write("touch: missing file operand\n");
      throw new Exit(1);
    }

    for (let i = 0; i < positionals.length; i++) {
      const path = resolveRelativePath(ctx.vars, positionals[i]);

      let stat = null;
      try {
        stat = await filesystem.stat(path);
      } catch (e) {
        if (e.posixCode !== ErrorCodes.ENOENT) {
          await ctx.externs.err.write(`touch: ${e.message}\n`);
          throw new Exit(1);
        }
      }

      if (stat) continue;

      await filesystem.write(path, "");
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var module_true = {
  name: "true",
  usage: "true",
  description: "Do nothing, and return a success code.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    return;
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const TAB_SIZE = 8;

var module_wc = {
  name: "wc",
  usage: "wc [OPTIONS] [FILE...]",
  description:
    "Count newlines, words, and bytes in each specified FILE, and print them in a table.\n\n" +
    "If no FILE is specified, or FILE is `-`, read standard input. " +
    "If more than one FILE is specified, also print a line for the totals.\n\n" +
    "The outputs are always printed in the order: newlines, words, characters, bytes, maximum line length, followed by the file name. " +
    "If no options are given to output specific counts, the default is `-lwc`.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      bytes: {
        description: "Output the number of bytes in each file",
        type: "boolean",
        short: "c",
      },
      chars: {
        description: "Output the number of characters in each file",
        type: "boolean",
        short: "m",
      },
      lines: {
        description: "Output the number of newlines in each file",
        type: "boolean",
        short: "l",
      },
      "max-line-length": {
        description:
          "Output the maximum line length in each file. Tabs are expanded to the nearest multiple of 8",
        type: "boolean",
        short: "L",
      },
      words: {
        description:
          "Output the number of words in each file. A word is a sequence of non-whitespace characters",
        type: "boolean",
        short: "w",
      },
    },
  },
  execute: async (ctx) => {
    const { positionals, values } = ctx.locals;
    ctx.platform;

    const paths = [...positionals];
    // "If no input file operands are specified, no name shall be written and no <blank> characters preceding the
    //  pathname shall be written."
    // For convenience, we add '-' to paths, but make a note not to output the filename.
    let emptyStdinPath = false;
    if (paths.length < 1) {
      emptyStdinPath = true;
      paths.push("-");
    }

    let {
      bytes: printBytes,
      chars: printChars,
      lines: printNewlines,
      "max-line-length": printMaxLineLengths,
      words: printWords,
    } = values;
    const anyOutputOptionsSpecified =
      printBytes ||
      printChars ||
      printNewlines ||
      printMaxLineLengths ||
      printWords;
    if (!anyOutputOptionsSpecified) {
      printBytes = true;
      printNewlines = true;
      printWords = true;
    }

    let perFile = [];
    let newlinesWidth = 1;
    let wordsWidth = 1;
    let charsWidth = 1;
    let bytesWidth = 1;
    let maxLineLengthWidth = 1;

    for (const relPath of paths) {
      let counts = {
        filename: relPath,
        newlines: 0,
        words: 0,
        chars: 0,
        bytes: 0,
        maxLineLength: 0,
      };

      let inWord = false;
      let currentLineLength = 0;

      for await (const line of fileLines(ctx, relPath)) {
        counts.chars += line.length;
        if (printBytes) {
          const byteInput = new TextEncoder().encode(line);
          counts.bytes += byteInput.length;
        }

        for (const char of line) {
          // "The wc utility shall consider a word to be a non-zero-length string of characters delimited by white space."
          if (/\s/.test(char)) {
            if (char === "\r" || char === "\n") {
              counts.newlines++;
              counts.maxLineLength = Math.max(
                counts.maxLineLength,
                currentLineLength,
              );
              currentLineLength = 0;
            } else if (char === "\t") {
              currentLineLength =
                (Math.floor(currentLineLength / TAB_SIZE) + 1) * TAB_SIZE;
            } else {
              currentLineLength++;
            }
            inWord = false;
            continue;
          }
          currentLineLength++;
          if (!inWord) {
            counts.words++;
            inWord = true;
          }
        }
      }

      counts.maxLineLength = Math.max(counts.maxLineLength, currentLineLength);

      newlinesWidth = Math.max(
        newlinesWidth,
        counts.newlines.toString().length,
      );
      wordsWidth = Math.max(wordsWidth, counts.words.toString().length);
      charsWidth = Math.max(charsWidth, counts.chars.toString().length);
      bytesWidth = Math.max(bytesWidth, counts.bytes.toString().length);
      maxLineLengthWidth = Math.max(
        maxLineLengthWidth,
        counts.maxLineLength.toString().length,
      );
      perFile.push(counts);
    }

    let printCounts = async (count) => {
      let output = "";
      const append = (string) => {
        if (output.length !== 0) output += " ";
        output += string;
      };

      if (printNewlines)
        append(count.newlines.toString().padStart(newlinesWidth, " "));
      if (printWords) append(count.words.toString().padStart(wordsWidth, " "));
      if (printChars) append(count.chars.toString().padStart(charsWidth, " "));
      if (printBytes) append(count.bytes.toString().padStart(bytesWidth, " "));
      if (printMaxLineLengths)
        append(
          count.maxLineLength.toString().padStart(maxLineLengthWidth, " "),
        );
      // The only time emptyStdinPath is true, is if we had no file paths given as arguments. That means only one
      // input (stdin), so this won't be called to print a "totals" line.
      if (!emptyStdinPath) append(count.filename);
      output += "\n";
      await ctx.externs.out.write(output);
    };

    let totalCounts = {
      filename: "total", // POSIX: This is locale-dependent
      newlines: 0,
      words: 0,
      chars: 0,
      bytes: 0,
      maxLineLength: 0,
    };
    for (const count of perFile) {
      totalCounts.newlines += count.newlines;
      totalCounts.words += count.words;
      totalCounts.chars += count.chars;
      totalCounts.bytes += count.bytes;
      totalCounts.maxLineLength = Math.max(
        totalCounts.maxLineLength,
        count.maxLineLength,
      );
      await printCounts(count);
    }
    if (perFile.length > 1) {
      await printCounts(totalCounts);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var module_which = {
  name: "which",
  usage: "which COMMAND...",
  description:
    "Look up each COMMAND, and return the path name of its executable.\n\n" +
    "Returns 1 if any COMMAND is not found, otherwise returns 0.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      all: {
        description:
          "Return all matching path names of each COMMAND, not just the first",
        type: "boolean",
        short: "a",
      },
    },
  },
  execute: async (ctx) => {
    const { out, err, commandProvider } = ctx.externs;
    const { positionals, values } = ctx.locals;

    let anyCommandsNotFound = false;

    const printPath = async (commandName, command) => {
      if (command.path) {
        await out.write(`${command.path}\n`);
      } else {
        await out.write(`${commandName}: shell built-in command\n`);
      }
    };

    for (const commandName of positionals) {
      const result = values.all
        ? await commandProvider.lookupAll(commandName, { ctx })
        : await commandProvider.lookup(commandName, { ctx });

      if (!result) {
        anyCommandsNotFound = true;
        await err.write(`${commandName} not found\n`);
        continue;
      }

      if (values.all) {
        for (const command of result) {
          await printPath(commandName, command);
        }
      } else {
        await printPath(commandName, result);
      }
    }

    if (anyCommandsNotFound) {
      throw new Exit(1);
    }
  },
};

var module_open = {
  name: "open",
  usage: "open APP [ARGS]...",
  description: "Launch an anura application.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
  },
  execute: async (ctx) => {
    const { positionals } = ctx.locals;
    const { out, err, anura } = ctx.externs;

    if (positionals.length < 1) {
      await err.write("open: missing app package\n");
      throw new Exit(1);
    }

    const appID = positionals.shift();

    const app = anura.apps[appID];

    if (!app) {
      await err.write(`open: app '${appID}' not found\n`);
      throw new Exit(1);
    }

    await app.open(positionals);
  },
};

var module_eval = {
  name: "eval",
  usage: "eval [OPTIONS] [INTERPRETER]",
  description:
    "Evaluate JavaScript code from standard input. Optionally specify an INTERPRETER as either 'current' or 'top'\n" +
    "If 'current' is specified, the code will be evaluated in the current context.\n" +
    "If 'top' is specified, the code will be evaluated in the top-level context.\n" +
    "Pass the option '-j' or '--json' to output the result as JSON.",
  args: {
    $: "simple-parser",
    allowPositionals: true,
    options: {
      json: {
        description: "Output the result as JSON",
        short: "j",
        type: "boolean",
      },
    },
  },
  execute: async (ctx) => {
    new TextEncoder();

    let line, done;
    const arr = [];
    const next_line = async () => {
      ({ value: line, done } = await ctx.externs.in_.read());
    };

    for (await next_line(); !done; await next_line()) {
      arr.push(line, "\n");
    }

    const code = await new Blob(arr, { type: "text/plain" }).text();

    let interpreter = ctx.locals.positionals[0];

    const toString = (val) =>
      (ctx.locals.values.json ? JSON.stringify(val) : val) + "\n";

    try {
      switch (interpreter) {
        case "top":
          ctx.externs.out.write(toString(await window.top.eval(code)));
          break;
        default:
          ctx.externs.out.write(toString(await window.eval(code)));
      }
    } catch (e) {
      await ctx.externs.err.write(
        "\x1B[31;1meval: error: " + e.toString() + "\x1B[0m\n",
      );
      throw new Exit(1);
    }
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var builtins = {
  basename: module_basename,
  cat: module_cat,
  cd: module_cd,
  changelog: module_changelog,
  clear: module_clear,
  cp: module_cp,
  date: module_date,
  dcall: module_dcall,
  dirname: module_dirname,
  echo: module_echo,
  env: module_env,
  errno: module_errno,
  false: module_false,
  grep: module_grep,
  head: module_head,
  help: module_help,
  jq: module_jq,
  ls: module_ls,
  man: module_man,
  mkdir: module_mkdir,
  mv: module_mv,
  phetch: module_phetch,
  printf: module_printf,
  printhist: module_printhist,
  pwd: module_pwd,
  rm: module_rm,
  rmdir: module_rmdir,
  "sample-data": module_sample_data,
  sleep: module_sleep,
  sort: module_sort,
  tail: module_tail,
  touch: module_touch,
  true: module_true,
  wc: module_wc,
  which: module_which,
  open: module_open,
  eval: module_eval,
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
new TextEncoder();

class BetterReader {
  constructor({ delegate }) {
    this.delegate = delegate;
    this.chunks_ = [];
  }

  async read(opt_buffer) {
    if (!opt_buffer && this.chunks_.length === 0) {
      return await this.delegate.read();
    }

    const chunk = await this.getChunk_();

    if (!opt_buffer) {
      return chunk;
    }

    this.chunks_.push(chunk);

    while (this.getTotalBytesReady_() < opt_buffer.length) {
      this.chunks_.push(await this.getChunk_());
    }

    // TODO: need to handle EOT condition in this loop
    let offset = 0;
    for (;;) {
      let item = this.chunks_.shift();
      if (item === undefined) {
        throw new Error("calculation is wrong");
      }
      if (offset + item.length > opt_buffer.length) {
        const diff = opt_buffer.length - offset;
        this.chunks_.unshift(item.subarray(diff));
        item = item.subarray(0, diff);
      }
      opt_buffer.set(item, offset);
      offset += item.length;

      if (offset == opt_buffer.length) break;
    }

    // return opt_buffer.length;
  }

  async getChunk_() {
    if (this.chunks_.length === 0) {
      const { value } = await this.delegate.read();
      return value;
    }

    const len = this.getTotalBytesReady_();
    const merged = new Uint8Array(len);
    let offset = 0;
    for (const item of this.chunks_) {
      merged.set(item, offset);
      offset += item.length;
    }

    this.chunks_ = [];

    return merged;
  }

  getTotalBytesReady_() {
    return this.chunks_.reduce((sum, chunk) => sum + chunk.length, 0);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

new TextEncoder();

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class AbstractContext {
  get constants() {
    return this.instance_.constants;
  }
  get consts() {
    return this.constants;
  }
  get variables() {
    return this.instance_.valuesAccessor;
  }
  get vars() {
    return this.variables;
  }
}

// export class SubContext extends AbstractContext {
//     constructor ({ parent, changes }) {
//         for ( const k in parent.spec )
//     }
// }

class Context extends AbstractContext {
  constructor(spec) {
    super();
    this.spec = { ...spec };

    this.instance_ = {};

    if (!spec.constants) spec.constants = {};

    const constants = {};
    for (const k in this.spec.constants) {
      Object.defineProperty(constants, k, {
        value: this.spec.constants[k],
        enumerable: true,
      });
    }
    this.instance_.constants = constants;

    // const values = {};
    // for ( const k in this.spec.variables ) {
    //     Object.defineProperty(values, k, {
    //         value: this.spec.variables[k],
    //         enumerable: true,
    //         writable: true
    //     });
    // }
    // this.instance_.values = values;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class CommandCompleter {
  async getCompletions(ctx, inputState) {
    const { builtins } = ctx.registries;
    const query = inputState.input;

    if (query === "") {
      return [];
    }

    const completions = [];

    // TODO: Match executable names as well as builtins
    for (const commandName of Object.keys(builtins)) {
      if (commandName.startsWith(query)) {
        completions.push(commandName.slice(query.length));
      }
    }

    return completions;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class FileCompleter {
  async getCompletions(ctx, inputState) {
    const { filesystem } = ctx.platform;

    if (inputState.input === "") {
      return [];
    }

    let path = resolveRelativePath(ctx.vars, inputState.input);
    let dir = path_.dirname(path);
    let base = path_.basename(path);

    const completions = [];

    const result = await filesystem.readdir(dir);
    if (result === undefined) {
      return [];
    }

    for (const item of result) {
      if (item.name.startsWith(base)) {
        completions.push(item.name.slice(base.length));
      }
    }

    return completions;
  }
}

class AppCompleter {
  async getCompletions(ctx, inputState) {
    const { anura } = ctx.externs;

    if (inputState.input === "") {
      return [];
    }

    return Object.keys(anura.apps)
      .filter((app) => app.startsWith(inputState.input))
      .map((app) => app.slice(inputState.input.length));
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class OptionCompleter {
  async getCompletions(ctx, inputState) {
    const { builtins } = ctx.registries;
    const query = inputState.input;

    if (query === "") {
      return [];
    }

    // TODO: Query the command through the providers system.
    //       Or, we could include the command in the context that's given to completers?
    const command = builtins[inputState.tokens[0]];
    if (!command) {
      return [];
    }

    const completions = [];

    const processOptions = (options) => {
      for (const optionName of Object.keys(options)) {
        const prefixedOptionName = `--${optionName}`;
        if (prefixedOptionName.startsWith(query)) {
          completions.push(prefixedOptionName.slice(query.length));
        }
      }
    };

    // TODO: Only check these for builtins!
    processOptions(DEFAULT_OPTIONS);

    if (command.args?.options) {
      processOptions(command.args.options);
    }

    return completions;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class Uint8List {
  constructor(initialSize) {
    initialSize = initialSize || 2;

    this.array = new Uint8Array(initialSize);
    this.size = 0;
  }

  get capacity() {
    return this.array.length;
  }

  append(chunk) {
    if (typeof chunk === "number") {
      chunk = new Uint8Array([chunk]);
    }

    const sizeNeeded = this.size + chunk.length;
    let newCapacity = this.capacity;
    while (sizeNeeded > newCapacity) {
      newCapacity *= 2;
    }

    if (newCapacity !== this.capacity) {
      const newArray = new Uint8Array(newCapacity);
      newArray.set(this.array, 0);
      this.array = newArray;
    }

    this.array.set(chunk, this.size);
    this.size += chunk.length;
  }

  toArray() {
    return this.array.subarray(0, this.size);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const disallowAccessToUndefined = (obj) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (!target.hasOwnProperty(prop)) {
        throw new Error(
          `disallowed access to undefined property` +
            `: ${JSON.stringify(prop)}.`,
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class StatefulProcessor {
  constructor(params) {
    for (const k in params) this[k] = params[k];
  }
  async run(imports) {
    this.state = "start";
    imports = imports ?? {};
    const externals = {};
    for (const k in this.externals) {
      if (this.externals[k].required && !imports[k]) {
        throw new Error(`missing required external: ${k}`);
      }
      if (!imports[k]) continue;
      externals[k] = imports[k];
    }

    const ctx = new Context$1({
      consts: disallowAccessToUndefined(this.constants),
      externs: externals,
      vars: this.createVariables_(),
      setState: this.setState_.bind(this),
    });

    for (;;) {
      if (this.state === "end") break;

      await this.iter_(ctx);
    }

    return ctx.vars;
  }
  setState_(newState) {
    this.state = newState;
  }
  async iter_(runContext) {
    const ctx = runContext.sub({
      locals: {},
    });

    ctx.trigger = (name) => {
      return this.actions[name](ctx);
    };
    if (this.state !== this.lastState) {
      this.lastState = this.state;
      if (this.transitions.hasOwnProperty(this.state)) {
        for (const handler of this.transitions[this.state]) {
          await handler(ctx);
        }
      }
    }

    for (const beforeAll of this.beforeAlls) {
      await beforeAll.handler(ctx);
    }

    await this.states[this.state](ctx);
  }
  createVariables_() {
    const o = {};
    for (const k in this.variables) {
      if (this.variables[k].getDefaultValue) {
        o[k] = this.variables[k].getDefaultValue();
      }
    }
    return o;
  }
}

class StatefulProcessorBuilder {
  static COMMON_1 = ["variable", "external", "state", "action"];

  constructor() {
    this.constants = {};
    this.beforeAlls = [];
    this.transitions = {};

    for (const facet of this.constructor.COMMON_1) {
      this[facet + "s"] = {};
      this[facet] = function (name, value) {
        this[facet + "s"][name] = value;
        return this;
      };
    }
  }

  installContext(context) {
    for (const k in context.constants) {
      this.constant(k, context.constants[k]);
    }
    return this;
  }

  constant(name, value) {
    Object.defineProperty(this.constants, name, {
      value,
    });
    return this;
  }

  beforeAll(name, handler) {
    this.beforeAlls.push({
      name,
      handler,
    });
    return this;
  }

  onTransitionTo(name, handler) {
    if (!this.transitions.hasOwnProperty(name)) {
      this.transitions[name] = [];
    }
    this.transitions[name].push(handler);
    return this;
  }

  build() {
    const params = {};
    for (const facet of this.constructor.COMMON_1) {
      params[facet + "s"] = this[facet + "s"];
    }
    return new StatefulProcessor({
      ...params,
      constants: this.constants,
      beforeAlls: this.beforeAlls,
      transitions: this.transitions,
    });
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const modifiers = ["shift", "alt", "ctrl", "meta"];

const keyboardModifierBits = {};
for (let i = 0; i < modifiers.length; i++) {
  const key = `KEYBOARD_BIT_${modifiers[i].toUpperCase()}`;
  keyboardModifierBits[key] = 1 << i;
}

const ANSIContext = new Context({
  constants: {
    CHAR_LF: "\n".charCodeAt(0),
    CHAR_CR: "\r".charCodeAt(0),
    CHAR_TAB: "\t".charCodeAt(0),
    CHAR_CSI: "[".charCodeAt(0),
    CHAR_OSC: "]".charCodeAt(0),
    CHAR_ETX: 0x03,
    CHAR_EOT: 0x04,
    CHAR_ESC: 0x1b,
    CHAR_DEL: 0x7f,
    CHAR_BEL: 0x07,
    CHAR_FF: 0x0c,
    CSI_F_0: 0x40,
    CSI_F_E: 0x7f,
    ...keyboardModifierBits,
  },
});

const getActiveModifiersFromXTerm = (n) => {
  // decrement explained in doc/graveyard/keyboard_modifiers.md
  n--;

  const active = {};

  for (let i = 0; i < modifiers.length; i++) {
    if (n & (1 << i)) {
      active[modifiers[i]] = true;
    }
  }

  return active;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// [reference impl](https://github.com/brgl/busybox/blob/master/shell/ash.c)

const list_ws$1 = [" ", "\n", "\t"];
const list_recorded_tokens = ["|", ">", "<", "&", ";", "(", ")"];
const list_stoptoken$1 = [
  "|",
  ">",
  "<",
  "&",
  "\\",
  "#",
  ";",
  "(",
  ")",
  ...list_ws$1,
];

const TOKENS = {};
for (const k of list_recorded_tokens) {
  TOKENS[k] = {};
}

const readtoken = (str) => {
  let state = null;
  let buffer = "";
  let quoteType = "";
  const tokens = [];

  const actions = {
    endToken: () => {
      tokens.push(buffer);
      buffer = "";
    },
  };

  const states = {
    start: (i) => {
      if (list_ws$1.includes(str[i])) {
        return;
      }
      if (str[i] === "#") return str.length;
      if (list_recorded_tokens.includes(str[i])) {
        tokens.push(TOKENS[str[i]]);
        return;
      }
      if (str[i] === '"' || str[i] === "'") {
        state = states.quote;
        quoteType = str[i];
        return;
      }
      state = states.text;
      return i; // prevent increment
    },
    text: (i) => {
      if (str[i] === '"' || str[i] === "'") {
        state = states.quote;
        quoteType = str[i];
        return;
      }
      if (list_stoptoken$1.includes(str[i])) {
        state = states.start;
        actions.endToken();
        return i; // prevent increment
      }
      buffer += str[i];
    },
    quote: (i) => {
      if (str[i] === "\\") {
        state = states.quote_esc;
        return;
      }
      if (str[i] === quoteType) {
        state = states.text;
        return;
      }
      buffer += str[i];
    },
    quote_esc: (i) => {
      if (str[i] !== quoteType) {
        buffer += "\\";
      }
      buffer += str[i];
      state = states.quote;
    },
  };
  state = states.start;
  for (let i = 0; i < str.length; ) {
    let newI = state(i);
    i = newI !== undefined ? newI : i + 1;
  }

  if (buffer !== "") actions.endToken();

  return tokens;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: update to use syntax parser

// REMINDER: input state will be sent to readline first,
//   then readline will use the input state to determine
//   what component to ask for tab completion

// to perform autocomplete functions
const readline_comprehend = (ctx) => {
  const { input, cursor } = ctx.params;

  // TODO: CST for input tokens might be a good idea
  // for now, tokens up to the current cursor position
  // will be considered.

  const relevantInput = input.slice(0, cursor);

  const endsWithWhitespace = (() => {
    const lastChar = relevantInput[relevantInput.length - 1];
    return (
      lastChar === " " ||
      lastChar === "\t" ||
      lastChar === "\r" ||
      lastChar === "\n"
    );
  })();

  let tokens = readtoken(relevantInput);

  // We now go backwards through the tokens, looking for:
  // - a redirect token immediately to the left
  // - a pipe token to the left

  if (tokens.length === 0) return { $: "empty" };

  // Remove tokens for previous commands
  for (let i = tokens.length; i >= 0; i--) {
    const token = tokens[i];
    const isCommandSeparator = token === TOKENS["|"] || token === TOKENS[";"];
    if (isCommandSeparator) {
      tokens = tokens.slice(i + 1);
      break;
    }
  }

  // Check if current input is for a redirect operator
  const resultIfRedirectOperator = (() => {
    if (tokens.length < 1) return;

    const lastToken = tokens[tokens.length - 1];
    if (lastToken === TOKENS["<"] || lastToken === TOKENS[">"]) {
      return {
        $: "redirect",
      };
    }

    if (tokens.length < 2) return;
    if (endsWithWhitespace) return;

    const secondFromLastToken = tokens[tokens.length - 2];
    if (
      secondFromLastToken === TOKENS["<"] ||
      secondFromLastToken === TOKENS[">"]
    ) {
      return {
        $: "redirect",
        input: lastToken,
      };
    }
  })();

  if (resultIfRedirectOperator) return resultIfRedirectOperator;

  if (tokens.length === 0) {
    return { $: "empty" };
  }

  // If the first token is not a command name, then
  // this input is not considered comprehensible
  if (typeof tokens[0] !== "string") {
    return {
      $: "unrecognized",
    };
  }

  // DRY: command arguments are parsed by readline
  const argTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === TOKENS["<"] || tokens[i] === TOKENS[">"]) {
      // skip this token and the next one
      i++;
      continue;
    }

    argTokens.push(tokens[i]);
  }

  return {
    $: "command",
    id: tokens[0],
    tokens: argTokens,
    input: endsWithWhitespace ? "" : argTokens[argTokens.length - 1],
    endsWithWhitespace,
  };
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const findNextWord = (str, from, reverse) => {
  let stage = 0;
  let incr = reverse ? -1 : 1;
  const cond = reverse ? (i) => i > 0 : (i) => i < str.length;
  if (reverse && from !== 0) from--;
  for (let i = from; cond(i); i += incr) {
    if (stage === 0) {
      if (str[i] !== " ") stage++;
      continue;
    }
    if (stage === 1) {
      if (str[i] === " ") return reverse ? i + 1 : i;
    }
  }
  return reverse ? 0 : str.length;
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: potentially include metadata in handlers

// --- util ---
const cc$1 = (chr) => chr.charCodeAt(0);

const { consts } = ANSIContext;

// --- convenience function decorators ---
const CSI_INT_ARG = (delegate) => (ctx) => {
  const controlSequence = ctx.locals.controlSequence;

  let str = new TextDecoder().decode(controlSequence);

  // Detection of modifier keys like ctrl and shift
  if (str.includes(";")) {
    const parts = str.split(";");
    str = parts[0];
    const modsStr = parts[parts.length - 1];
    let modN = Number.parseInt(modsStr);
    const mods = getActiveModifiersFromXTerm(modN);
    for (const k in mods) ctx.locals[k] = mods[k];
  }

  let num = str === "" ? 1 : Number.parseInt(str);
  if (Number.isNaN(num)) num = 0;

  ctx.locals.num = num;

  return delegate(ctx);
};

// --- PC-Style Function Key handles (see `~` final byte in CSI_HANDLERS) ---
const PC_FN_HANDLERS = {
  // delete key
  3: (ctx) => {
    const { vars } = ctx;
    const deleteSequence = new Uint8Array([
      consts.CHAR_ESC,
      consts.CHAR_CSI,
      cc$1("P"),
    ]);
    vars.result =
      vars.result.slice(0, vars.cursor) + vars.result.slice(vars.cursor + 1);
    ctx.externs.out.write(deleteSequence);
  },
};

const save_history = (ctx) => {
  const { history } = ctx.externs;
  history.save(ctx.vars.result);
};

const home = (ctx) => {
  const amount = ctx.vars.cursor;
  ctx.vars.cursor = 0;
  const moveSequence = new Uint8Array([
    consts.CHAR_ESC,
    consts.CHAR_CSI,
    ...new TextEncoder().encode("" + amount),
    cc$1("D"),
  ]);
  if (amount !== 0) ctx.externs.out.write(moveSequence);
};

const select_current_history = (ctx) => {
  const { history } = ctx.externs;
  home(ctx);
  ctx.vars.result = history.get();
  ctx.vars.cursor = ctx.vars.result.length;
  const clearToEndSequence = new Uint8Array([
    consts.CHAR_ESC,
    consts.CHAR_CSI,
    ...new TextEncoder().encode("0"),
    cc$1("K"),
  ]);
  ctx.externs.out.write(clearToEndSequence);
  ctx.externs.out.write(history.get());
};

// --- CSI handlers: this is the last definition in this file ---
const CSI_HANDLERS = {
  [cc$1("A")]: CSI_INT_ARG((ctx) => {
    save_history(ctx);
    const { history } = ctx.externs;

    if (history.index === 0) return;

    history.index--;
    select_current_history(ctx);
  }),
  [cc$1("B")]: CSI_INT_ARG((ctx) => {
    save_history(ctx);
    const { history } = ctx.externs;

    if (history.index === history.items.length - 1) return;

    history.index++;
    select_current_history(ctx);
  }),
  // cursor back
  [cc$1("D")]: CSI_INT_ARG((ctx) => {
    if (ctx.vars.cursor === 0) {
      return;
    }
    if (ctx.locals.ctrl) {
      // TODO: temporary inaccurate implementation
      const txt = ctx.vars.result;
      const ind = findNextWord(txt, ctx.vars.cursor, true);
      const diff = ctx.vars.cursor - ind;
      ctx.vars.cursor = ind;
      const moveSequence = new Uint8Array([
        consts.CHAR_ESC,
        consts.CHAR_CSI,
        ...new TextEncoder().encode("" + diff),
        cc$1("D"),
      ]);
      ctx.externs.out.write(moveSequence);
      return;
    }
    ctx.vars.cursor -= ctx.locals.num;
    ctx.locals.doWrite = true;
  }),
  // cursor forward
  [cc$1("C")]: CSI_INT_ARG((ctx) => {
    if (ctx.vars.cursor >= ctx.vars.result.length) {
      return;
    }
    if (ctx.locals.ctrl) {
      // TODO: temporary inaccurate implementation
      const txt = ctx.vars.result;
      const ind = findNextWord(txt, ctx.vars.cursor);
      const diff = ind - ctx.vars.cursor;
      ctx.vars.cursor = ind;
      const moveSequence = new Uint8Array([
        consts.CHAR_ESC,
        consts.CHAR_CSI,
        ...new TextEncoder().encode("" + diff),
        cc$1("C"),
      ]);
      ctx.externs.out.write(moveSequence);
      return;
    }
    ctx.vars.cursor += ctx.locals.num;
    ctx.locals.doWrite = true;
  }),
  // PC-Style Function Keys
  [cc$1("~")]: CSI_INT_ARG((ctx) => {
    if (!PC_FN_HANDLERS.hasOwnProperty(ctx.locals.num)) {
      console.error(`unrecognized PC Function: ${ctx.locals.num}`);
      return;
    }
    PC_FN_HANDLERS[ctx.locals.num](ctx);
  }),
  // Home
  [cc$1("H")]: (ctx) => {
    home(ctx);
  },
  // End
  [cc$1("F")]: (ctx) => {
    const amount = ctx.vars.result.length - ctx.vars.cursor;
    ctx.vars.cursor = ctx.vars.result.length;
    const moveSequence = new Uint8Array([
      consts.CHAR_ESC,
      consts.CHAR_CSI,
      ...new TextEncoder().encode("" + amount),
      cc$1("C"),
    ]);
    if (amount !== 0) ctx.externs.out.write(moveSequence);
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class HistoryManager {
  constructor({ enableLogging = false } = {}) {
    this.items = [];
    this.index_ = 0;
    this.listeners_ = {};
    this.enableLogging_ = enableLogging;
  }

  log(...a) {
    // TODO: Command line option for configuring logging
    if (this.enableLogging_) {
      console.log("[HistoryManager]", ...a);
    }
  }

  get index() {
    return this.index_;
  }

  set index(v) {
    this.log("setting index", v);
    this.index_ = v;
  }

  get() {
    return this.items[this.index];
  }

  // Save, overwriting the current history item
  save(data, { opt_debug } = {}) {
    this.log(
      "saving",
      data,
      "at",
      this.index,
      ...(opt_debug ? ["from", opt_debug] : []),
    );
    this.items[this.index] = data;

    if (this.listeners_.hasOwnProperty("add")) {
      for (const listener of this.listeners_.add) {
        listener(data);
      }
    }
  }

  append(data) {
    if (this.items.length !== 0 && this.index !== this.items.length) {
      this.log("POP");
      // remove last item
      this.items.pop();
    }
    this.index = this.items.length;
    this.save(data, { opt_debug: "append" });
    this.index++;
  }

  on(topic, listener) {
    if (!this.listeners_.hasOwnProperty(topic)) {
      this.listeners_[topic] = [];
    }
    this.listeners_[topic].push(listener);
  }
}

class MergeCompleter {
  constructor(completers) {
    this.completers = completers;
  }

  async getCompletions(ctx, inputState) {
    const completions = await Promise.all(
      this.completers.map((completer) =>
        completer.getCompletions(ctx, inputState),
      ),
    );

    return completions.flat();
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const decoder$3 = new TextDecoder();

const cc = (chr) => chr.charCodeAt(0);

const ReadlineProcessorBuilder = (builder) =>
  builder
    // TODO: import these constants from a package
    .installContext(ANSIContext)
    .installContext(
      new Context({
        variables: {
          result: { value: "" },
          cursor: { value: 0 },
        },
        // TODO: dormant configuration; waiting on ContextSignature
        imports: {
          out: {},
          in_: {},
          history: {},
        },
      }),
    )
    .variable("result", { getDefaultValue: () => "" })
    .variable("cursor", { getDefaultValue: () => 0 })
    .external("out", { required: true })
    .external("in_", { required: true })
    .external("process", { required: true })
    .external("history", { required: true })
    .external("prompt", { required: true })
    .external("commandCtx", { required: true })
    .beforeAll("get-byte", async (ctx) => {
      const { locals, externs } = ctx;

      const byteBuffer = new Uint8Array(1);
      await externs.in_.read(byteBuffer);
      locals.byteBuffer = byteBuffer;
      locals.byte = byteBuffer[0];
    })
    .state("start", async (ctx) => {
      const { consts, vars, externs, locals } = ctx;

      if (locals.byte === consts.CHAR_LF || locals.byte === consts.CHAR_CR) {
        externs.out.write("\n");
        ctx.setState("end");
        return;
      }

      if (locals.byte === consts.CHAR_ETX) {
        externs.out.write("^C\n");
        // Exit if input line is empty
        if (ctx.vars.result.length === 0) {
          externs.process.exit(0);
          return;
        }
        // Otherwise clear it
        ctx.vars.result = "";
        ctx.setState("end");
        return;
      }

      if (locals.byte === consts.CHAR_EOT) {
        externs.out.write("^D\n");
        ctx.vars.result = "";
        ctx.setState("end");
        return;
      }

      if (locals.byte === consts.CHAR_FF) {
        externs.out.write("\x1B[H\x1B[2J");
        externs.out.write(externs.prompt);
        externs.out.write(vars.result);
        const invCurPos = vars.result.length - vars.cursor;
        console.log(invCurPos);
        if (invCurPos !== 0) {
          externs.out.write(`\x1B[${invCurPos}D`);
        }
        return;
      }

      if (locals.byte === consts.CHAR_TAB) {
        const inputState = readline_comprehend(
          ctx.sub({
            params: {
              input: vars.result,
              cursor: vars.cursor,
            },
          }),
        );
        // NEXT: get tab completer for input state
        console.log("input state", inputState);

        let completer = null;
        if (inputState.$ === "redirect") {
          completer = new FileCompleter();
        }

        if (inputState.$ === "command") {
          if (inputState.tokens.length === 1) {
            // Match first token against command names
            completer = new CommandCompleter();
          } else if (inputState.input.startsWith("--")) {
            // Match `--*` against option names, if they exist
            completer = new OptionCompleter();
          } else {
            // Match everything else against file names or app package names
            completer = new MergeCompleter([
              new FileCompleter(),
              new AppCompleter(),
            ]);
          }
        }

        if (completer === null) return;

        const completions = await completer.getCompletions(
          externs.commandCtx,
          inputState,
        );

        const applyCompletion = (txt) => {
          const p1 = vars.result.slice(0, vars.cursor);
          const p2 = vars.result.slice(vars.cursor);
          console.log({ p1, p2 });
          vars.result = p1 + txt + p2;
          vars.cursor += txt.length;
          externs.out.write(txt);
        };

        if (completions.length === 0) return;

        if (completions.length === 1) {
          applyCompletion(completions[0]);
        }

        if (completions.length > 1) {
          let inCommon = "";
          for (let i = 0; true; i++) {
            if (
              !completions.every((completion) => {
                return completion.length > i;
              })
            )
              break;

            let matches = true;

            const chrFirst = completions[0][i];
            for (let ci = 1; ci < completions.length; ci++) {
              const chrOther = completions[ci][i];
              if (chrFirst !== chrOther) {
                matches = false;
                break;
              }
            }

            if (!matches) break;
            inCommon += chrFirst;
          }

          if (inCommon.length > 0) {
            applyCompletion(inCommon);
          }
        }
        return;
      }

      if (locals.byte === consts.CHAR_ESC) {
        ctx.setState("ESC");
        return;
      }

      // (note): DEL is actually the backspace key
      // [explained here](https://en.wikipedia.org/wiki/Backspace#Common_use)
      // TOOD: very similar to delete in CSI_HANDLERS; how can this be unified?
      if (locals.byte === consts.CHAR_DEL) {
        // can't backspace at beginning of line
        if (vars.cursor === 0) return;

        vars.result =
          vars.result.slice(0, vars.cursor - 1) +
          vars.result.slice(vars.cursor);

        vars.cursor--;

        // TODO: maybe wrap these CSI codes in a library
        const backspaceSequence = new Uint8Array([
          // consts.CHAR_ESC, consts.CHAR_CSI, cc('s'), // save cur
          consts.CHAR_ESC,
          consts.CHAR_CSI,
          cc("D"), // left
          consts.CHAR_ESC,
          consts.CHAR_CSI,
          cc("P"),
          // consts.CHAR_ESC, consts.CHAR_CSI, cc('u'), // restore cur
          // consts.CHAR_ESC, consts.CHAR_CSI, cc('D'), // left
        ]);

        externs.out.write(backspaceSequence);
        return;
      }

      const part = decoder$3.decode(locals.byteBuffer);

      if (vars.cursor === vars.result.length) {
        // output
        externs.out.write(locals.byteBuffer);
        // update buffer
        vars.result = vars.result + part;
        // update cursor
        vars.cursor += part.length;
      } else {
        // output
        const insertSequence = new Uint8Array([
          consts.CHAR_ESC,
          consts.CHAR_CSI,
          "@".charCodeAt(0),
          ...locals.byteBuffer,
        ]);
        externs.out.write(insertSequence);
        // update buffer
        vars.result =
          vars.result.slice(0, vars.cursor) +
          part +
          vars.result.slice(vars.cursor);
        // update cursor
        vars.cursor += part.length;
      }
    })
    .onTransitionTo("ESC-CSI", async (ctx) => {
      ctx.vars.controlSequence = new Uint8List();
    })
    .state("ESC", async (ctx) => {
      const { consts, vars, externs, locals } = ctx;

      if (locals.byte === consts.CHAR_ESC) {
        externs.out.write(consts.CHAR_ESC);
        ctx.setState("start");
        return;
      }

      if (locals.byte === ctx.consts.CHAR_CSI) {
        ctx.setState("ESC-CSI");
        return;
      }
      if (locals.byte === ctx.consts.CHAR_OSC) {
        ctx.setState("ESC-OSC");
        return;
      }
    })
    .state("ESC-CSI", async (ctx) => {
      const { consts, locals, vars } = ctx;

      if (locals.byte >= consts.CSI_F_0 && locals.byte < consts.CSI_F_E) {
        ctx.trigger("ESC-CSI.post");
        ctx.setState("start");
        return;
      }

      vars.controlSequence.append(locals.byte);
    })
    .state("ESC-OSC", async (ctx) => {
      const { consts, locals, vars } = ctx;

      // TODO: ESC\ can also end an OSC sequence according
      //       to sources, but this has not been implemented
      //       because it would add another state.
      //       This should be implemented when there's a
      //       simpler solution ("peek" & "scan" functionality)
      if (locals.byte === 0x07) {
        // ctx.trigger('ESC-OSC.post');
        ctx.setState("start");
        return;
      }

      vars.controlSequence.append(locals.byte);
    })
    .action("ESC-CSI.post", async (ctx) => {
      const { vars, externs, locals } = ctx;

      const finalByte = locals.byte;
      const controlSequence = vars.controlSequence.toArray();

      // Log.log('controlSequence', finalByte, controlSequence);

      if (!CSI_HANDLERS.hasOwnProperty(finalByte)) {
        return;
      }

      ctx.locals.controlSequence = controlSequence;
      ctx.locals.doWrite = false;
      CSI_HANDLERS[finalByte](ctx);

      if (ctx.locals.doWrite) {
        externs.out.write(
          new Uint8Array([
            ctx.consts.CHAR_ESC,
            ctx.consts.CHAR_CSI,
            ...controlSequence,
            finalByte,
          ]),
        );
      }
    })
    .build();

const ReadlineProcessor = ReadlineProcessorBuilder(
  new StatefulProcessorBuilder(),
);

class Readline {
  constructor(params) {
    this.internal_ = {};
    for (const k in params) this.internal_[k] = params[k];

    this.history = new HistoryManager();
  }

  async readline(prompt, commandCtx) {
    const out = this.internal_.out;
    const in_ = this.internal_.in;
    const process = this.internal_.process;

    await out.write(prompt);

    const { result } = await ReadlineProcessor.run({
      prompt,
      out,
      in_,
      process,
      history: this.history,
      commandCtx,
    });

    if (result.trim() !== "") {
      this.history.append(result);
    }

    return result;
  }
}

class ReadlineLib {
  static create(params) {
    const rl = new Readline(params);
    return rl;
  }
}

/*
This file is copied from https://github.com/nodejs/node/blob/v14.19.3/lib/internal/per_context/primordials.js
under the following license:

Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

/* eslint-disable node-core/prefer-primordials */

// This file subclasses and stores the JS builtins that come from the VM
// so that Node.js's builtin modules do not need to later look these up from
// the global proxy, which can be mutated by users.

// Use of primordials have sometimes a dramatic impact on performance, please
// benchmark all changes made in performance-sensitive areas of the codebase.
// See: https://github.com/nodejs/node/pull/38248

const primordials = {};

const {
  defineProperty: ReflectDefineProperty,
  getOwnPropertyDescriptor: ReflectGetOwnPropertyDescriptor,
  ownKeys: ReflectOwnKeys,
} = Reflect;

// `uncurryThis` is equivalent to `func => Function.prototype.call.bind(func)`.
// It is using `bind.bind(call)` to avoid using `Function.prototype.bind`
// and `Function.prototype.call` after it may have been mutated by users.
const { apply, bind, call } = Function.prototype;
const uncurryThis = bind.bind(call);
primordials.uncurryThis = uncurryThis;

// `applyBind` is equivalent to `func => Function.prototype.apply.bind(func)`.
// It is using `bind.bind(apply)` to avoid using `Function.prototype.bind`
// and `Function.prototype.apply` after it may have been mutated by users.
const applyBind = bind.bind(apply);
primordials.applyBind = applyBind;

// Methods that accept a variable number of arguments, and thus it's useful to
// also create `${prefix}${key}Apply`, which uses `Function.prototype.apply`,
// instead of `Function.prototype.call`, and thus doesn't require iterator
// destructuring.
const varargsMethods = [
  // 'ArrayPrototypeConcat' is omitted, because it performs the spread
  // on its own for arrays and array-likes with a truthy
  // @@isConcatSpreadable symbol property.
  'ArrayOf',
  'ArrayPrototypePush',
  'ArrayPrototypeUnshift',
  // 'FunctionPrototypeCall' is omitted, since there's 'ReflectApply'
  // and 'FunctionPrototypeApply'.
  'MathHypot',
  'MathMax',
  'MathMin',
  'StringPrototypeConcat',
  'TypedArrayOf',
];

function getNewKey(key) {
  return typeof key === 'symbol' ?
    `Symbol${key.description[7].toUpperCase()}${key.description.slice(8)}` :
    `${key[0].toUpperCase()}${key.slice(1)}`;
}

function copyAccessor(dest, prefix, key, { enumerable, get, set }) {
  ReflectDefineProperty(dest, `${prefix}Get${key}`, {
    value: uncurryThis(get),
    enumerable
  });
  if (set !== undefined) {
    ReflectDefineProperty(dest, `${prefix}Set${key}`, {
      value: uncurryThis(set),
      enumerable
    });
  }
}

function copyPropsRenamed(src, dest, prefix) {
  for (const key of ReflectOwnKeys(src)) {
    const newKey = getNewKey(key);
    const desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      const name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, desc);
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          // `src` is bound as the `this` so that the static `this` points
          // to the object it was defined on,
          // e.g.: `ArrayOfApply` gets a `this` of `Array`:
          value: applyBind(desc.value, src),
        });
      }
    }
  }
}

function copyPropsRenamedBound(src, dest, prefix) {
  for (const key of ReflectOwnKeys(src)) {
    const newKey = getNewKey(key);
    const desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      const { value } = desc;
      if (typeof value === 'function') {
        desc.value = value.bind(src);
      }

      const name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, desc);
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          value: applyBind(value, src),
        });
      }
    }
  }
}

function copyPrototype(src, dest, prefix) {
  for (const key of ReflectOwnKeys(src)) {
    const newKey = getNewKey(key);
    const desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      const { value } = desc;
      if (typeof value === 'function') {
        desc.value = uncurryThis(value);
      }

      const name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, desc);
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          value: applyBind(value),
        });
      }
    }
  }
}

// Create copies of configurable value properties of the global object
[
  'Proxy',
  'globalThis',
].forEach((name) => {
  // eslint-disable-next-line no-restricted-globals
  primordials[name] = globalThis[name];
});

// Create copies of URI handling functions
[
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
].forEach((fn) => {
  primordials[fn.name] = fn;
});

// Create copies of the namespace objects
[
  'JSON',
  'Math',
  'Proxy',
  'Reflect',
].forEach((name) => {
  // eslint-disable-next-line no-restricted-globals
  copyPropsRenamed(commonjsGlobal[name], primordials, name);
});

// Create copies of intrinsic objects
[
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'Map',
  'Number',
  'Object',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'URIError',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'WeakMap',
  'WeakSet',
].forEach((name) => {
  // eslint-disable-next-line no-restricted-globals
  const original = commonjsGlobal[name];
  primordials[name] = original;
  copyPropsRenamed(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});

// Create copies of intrinsic objects that require a valid `this` to call
// static methods.
// Refs: https://www.ecma-international.org/ecma-262/#sec-promise.all
[
  'Promise',
].forEach((name) => {
  // eslint-disable-next-line no-restricted-globals
  const original = commonjsGlobal[name];
  primordials[name] = original;
  copyPropsRenamedBound(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});

// Create copies of abstract intrinsic objects that are not directly exposed
// on the global object.
// Refs: https://tc39.es/ecma262/#sec-%typedarray%-intrinsic-object
[
  { name: 'TypedArray', original: Reflect.getPrototypeOf(Uint8Array) },
  { name: 'ArrayIterator', original: {
    prototype: Reflect.getPrototypeOf(Array.prototype[Symbol.iterator]()),
  } },
  { name: 'StringIterator', original: {
    prototype: Reflect.getPrototypeOf(String.prototype[Symbol.iterator]()),
  } },
].forEach(({ name, original }) => {
  primordials[name] = original;
  // The static %TypedArray% methods require a valid `this`, but can't be bound,
  // as they need a subclass constructor as the receiver:
  copyPrototype(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});

/* eslint-enable node-core/prefer-primordials */

const {
  ArrayPrototypeForEach: ArrayPrototypeForEach$1,
  FunctionPrototypeCall,
  Map: Map$1,
  ObjectFreeze: ObjectFreeze$1,
  ObjectSetPrototypeOf,
  Set,
  SymbolIterator,
  WeakMap,
  WeakSet,
} = primordials;

// Because these functions are used by `makeSafe`, which is exposed
// on the `primordials` object, it's important to use const references
// to the primordials that they use:
const createSafeIterator = (factory, next) => {
  class SafeIterator {
    constructor(iterable) {
      this._iterator = factory(iterable);
    }
    next() {
      return next(this._iterator);
    }
    [SymbolIterator]() {
      return this;
    }
  }
  ObjectSetPrototypeOf(SafeIterator.prototype, null);
  ObjectFreeze$1(SafeIterator.prototype);
  ObjectFreeze$1(SafeIterator);
  return SafeIterator;
};

primordials.SafeArrayIterator = createSafeIterator(
  primordials.ArrayPrototypeSymbolIterator,
  primordials.ArrayIteratorPrototypeNext
);
primordials.SafeStringIterator = createSafeIterator(
  primordials.StringPrototypeSymbolIterator,
  primordials.StringIteratorPrototypeNext
);

const copyProps = (src, dest) => {
  ArrayPrototypeForEach$1(ReflectOwnKeys(src), (key) => {
    if (!ReflectGetOwnPropertyDescriptor(dest, key)) {
      ReflectDefineProperty(
        dest,
        key,
        ReflectGetOwnPropertyDescriptor(src, key));
    }
  });
};

const makeSafe = (unsafe, safe) => {
  if (SymbolIterator in unsafe.prototype) {
    const dummy = new unsafe();
    let next; // We can reuse the same `next` method.

    ArrayPrototypeForEach$1(ReflectOwnKeys(unsafe.prototype), (key) => {
      if (!ReflectGetOwnPropertyDescriptor(safe.prototype, key)) {
        const desc = ReflectGetOwnPropertyDescriptor(unsafe.prototype, key);
        if (
          typeof desc.value === 'function' &&
          desc.value.length === 0 &&
          SymbolIterator in (FunctionPrototypeCall(desc.value, dummy) ?? {})
        ) {
          const createIterator = uncurryThis(desc.value);
          next = next ?? uncurryThis(createIterator(dummy).next);
          const SafeIterator = createSafeIterator(createIterator, next);
          desc.value = function() {
            return new SafeIterator(this);
          };
        }
        ReflectDefineProperty(safe.prototype, key, desc);
      }
    });
  } else {
    copyProps(unsafe.prototype, safe.prototype);
  }
  copyProps(unsafe, safe);

  ObjectSetPrototypeOf(safe.prototype, null);
  ObjectFreeze$1(safe.prototype);
  ObjectFreeze$1(safe);
  return safe;
};
primordials.makeSafe = makeSafe;

// Subclass the constructors because we need to use their prototype
// methods later.
// Defining the `constructor` is necessary here to avoid the default
// constructor which uses the user-mutable `%ArrayIteratorPrototype%.next`.
primordials.SafeMap = makeSafe(
  Map$1,
  class SafeMap extends Map$1 {
    constructor(i) { super(i); } // eslint-disable-line no-useless-constructor
  }
);
primordials.SafeWeakMap = makeSafe(
  WeakMap,
  class SafeWeakMap extends WeakMap {
    constructor(i) { super(i); } // eslint-disable-line no-useless-constructor
  }
);
primordials.SafeSet = makeSafe(
  Set,
  class SafeSet extends Set {
    constructor(i) { super(i); } // eslint-disable-line no-useless-constructor
  }
);
primordials.SafeWeakSet = makeSafe(
  WeakSet,
  class SafeWeakSet extends WeakSet {
    constructor(i) { super(i); } // eslint-disable-line no-useless-constructor
  }
);

ObjectSetPrototypeOf(primordials, null);
ObjectFreeze$1(primordials);

var primordials_1 = primordials;

let ERR_INVALID_ARG_TYPE$1 = class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super(`${name} must be ${expected} got ${actual}`);
    this.code = 'ERR_INVALID_ARG_TYPE';
  }
};

let ERR_INVALID_ARG_VALUE$1 = class ERR_INVALID_ARG_VALUE extends TypeError {
  constructor(arg1, arg2, expected) {
    super(`The property ${arg1} ${expected}. Received '${arg2}'`);
    this.code = 'ERR_INVALID_ARG_VALUE';
  }
};

let ERR_PARSE_ARGS_INVALID_OPTION_VALUE$1 = class ERR_PARSE_ARGS_INVALID_OPTION_VALUE extends Error {
  constructor(message) {
    super(message);
    this.code = 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE';
  }
};

let ERR_PARSE_ARGS_UNKNOWN_OPTION$1 = class ERR_PARSE_ARGS_UNKNOWN_OPTION extends Error {
  constructor(option, allowPositionals) {
    const suggestDashDash = allowPositionals ? `. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- ${JSON.stringify(option)}` : '';
    super(`Unknown option '${option}'${suggestDashDash}`);
    this.code = 'ERR_PARSE_ARGS_UNKNOWN_OPTION';
  }
};

let ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL$1 = class ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL extends Error {
  constructor(positional) {
    super(`Unexpected argument '${positional}'. This command does not take positional arguments`);
    this.code = 'ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL';
  }
};

var errors = {
  codes: {
    ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE$1,
    ERR_INVALID_ARG_VALUE: ERR_INVALID_ARG_VALUE$1,
    ERR_PARSE_ARGS_INVALID_OPTION_VALUE: ERR_PARSE_ARGS_INVALID_OPTION_VALUE$1,
    ERR_PARSE_ARGS_UNKNOWN_OPTION: ERR_PARSE_ARGS_UNKNOWN_OPTION$1,
    ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL: ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL$1,
  }
};

// This file is a proxy of the original file located at:
// https://github.com/nodejs/node/blob/main/lib/internal/validators.js
// Every addition or modification to this file must be evaluated
// during the PR review.

const {
  ArrayIsArray,
  ArrayPrototypeIncludes: ArrayPrototypeIncludes$1,
  ArrayPrototypeJoin,
} = primordials_1;

const {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = errors;

function validateString$1(value, name) {
  if (typeof value !== 'string') {
    throw new ERR_INVALID_ARG_TYPE(name, 'String', value);
  }
}

function validateUnion$1(value, name, union) {
  if (!ArrayPrototypeIncludes$1(union, value)) {
    throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value);
  }
}

function validateBoolean$1(value, name) {
  if (typeof value !== 'boolean') {
    throw new ERR_INVALID_ARG_TYPE(name, 'Boolean', value);
  }
}

function validateArray$1(value, name) {
  if (!ArrayIsArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
  }
}

function validateStringArray$1(value, name) {
  validateArray$1(value, name);
  for (let i = 0; i < value.length; i++) {
    validateString$1(value[i], `${name}[${i}]`);
  }
}

function validateBooleanArray$1(value, name) {
  validateArray$1(value, name);
  for (let i = 0; i < value.length; i++) {
    validateBoolean$1(value[i], `${name}[${i}]`);
  }
}

/**
 * @param {unknown} value
 * @param {string} name
 * @param {{
 *   allowArray?: boolean,
 *   allowFunction?: boolean,
 *   nullable?: boolean
 * }} [options]
 */
function validateObject$2(value, name, options) {
  const useDefaultOptions = options == null;
  const allowArray = useDefaultOptions ? false : options.allowArray;
  const allowFunction = useDefaultOptions ? false : options.allowFunction;
  const nullable = useDefaultOptions ? false : options.nullable;
  if ((!nullable && value === null) ||
      (!allowArray && ArrayIsArray(value)) ||
      (typeof value !== 'object' && (
        !allowFunction || typeof value !== 'function'
      ))) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
  }
}

var validators = {
  validateArray: validateArray$1,
  validateObject: validateObject$2,
  validateString: validateString$1,
  validateStringArray: validateStringArray$1,
  validateUnion: validateUnion$1,
  validateBoolean: validateBoolean$1,
  validateBooleanArray: validateBooleanArray$1,
};

// This is a placeholder for util.js in node.js land.

const {
  ObjectCreate,
  ObjectFreeze,
} = primordials_1;

const kEmptyObject$1 = ObjectFreeze(ObjectCreate(null));

var util = {
  kEmptyObject: kEmptyObject$1,
};

const {
  ArrayPrototypeFind,
  ObjectEntries: ObjectEntries$1,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn$1,
  StringPrototypeCharAt: StringPrototypeCharAt$1,
  StringPrototypeIncludes,
  StringPrototypeStartsWith: StringPrototypeStartsWith$1,
} = primordials_1;

const {
  validateObject: validateObject$1,
} = validators;

// These are internal utilities to make the parsing logic easier to read, and
// add lots of detail for the curious. They are in a separate file to allow
// unit testing, although that is not essential (this could be rolled into
// main file and just tested implicitly via API).
//
// These routines are for internal use, not for export to client.

/**
 * Return the named property, but only if it is an own property.
 */
function objectGetOwn$1(obj, prop) {
  if (ObjectHasOwn$1(obj, prop))
    return obj[prop];
}

/**
 * Return the named options property, but only if it is an own property.
 */
function optionsGetOwn$1(options, longOption, prop) {
  if (ObjectHasOwn$1(options, longOption))
    return objectGetOwn$1(options[longOption], prop);
}

/**
 * Determines if the argument may be used as an option value.
 * @example
 * isOptionValue('V') // returns true
 * isOptionValue('-v') // returns true (greedy)
 * isOptionValue('--foo') // returns true (greedy)
 * isOptionValue(undefined) // returns false
 */
function isOptionValue$1(value) {
  if (value == null) return false;

  // Open Group Utility Conventions are that an option-argument
  // is the argument after the option, and may start with a dash.
  return true; // greedy!
}

/**
 * Detect whether there is possible confusion and user may have omitted
 * the option argument, like `--port --verbose` when `port` of type:string.
 * In strict mode we throw errors if value is option-like.
 */
function isOptionLikeValue$1(value) {
  if (value == null) return false;

  return value.length > 1 && StringPrototypeCharAt$1(value, 0) === '-';
}

/**
 * Determines if `arg` is just a short option.
 * @example '-f'
 */
function isLoneShortOption$1(arg) {
  return arg.length === 2 &&
    StringPrototypeCharAt$1(arg, 0) === '-' &&
    StringPrototypeCharAt$1(arg, 1) !== '-';
}

/**
 * Determines if `arg` is a lone long option.
 * @example
 * isLoneLongOption('a') // returns false
 * isLoneLongOption('-a') // returns false
 * isLoneLongOption('--foo') // returns true
 * isLoneLongOption('--foo=bar') // returns false
 */
function isLoneLongOption$1(arg) {
  return arg.length > 2 &&
    StringPrototypeStartsWith$1(arg, '--') &&
    !StringPrototypeIncludes(arg, '=', 3);
}

/**
 * Determines if `arg` is a long option and value in the same argument.
 * @example
 * isLongOptionAndValue('--foo') // returns false
 * isLongOptionAndValue('--foo=bar') // returns true
 */
function isLongOptionAndValue$1(arg) {
  return arg.length > 2 &&
    StringPrototypeStartsWith$1(arg, '--') &&
    StringPrototypeIncludes(arg, '=', 3);
}

/**
 * Determines if `arg` is a short option group.
 *
 * See Guideline 5 of the [Open Group Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html).
 *   One or more options without option-arguments, followed by at most one
 *   option that takes an option-argument, should be accepted when grouped
 *   behind one '-' delimiter.
 * @example
 * isShortOptionGroup('-a', {}) // returns false
 * isShortOptionGroup('-ab', {}) // returns true
 * // -fb is an option and a value, not a short option group
 * isShortOptionGroup('-fb', {
 *   options: { f: { type: 'string' } }
 * }) // returns false
 * isShortOptionGroup('-bf', {
 *   options: { f: { type: 'string' } }
 * }) // returns true
 * // -bfb is an edge case, return true and caller sorts it out
 * isShortOptionGroup('-bfb', {
 *   options: { f: { type: 'string' } }
 * }) // returns true
 */
function isShortOptionGroup$1(arg, options) {
  if (arg.length <= 2) return false;
  if (StringPrototypeCharAt$1(arg, 0) !== '-') return false;
  if (StringPrototypeCharAt$1(arg, 1) === '-') return false;

  const firstShort = StringPrototypeCharAt$1(arg, 1);
  const longOption = findLongOptionForShort$1(firstShort, options);
  return optionsGetOwn$1(options, longOption, 'type') !== 'string';
}

/**
 * Determine if arg is a short string option followed by its value.
 * @example
 * isShortOptionAndValue('-a', {}); // returns false
 * isShortOptionAndValue('-ab', {}); // returns false
 * isShortOptionAndValue('-fFILE', {
 *   options: { foo: { short: 'f', type: 'string' }}
 * }) // returns true
 */
function isShortOptionAndValue$1(arg, options) {
  validateObject$1(options, 'options');

  if (arg.length <= 2) return false;
  if (StringPrototypeCharAt$1(arg, 0) !== '-') return false;
  if (StringPrototypeCharAt$1(arg, 1) === '-') return false;

  const shortOption = StringPrototypeCharAt$1(arg, 1);
  const longOption = findLongOptionForShort$1(shortOption, options);
  return optionsGetOwn$1(options, longOption, 'type') === 'string';
}

/**
 * Find the long option associated with a short option. Looks for a configured
 * `short` and returns the short option itself if a long option is not found.
 * @example
 * findLongOptionForShort('a', {}) // returns 'a'
 * findLongOptionForShort('b', {
 *   options: { bar: { short: 'b' } }
 * }) // returns 'bar'
 */
function findLongOptionForShort$1(shortOption, options) {
  validateObject$1(options, 'options');
  const longOptionEntry = ArrayPrototypeFind(
    ObjectEntries$1(options),
    ({ 1: optionConfig }) => objectGetOwn$1(optionConfig, 'short') === shortOption
  );
  return longOptionEntry?.[0] ?? shortOption;
}

/**
 * Check if the given option includes a default value
 * and that option has not been set by the input args.
 *
 * @param {string} longOption - long option name e.g. 'foo'
 * @param {object} optionConfig - the option configuration properties
 * @param {object} values - option values returned in `values` by parseArgs
 */
function useDefaultValueOption$1(longOption, optionConfig, values) {
  return objectGetOwn$1(optionConfig, 'default') !== undefined &&
    values[longOption] === undefined;
}

var utils = {
  findLongOptionForShort: findLongOptionForShort$1,
  isLoneLongOption: isLoneLongOption$1,
  isLoneShortOption: isLoneShortOption$1,
  isLongOptionAndValue: isLongOptionAndValue$1,
  isOptionValue: isOptionValue$1,
  isOptionLikeValue: isOptionLikeValue$1,
  isShortOptionAndValue: isShortOptionAndValue$1,
  isShortOptionGroup: isShortOptionGroup$1,
  useDefaultValueOption: useDefaultValueOption$1,
  objectGetOwn: objectGetOwn$1,
  optionsGetOwn: optionsGetOwn$1,
};

const {
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeUnshiftApply,
  ObjectEntries,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
  StringPrototypeCharAt,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
} = primordials_1;

const {
  validateArray,
  validateBoolean,
  validateBooleanArray,
  validateObject,
  validateString,
  validateStringArray,
  validateUnion,
} = validators;

const {
  kEmptyObject,
} = util;

const {
  findLongOptionForShort,
  isLoneLongOption,
  isLoneShortOption,
  isLongOptionAndValue,
  isOptionValue,
  isOptionLikeValue,
  isShortOptionAndValue,
  isShortOptionGroup,
  useDefaultValueOption,
  objectGetOwn,
  optionsGetOwn,
} = utils;

const {
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_PARSE_ARGS_INVALID_OPTION_VALUE,
    ERR_PARSE_ARGS_UNKNOWN_OPTION,
    ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL,
  },
} = errors;

function getMainArgs() {
  // Work out where to slice process.argv for user supplied arguments.

  // Check node options for scenarios where user CLI args follow executable.
  const execArgv = process.execArgv;
  if (ArrayPrototypeIncludes(execArgv, '-e') ||
      ArrayPrototypeIncludes(execArgv, '--eval') ||
      ArrayPrototypeIncludes(execArgv, '-p') ||
      ArrayPrototypeIncludes(execArgv, '--print')) {
    return ArrayPrototypeSlice(process.argv, 1);
  }

  // Normally first two arguments are executable and script, then CLI arguments
  return ArrayPrototypeSlice(process.argv, 2);
}

/**
 * In strict mode, throw for possible usage errors like --foo --bar
 *
 * @param {object} token - from tokens as available from parseArgs
 */
function checkOptionLikeValue(token) {
  if (!token.inlineValue && isOptionLikeValue(token.value)) {
    // Only show short example if user used short option.
    const example = StringPrototypeStartsWith(token.rawName, '--') ?
      `'${token.rawName}=-XYZ'` :
      `'--${token.name}=-XYZ' or '${token.rawName}-XYZ'`;
    const errorMessage = `Option '${token.rawName}' argument is ambiguous.
Did you forget to specify the option argument for '${token.rawName}'?
To specify an option argument starting with a dash use ${example}.`;
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(errorMessage);
  }
}

/**
 * In strict mode, throw for usage errors.
 *
 * @param {object} config - from config passed to parseArgs
 * @param {object} token - from tokens as available from parseArgs
 */
function checkOptionUsage(config, token) {
  if (!ObjectHasOwn(config.options, token.name)) {
    throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(
      token.rawName, config.allowPositionals);
  }

  const short = optionsGetOwn(config.options, token.name, 'short');
  const shortAndLong = `${short ? `-${short}, ` : ''}--${token.name}`;
  const type = optionsGetOwn(config.options, token.name, 'type');
  if (type === 'string' && typeof token.value !== 'string') {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong} <value>' argument missing`);
  }
  // (Idiomatic test for undefined||null, expecting undefined.)
  if (type === 'boolean' && token.value != null) {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong}' does not take an argument`);
  }
}


/**
 * Store the option value in `values`.
 *
 * @param {string} longOption - long option name e.g. 'foo'
 * @param {string|undefined} optionValue - value from user args
 * @param {object} options - option configs, from parseArgs({ options })
 * @param {object} values - option values returned in `values` by parseArgs
 */
function storeOption(longOption, optionValue, options, values) {
  if (longOption === '__proto__') {
    return; // No. Just no.
  }

  // We store based on the option value rather than option type,
  // preserving the users intent for author to deal with.
  const newValue = optionValue ?? true;
  if (optionsGetOwn(options, longOption, 'multiple')) {
    // Always store value in array, including for boolean.
    // values[longOption] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    // (note: values has null prototype, so simpler usage)
    if (values[longOption]) {
      ArrayPrototypePush(values[longOption], newValue);
    } else {
      values[longOption] = [newValue];
    }
  } else {
    values[longOption] = newValue;
  }
}

/**
 * Store the default option value in `values`.
 *
 * @param {string} longOption - long option name e.g. 'foo'
 * @param {string
 *         | boolean
 *         | string[]
 *         | boolean[]} optionValue - default value from option config
 * @param {object} values - option values returned in `values` by parseArgs
 */
function storeDefaultOption(longOption, optionValue, values) {
  if (longOption === '__proto__') {
    return; // No. Just no.
  }

  values[longOption] = optionValue;
}

/**
 * Process args and turn into identified tokens:
 * - option (along with value, if any)
 * - positional
 * - option-terminator
 *
 * @param {string[]} args - from parseArgs({ args }) or mainArgs
 * @param {object} options - option configs, from parseArgs({ options })
 */
function argsToTokens(args, options) {
  const tokens = [];
  let index = -1;
  let groupCount = 0;

  const remainingArgs = ArrayPrototypeSlice(args);
  while (remainingArgs.length > 0) {
    const arg = ArrayPrototypeShift(remainingArgs);
    const nextArg = remainingArgs[0];
    if (groupCount > 0)
      groupCount--;
    else
      index++;

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      ArrayPrototypePush(tokens, { kind: 'option-terminator', index });
      ArrayPrototypePushApply(
        tokens, ArrayPrototypeMap(remainingArgs, (arg) => {
          return { kind: 'positional', index: ++index, value: arg };
        })
      );
      break; // Finished processing args, leave while loop.
    }

    if (isLoneShortOption(arg)) {
      // e.g. '-f'
      const shortOption = StringPrototypeCharAt(arg, 1);
      const longOption = findLongOptionForShort(shortOption, options);
      let value;
      let inlineValue;
      if (optionsGetOwn(options, longOption, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '-f', 'bar'
        value = ArrayPrototypeShift(remainingArgs);
        inlineValue = false;
      }
      ArrayPrototypePush(
        tokens,
        { kind: 'option', name: longOption, rawName: arg,
          index, value, inlineValue });
      if (value != null) ++index;
      continue;
    }

    if (isShortOptionGroup(arg, options)) {
      // Expand -fXzy to -f -X -z -y
      const expanded = [];
      for (let index = 1; index < arg.length; index++) {
        const shortOption = StringPrototypeCharAt(arg, index);
        const longOption = findLongOptionForShort(shortOption, options);
        if (optionsGetOwn(options, longOption, 'type') !== 'string' ||
          index === arg.length - 1) {
          // Boolean option, or last short in group. Well formed.
          ArrayPrototypePush(expanded, `-${shortOption}`);
        } else {
          // String option in middle. Yuck.
          // Expand -abfFILE to -a -b -fFILE
          ArrayPrototypePush(expanded, `-${StringPrototypeSlice(arg, index)}`);
          break; // finished short group
        }
      }
      ArrayPrototypeUnshiftApply(remainingArgs, expanded);
      groupCount = expanded.length;
      continue;
    }

    if (isShortOptionAndValue(arg, options)) {
      // e.g. -fFILE
      const shortOption = StringPrototypeCharAt(arg, 1);
      const longOption = findLongOptionForShort(shortOption, options);
      const value = StringPrototypeSlice(arg, 2);
      ArrayPrototypePush(
        tokens,
        { kind: 'option', name: longOption, rawName: `-${shortOption}`,
          index, value, inlineValue: true });
      continue;
    }

    if (isLoneLongOption(arg)) {
      // e.g. '--foo'
      const longOption = StringPrototypeSlice(arg, 2);
      let value;
      let inlineValue;
      if (optionsGetOwn(options, longOption, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '--foo', 'bar'
        value = ArrayPrototypeShift(remainingArgs);
        inlineValue = false;
      }
      ArrayPrototypePush(
        tokens,
        { kind: 'option', name: longOption, rawName: arg,
          index, value, inlineValue });
      if (value != null) ++index;
      continue;
    }

    if (isLongOptionAndValue(arg)) {
      // e.g. --foo=bar
      const equalIndex = StringPrototypeIndexOf(arg, '=');
      const longOption = StringPrototypeSlice(arg, 2, equalIndex);
      const value = StringPrototypeSlice(arg, equalIndex + 1);
      ArrayPrototypePush(
        tokens,
        { kind: 'option', name: longOption, rawName: `--${longOption}`,
          index, value, inlineValue: true });
      continue;
    }

    ArrayPrototypePush(tokens, { kind: 'positional', index, value: arg });
  }

  return tokens;
}

const parseArgs = (config = kEmptyObject) => {
  const args = objectGetOwn(config, 'args') ?? getMainArgs();
  const strict = objectGetOwn(config, 'strict') ?? true;
  const allowPositionals = objectGetOwn(config, 'allowPositionals') ?? !strict;
  const returnTokens = objectGetOwn(config, 'tokens') ?? false;
  const options = objectGetOwn(config, 'options') ?? { __proto__: null };
  // Bundle these up for passing to strict-mode checks.
  const parseConfig = { args, strict, options, allowPositionals };

  // Validate input configuration.
  validateArray(args, 'args');
  validateBoolean(strict, 'strict');
  validateBoolean(allowPositionals, 'allowPositionals');
  validateBoolean(returnTokens, 'tokens');
  validateObject(options, 'options');
  ArrayPrototypeForEach(
    ObjectEntries(options),
    ({ 0: longOption, 1: optionConfig }) => {
      validateObject(optionConfig, `options.${longOption}`);

      // type is required
      const optionType = objectGetOwn(optionConfig, 'type');
      validateUnion(optionType, `options.${longOption}.type`, ['string', 'boolean']);

      if (ObjectHasOwn(optionConfig, 'short')) {
        const shortOption = optionConfig.short;
        validateString(shortOption, `options.${longOption}.short`);
        if (shortOption.length !== 1) {
          throw new ERR_INVALID_ARG_VALUE(
            `options.${longOption}.short`,
            shortOption,
            'must be a single character'
          );
        }
      }

      const multipleOption = objectGetOwn(optionConfig, 'multiple');
      if (ObjectHasOwn(optionConfig, 'multiple')) {
        validateBoolean(multipleOption, `options.${longOption}.multiple`);
      }

      const defaultValue = objectGetOwn(optionConfig, 'default');
      if (defaultValue !== undefined) {
        let validator;
        switch (optionType) {
          case 'string':
            validator = multipleOption ? validateStringArray : validateString;
            break;

          case 'boolean':
            validator = multipleOption ? validateBooleanArray : validateBoolean;
            break;
        }
        validator(defaultValue, `options.${longOption}.default`);
      }
    }
  );

  // Phase 1: identify tokens
  const tokens = argsToTokens(args, options);

  // Phase 2: process tokens into parsed option values and positionals
  const result = {
    values: { __proto__: null },
    positionals: [],
  };
  if (returnTokens) {
    result.tokens = tokens;
  }
  ArrayPrototypeForEach(tokens, (token) => {
    if (token.kind === 'option') {
      if (strict) {
        checkOptionUsage(parseConfig, token);
        checkOptionLikeValue(token);
      }
      storeOption(token.name, token.value, options, result.values);
    } else if (token.kind === 'positional') {
      if (!allowPositionals) {
        throw new ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL(token.value);
      }
      ArrayPrototypePush(result.positionals, token.value);
    }
  });

  // Phase 3: fill in default values for missing args
  ArrayPrototypeForEach(ObjectEntries(options), ({ 0: longOption,
                                                   1: optionConfig }) => {
    const mustSetDefault = useDefaultValueOption(longOption,
                                                 optionConfig,
                                                 result.values);
    if (mustSetDefault) {
      storeDefaultOption(longOption,
                         objectGetOwn(optionConfig, 'default'),
                         result.values);
    }
  });


  return result;
};

var parseargs = {
  parseArgs,
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var SimpleArgParser = {
  name: "simple-parser",
  async process(ctx, spec) {
    console.log({
      ...spec,
      args: ctx.locals.args,
    });

    // Insert standard options
    spec.options = Object.assign(spec.options || {}, DEFAULT_OPTIONS);

    let result;
    try {
      if (!ctx.locals.args) debugger;
      result = parseargs.parseArgs({ ...spec, args: ctx.locals.args });
    } catch (e) {
      await ctx.externs.out.write(
        "\x1B[31;1m" + "error parsing arguments: " + e.message + "\x1B[0m\n",
      );
      ctx.cmdExecState.valid = false;
      return;
    }

    if (result.values.help) {
      ctx.cmdExecState.printHelpAndExit = true;
    }

    ctx.locals.values = result.values;
    ctx.locals.positionals = result.positionals;
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var ErrorsDecorator = {
  name: "errors",
  decorate(fn, { command, ctx }) {
    return async (...a) => {
      try {
        await fn(...a);
      } catch (e) {
        console.log("GOT IT HERE");
        // message without "Error:"
        let message = e.message;
        if (message.startsWith("Error: ")) {
          message = message.slice(7);
        }
        ctx.externs.err.write(
          "\x1B[31;1m" + command.name + ": " + message + "\x1B[0m\n",
        );
      }
    };
  },
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * An error for which the location it occurred within the input is known.
 */
class ConcreteSyntaxError extends Error {
  constructor(message, cst_location) {
    super(message);
    this.cst_location = cst_location;
  }

  /**
   * Prints the location of the error in the input.
   *
   * Example output:
   *
   * ```
   * 1: echo $($(echo zxcv))
   *           ^^^^^^^^^^^
   * ```
   *
   * @param {*} input
   */
  print_here(input) {
    const lines = input.split("\n");
    const line = lines[this.cst_location.line];
    const str_line_number = String(this.cst_location.line + 1) + ": ";
    const n_spaces = str_line_number.length + this.cst_location.start;
    const n_arrows = Math.max(
      this.cst_location.end - this.cst_location.start,
      1,
    );

    return (
      str_line_number +
      line +
      "\n" +
      " ".repeat(n_spaces) +
      "^".repeat(n_arrows)
    );
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class MultiWriter {
  constructor({ delegates }) {
    this.delegates = delegates;
  }

  async write(item) {
    for (const delegate of this.delegates) {
      await delegate.write(item);
    }
  }

  async close() {
    for (const delegate of this.delegates) {
      await delegate.close();
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class Coupler {
  static description = `
        Connects a read stream to a write stream.
        Does not close the write stream when the read stream is closed.
    `;

  constructor(source, target) {
    this.source = source;
    this.target = target;
    this.on_ = true;
    this.isDone = new Promise((rslv) => {
      this.resolveIsDone = rslv;
    });
    this.listenLoop_();
  }

  off() {
    this.on_ = false;
  }
  on() {
    this.on_ = true;
  }

  async listenLoop_() {
    this.active = true;
    for (;;) {
      const { value, done } = await this.source.read();
      if (done) {
        this.source = null;
        this.target = null;
        this.active = false;
        this.resolveIsDone();
        break;
      }
      if (this.on_) {
        await this.target.write(value);
      }
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class Pipe {
  constructor() {
    this.readableStream = new ReadableStream({
      start: (controller) => {
        this.readController = controller;
      },
      close: () => {
        this.writableController.close();
      },
    });
    this.writableStream = new WritableStream({
      start: (controller) => {
        this.writableController = controller;
      },
      write: (item) => {
        this.readController.enqueue(item);
      },
      close: () => {
        this.readController.close();
      },
    });
    this.in = this.writableStream.getWriter();
    this.out = this.readableStream.getReader();
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class ProxyReader {
  constructor({ delegate }) {
    this.delegate = delegate;
  }

  read(...a) {
    return this.delegate.read(...a);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const decoder$2 = new TextDecoder();

class SyncLinesReader extends ProxyReader {
  constructor(...a) {
    super(...a);
    this.lines = [];
    this.fragment = "";
  }
  async read(opt_buffer) {
    if (opt_buffer) {
      // Line sync contradicts buffered reads
      return await this.delegate.read(opt_buffer);
    }

    return await this.readNextLine_();
  }
  async readNextLine_() {
    if (this.lines.length > 0) {
      return { value: this.lines.shift() };
    }

    for (;;) {
      // CHECK: this might read once more after done; is that ok?
      let { value, done } = await this.delegate.read();

      if (value instanceof Uint8Array) {
        value = decoder$2.decode(value);
      }

      if (done) {
        if (this.fragment.length === 0) {
          return { value, done };
        }

        value = this.fragment;
        this.fragment = "";
        return { value };
      }

      if (!value.match(/\n|\r|\r\n/)) {
        this.fragment += value;
        continue;
      }

      // Guaranteed to be 2 items, because value includes a newline
      const lines = value.split(/\n|\r|\r\n/);

      // The first line continues from the existing fragment
      const firstLine = this.fragment + lines.shift();
      // The last line is incomplete, and goes on the fragment
      this.fragment = lines.pop();

      // Any lines between are enqueued for subsequent reads,
      // and they include a line-feed character.
      this.lines.push(...lines.map((txt) => txt + "\n"));

      return { value: firstLine + "\n" };
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class ProxyWriter {
  constructor({ delegate }) {
    this.delegate = delegate;
  }

  write(...a) {
    return this.delegate.write(...a);
  }
  close(...a) {
    return this.delegate.close(...a);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const encoder$4 = new TextEncoder();

class ByteWriter extends ProxyWriter {
  async write(item) {
    if (typeof item === "string") {
      item = encoder$4.encode(item);
    }
    if (item instanceof Blob) {
      item = new Uint8Array(await item.arrayBuffer());
    }
    await this.delegate.write(item);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class CommandStdinDecorator {
  constructor(rs) {
    this.rs = rs;
  }
  async read(...a) {
    return await this.rs.read(...a);
  }

  // utility methods
  async collect() {
    const items = [];
    for (;;) {
      const { value, done } = await this.rs.read();
      if (done) return items;
      items.push(value);
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class MemReader {
  constructor(data) {
    this.data = data;
    this.pos = 0;
  }
  async read(opt_buffer) {
    if (this.pos >= this.data.length) {
      return { done: true };
    }

    if (!opt_buffer) {
      this.pos = this.data.length;
      return { value: this.data, done: false };
    }

    const toReturn = this.data.slice(
      this.pos,
      Math.min(this.pos + opt_buffer.length, this.data.length),
    );

    return {
      value: opt_buffer,
      size: toReturn.length,
    };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const encoder$3 = new TextEncoder();

class MemWriter {
  constructor() {
    this.items = [];
  }
  async write(item) {
    this.items.push(item);
  }
  async close() {}

  getAsUint8Array() {
    const uint8arrays = [];
    for (let item of this.items) {
      if (typeof item === "string") {
        item = encoder$3.encode(item);
      }

      if (!(item instanceof Uint8Array)) {
        throw new Error("could not convert to Uint8Array");
      }

      uint8arrays.push(item);
    }

    const outputUint8Array = new Uint8Array(
      uint8arrays.reduce((sum, item) => sum + item.length, 0),
    );

    let pos = 0;
    for (const item of uint8arrays) {
      outputUint8Array.set(item, pos);
      pos += item.length;
    }

    return outputUint8Array;
  }

  getAsBlob() {
    // If there is just one item and it's a blob, return it
    if (this.items.length === 1 && this.items[0] instanceof Blob) {
      return this.items[0];
    }

    const uint8array = this.getAsUint8Array();
    return new Blob([uint8array]);
  }

  getAsString() {
    return new TextDecoder().decode(this.getAsUint8Array());
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class NullifyWriter extends ProxyWriter {
  async write(item) {
    // NOOP
  }

  async close() {
    await this.delegate.close();
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const encoder$2 = new TextEncoder();

class SignalReader extends ProxyReader {
  constructor({ sig, ...kv }, ...a) {
    super({ ...kv }, ...a);
    this.sig = sig;
  }

  async read(opt_buffer) {
    const mapping = [
      [ANSIContext.constants.CHAR_ETX, signals.SIGINT],
      [ANSIContext.constants.CHAR_EOT, signals.SIGQUIT],
    ];

    let { value, done } = await this.delegate.read(opt_buffer);

    if (value === undefined) {
      return { value, done };
    }

    const tmp_value = value;

    if ((!tmp_value) instanceof Uint8Array) {
      tmp_value = encoder$2.encode(value);
    }

    // show hex for debugging
    // console.log(value.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));
    console.log("value??", value);

    for (const [key, signal] of mapping) {
      if (tmp_value.includes(key)) {
        // this.sig.emit(signal);
        // if ( signal === signals.SIGQUIT ) {
        return { done: true };
        // }
      }
    }

    return { value, done };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class Token {
  static createFromAST(ctx, ast) {
    if (ast.$ !== "token") {
      throw new Error("expected token node");
    }

    console.log("ast has cst?", ast, ast.components?.[0]?.$cst);

    return new Token(ast);
  }
  constructor(ast) {
    this.ast = ast;
    this.$cst = ast.components?.[0]?.$cst;
  }
  maybeStaticallyResolve(ctx) {
    // If the only components are of type 'symbol' and 'string.segment'
    // then we can statically resolve the value of the token.

    console.log("checking viability of static resolve", this.ast);

    const isStatic = this.ast.components.every((c) => {
      return c.$ === "symbol" || c.$ === "string.segment";
    });

    if (!isStatic) return;

    console.log("doing static thing", this.ast);

    // TODO: Variables can also be statically resolved, I think...
    let value = "";
    for (const component of this.ast.components) {
      console.log("component", component);
      value += component.text;
    }

    return value;
  }

  async resolve(ctx) {
    let value = "";
    for (const component of this.ast.components) {
      if (component.$ === "string.segment" || component.$ === "symbol") {
        value += component.text;
        continue;
      }
      if (component.$ === "pipeline") {
        const pipeline = await Pipeline.createFromAST(ctx, component);
        const memWriter = new MemWriter();
        const cmdCtx = { externs: { out: memWriter } };
        const subCtx = ctx.sub(cmdCtx);
        await pipeline.execute(subCtx);
        value += memWriter.getAsString().trimEnd();
        continue;
      }
    }
    // const name_subst = await PreparedCommand.createFromAST(this.ctx, command);
    // const memWriter = new MemWriter();
    // const cmdCtx = { externs: { out: memWriter } }
    // const ctx = this.ctx.sub(cmdCtx);
    // name_subst.setContext(ctx);
    // await name_subst.execute();
    // const cmd = memWriter.getAsString().trimEnd();
    return value;
  }
}

class PreparedCommand {
  static async createFromAST(ctx, ast) {
    if (ast.$ !== "command") {
      throw new Error("expected command node");
    }

    ast = { ...ast };
    const command_token = Token.createFromAST(ctx, ast.tokens.shift());

    // TODO: check that node for command name is of a
    //       supported type - maybe use adapt pattern
    console.log("ast?", ast);
    const cmd = command_token.maybeStaticallyResolve(ctx);

    ctx.registries;
    const { commandProvider } = ctx.externs;

    const command = cmd
      ? await commandProvider.lookup(cmd, { ctx })
      : command_token;

    if (command === undefined) {
      console.log("command token?", command_token);
      throw new ConcreteSyntaxError(
        `no command: ${JSON.stringify(cmd)}`,
        command_token.$cst,
      );
    }

    // TODO: test this
    console.log("ast?", ast);
    const inputRedirect =
      ast.inputRedirects.length > 0
        ? (() => {
            const token = Token.createFromAST(ctx, ast.inputRedirects[0]);
            return token.maybeStaticallyResolve(ctx) ?? token;
          })()
        : null;
    // TODO: test this
    const outputRedirects = ast.outputRedirects.map((rdirNode) => {
      const token = Token.createFromAST(ctx, rdirNode);
      return token.maybeStaticallyResolve(ctx) ?? token;
    });

    return new PreparedCommand({
      command,
      args: ast.tokens.map((node) => Token.createFromAST(ctx, node)),
      // args: ast.args.map(node => node.text),
      inputRedirect,
      outputRedirects,
    });
  }

  constructor({ command, args, inputRedirect, outputRedirects }) {
    this.command = command;
    this.args = args;
    this.inputRedirect = inputRedirect;
    this.outputRedirects = outputRedirects;
  }

  setContext(ctx) {
    this.ctx = ctx;
  }

  async execute() {
    let { command, args } = this;

    // If we have an AST node of type `command` it means we
    // need to run that command to get the name of the
    // command to run.
    if (command instanceof Token) {
      const cmd = await command.resolve(this.ctx);
      console.log("RUNNING CMD?", cmd);
      const { commandProvider } = this.ctx.externs;
      command = await commandProvider.lookup(cmd, { ctx: this.ctx });
      if (command === undefined) {
        throw new Error("no command: " + JSON.stringify(cmd));
      }
    }

    args = await Promise.all(
      args.map(async (node) => {
        if (node instanceof Token) {
          return await node.resolve(this.ctx);
        }

        return node.text;
      }),
    );

    const { argparsers } = this.ctx.registries;
    const { decorators } = this.ctx.registries;

    let in_ = this.ctx.externs.in_;
    if (this.inputRedirect) {
      const { filesystem } = this.ctx.platform;
      const dest_path =
        this.inputRedirect instanceof Token
          ? await this.inputRedirect.resolve(this.ctx)
          : this.inputRedirect;
      const response = await filesystem.read(
        resolveRelativePath(this.ctx.vars, dest_path),
      );
      in_ = new MemReader(response);
    }

    // simple naive implementation for now
    const sig = {
      listeners_: [],
      emit(signal) {
        for (const listener of this.listeners_) {
          listener(signal);
        }
      },
      on(listener) {
        this.listeners_.push(listener);
      },
    };

    in_ = new SignalReader({ delegate: in_, sig });

    if (command.input?.syncLines) {
      in_ = new SyncLinesReader({ delegate: in_ });
    }
    in_ = new CommandStdinDecorator(in_);

    let out = this.ctx.externs.out;
    const outputMemWriters = [];
    if (this.outputRedirects.length > 0) {
      for (let i = 0; i < this.outputRedirects.length; i++) {
        outputMemWriters.push(new MemWriter());
      }
      out = new NullifyWriter({ delegate: out });
      out = new MultiWriter({
        delegates: [...outputMemWriters, out],
      });
    }

    const ctx = this.ctx.sub({
      externs: {
        in_,
        out,
        sig,
      },
      cmdExecState: {
        valid: true,
        printHelpAndExit: false,
      },
      locals: {
        command,
        args,
      },
    });

    if (command.args) {
      const argProcessorId = command.args.$;
      const argProcessor = argparsers[argProcessorId];
      const spec = { ...command.args };
      delete spec.$;
      await argProcessor.process(ctx, spec);
    }

    if (!ctx.cmdExecState.valid) {
      ctx.locals.exit = -1;
      await ctx.externs.out.close();
      return;
    }

    if (ctx.cmdExecState.printHelpAndExit) {
      ctx.locals.exit = 0;
      await printUsage(command, ctx.externs.out, ctx.vars);
      await ctx.externs.out.close();
      return;
    }

    let execute = command.execute.bind(command);
    if (command.decorators) {
      for (const decoratorId in command.decorators) {
        const params = command.decorators[decoratorId];
        const decorator = decorators[decoratorId];
        execute = decorator.decorate(execute, {
          command,
          params,
          ctx,
        });
      }
    }
    try {
      await execute(ctx);
    } catch (e) {
      if (e instanceof Exit) {
        e.code;
      } else if (e.code) {
        await ctx.externs.err.write(
          "\x1B[31;1m" + command.name + ": " + e.message + "\x1B[0m\n",
        );
      } else {
        await ctx.externs.err.write(
          "\x1B[31;1m" + command.name + ": " + e.toString() + "\x1B[0m\n",
        );
        ctx.locals.exit = -1;
      }
    }

    // ctx.externs.in?.close?.();
    // ctx.externs.out?.close?.();
    ctx.externs.out.close();

    // TODO: need write command from puter-shell before this can be done
    for (let i = 0; i < this.outputRedirects.length; i++) {
      console.log("output redirect??", this.outputRedirects[i]);
      const { filesystem } = this.ctx.platform;
      const outputRedirect = this.outputRedirects[i];
      const dest_path =
        outputRedirect instanceof Token
          ? await outputRedirect.resolve(this.ctx)
          : outputRedirect;
      const path = resolveRelativePath(ctx.vars, dest_path);
      console.log("it should work?", {
        path,
        outputMemWriters,
      });
      // TODO: error handling here

      await filesystem.write(path, outputMemWriters[i].getAsBlob());
    }

    console.log("OUTPUT WRITERS", outputMemWriters);
  }
}

class Pipeline {
  static async createFromAST(ctx, ast) {
    if (ast.$ !== "pipeline") {
      throw new Error("expected pipeline node");
    }

    const preparedCommands = [];

    for (const cmdNode of ast.commands) {
      const command = await PreparedCommand.createFromAST(ctx, cmdNode);
      preparedCommands.push(command);
    }

    return new Pipeline({ preparedCommands });
  }
  constructor({ preparedCommands }) {
    this.preparedCommands = preparedCommands;
  }
  async execute(ctx) {
    const preparedCommands = this.preparedCommands;

    let nextIn = ctx.externs.in;
    let lastPipe = null;

    // TOOD: this will eventually defer piping of certain
    //       sub-pipelines to the Puter Shell.

    for (let i = 0; i < preparedCommands.length; i++) {
      const command = preparedCommands[i];

      // if ( command.command.input?.syncLines ) {
      //     nextIn = new SyncLinesReader({ delegate: nextIn });
      // }

      const cmdCtx = { externs: { in_: nextIn } };

      const pipe = new Pipe();
      lastPipe = pipe;
      let cmdOut = pipe.in;
      cmdOut = new ByteWriter({ delegate: cmdOut });
      cmdCtx.externs.out = cmdOut;
      cmdCtx.externs.commandProvider = ctx.externs.commandProvider;
      nextIn = pipe.out;

      // TODO: need to consider redirect from out to err
      cmdCtx.externs.err = ctx.externs.out;
      command.setContext(ctx.sub(cmdCtx));
    }

    const coupler = new Coupler(lastPipe.out, ctx.externs.out);

    const commandPromises = [];
    for (let i = preparedCommands.length - 1; i >= 0; i--) {
      const command = preparedCommands[i];
      commandPromises.push(command.execute());
    }
    await Promise.all(commandPromises);
    console.log("PIPELINE DONE");

    await coupler.isDone;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class ANSIShell extends EventTarget {
  constructor(ctx) {
    super();

    this.ctx = ctx;
    this.variables_ = {};
    this.config = ctx.externs.config;

    this.debugFeatures = {};

    const self = this;
    this.variables = new Proxy(this.variables_, {
      get(target, k) {
        return Reflect.get(target, k);
      },
      set(target, k, v) {
        const oldval = target[k];
        const retval = Reflect.set(target, k, v);
        self.dispatchEvent(
          new CustomEvent("shell-var-change", {
            key: k,
            oldValue: oldval,
            newValue: target[k],
          }),
        );
        return retval;
      },
    });

    this.addEventListener("signal.window-resize", (evt) => {
      this.variables.size = evt.detail;
    });

    this.env = {};

    this.initializeReasonableDefaults();
  }

  export_(k, v) {
    if (typeof v === "function") {
      Object.defineProperty(this.env, k, {
        enumerable: true,
        get: v,
      });
      return;
    }
    this.env[k] = v;
  }

  initializeReasonableDefaults() {
    const { env } = this.ctx.platform;
    const home = env.get("HOME");
    const user = env.get("USER");
    this.variables.pwd = home;
    this.variables.home = home;
    this.variables.user = user;

    this.variables.host = env.get("HOSTNAME");

    // Computed values
    Object.defineProperty(this.env, "PWD", {
      enumerable: true,
      get: () => this.variables.pwd,
      set: (v) => (this.variables.pwd = v),
    });
    Object.defineProperty(this.env, "ROWS", {
      enumerable: true,
      get: () => this.variables.size?.rows ?? 0,
    });
    Object.defineProperty(this.env, "COLS", {
      enumerable: true,
      get: () => this.variables.size?.cols ?? 0,
    });

    this.export_("LANG", "en_US.UTF-8");
    this.export_("PS1", "[\\u@puter.com \\w]\\$ ");

    for (const k in env.getEnv()) {
      console.log("setting", k, env.get(k));
      this.export_(k, env.get(k));
    }

    // Default values
    this.export_("HOME", () => this.variables.home);
    this.export_("USER", () => this.variables.user);
    this.export_("TERM", "xterm-256color");
    this.export_("TERM_PROGRAM", "anura-ansi");
    // TODO: determine how localization will affect this
    // TODO: add TERM_PROGRAM_VERSION
    // TODO: add OLDPWD
  }

  async doPromptIteration() {
    if (globalThis.force_eot) {
      this.ctx.externs.process.exit(0);
    }
    const { readline } = this.ctx.externs;
    // DRY: created the same way in runPipeline
    const executionCtx = this.ctx.sub({
      vars: this.variables,
      env: this.env,
      locals: {
        pwd: this.variables.pwd,
      },
    });
    this.ctx.externs.echo.off();
    const input = await readline(
      this.expandPromptString(this.env.PS1),
      executionCtx,
    );
    this.ctx.externs.echo.on();

    if (input.trim() === "") {
      this.ctx.externs.out.write("");
      return;
    }

    // Specially-processed inputs for debug features
    if (input.startsWith("%%%")) {
      this.ctx.externs.out.write("%%%: interpreting as debug instruction\n");
      const [prefix, flag, onOff] = input.split(" ");
      const isOn = onOff === "on" ? true : false;
      this.ctx.externs.out.write(
        `%%%: Setting ${JSON.stringify(flag)} to ` +
          (isOn ? "ON" : "OFF") +
          "\n",
      );
      this.debugFeatures[flag] = isOn;
      return; // don't run as a pipeline
    }

    // TODO: catch here, but errors need to be more structured first
    try {
      await this.runPipeline(input);
    } catch (e) {
      if (e instanceof ConcreteSyntaxError) {
        const here = e.print_here(input);
        this.ctx.externs.out.write(here + "\n");
      }
      this.ctx.externs.out.write("error: " + e.message + "\n");
      console.log(e);
      return;
    }
  }

  readtoken(str) {
    return this.ctx.externs.parser.parseLineForProcessing(str);
  }

  async runPipeline(cmdOrTokens) {
    const tokens =
      typeof cmdOrTokens === "string"
        ? (() => {
            // TODO: move to doPromptIter with better error objects
            try {
              return this.readtoken(cmdOrTokens);
            } catch (e) {
              this.ctx.externs.out.write("error: " + e.message + "\n");
              return;
            }
          })()
        : cmdOrTokens;

    if (tokens.length === 0) return;

    if (tokens.length > 1) {
      // TODO: as exception instead, and more descriptive
      this.ctx.externs.out.write("something went wrong...\n");
      return;
    }

    let ast = tokens[0];

    // Left the code below here (commented) because I think it's
    // interesting; the AST now always has a pipeline at the top
    // level after recent changes to the parser.

    // // wrap an individual command in a pipeline
    // // TODO: should this be done here, or elsewhere?
    // if ( ast.$ === 'command' ) {
    //     ast = {
    //         $: 'pipeline',
    //         components: [ast]
    //     };
    // }

    if (this.debugFeatures["show-ast"]) {
      this.ctx.externs.out.write(
        JSON.stringify(tokens, undefined, "  ") + "\n",
      );
      return;
    }

    const executionCtx = this.ctx.sub({
      vars: this.variables,
      env: this.env,
      locals: {
        pwd: this.variables.pwd,
      },
    });

    const pipeline = await Pipeline.createFromAST(executionCtx, ast);

    await pipeline.execute(executionCtx);
  }

  expandPromptString(str) {
    str = str.replace("\\u", this.variables.user);
    str = str.replace("\\w", this.variables.pwd);
    str = str.replace("\\h", this.variables.host);
    str = str.replace("\\$", "$");
    return str;
  }

  async outputANSI(ctx) {
    await ctx.iterate(async (item) => {
      ctx.externs.out.write(item.name + "\n");
    });
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class ParserRegistry {
  constructor() {
    this.parsers_ = {};
  }
  register(id, parser) {
    this.parsers_[id] = parser;
  }
  get parsers() {
    return this.parsers_;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class DelegatingPStratumImplAPI {
  constructor(facade) {
    this.facade = facade;
  }
  get delegate() {
    return this.facade.delegate;
  }
}

class DelegatingPStratumImplType {
  constructor(facade) {
    this.facade = facade;
  }
  getImplAPI() {
    return new DelegatingPStratumImplAPI(this.facade);
  }
}

class TerminalPStratumImplType {
  getImplAPI() {
    return {};
  }
}

class PStratum {
  constructor(impl) {
    this.impl = impl;

    const implTypeClass =
      this.impl.constructor.TYPE ?? DelegatingPStratumImplType;

    this.implType = new implTypeClass(this);
    this.api = this.implType.getImplAPI();

    this.lookValue = null;
    this.seqNo = 0;

    this.history = [];
    // TODO: make this configurable
    this.historyOn = !this.impl.reach;
  }

  setDelegate(delegate) {
    this.delegate = delegate;
  }

  look() {
    if (this.looking) {
      return this.lookValue;
    }
    this.looking = true;
    this.lookValue = this.impl.next(this.api);
    return this.lookValue;
  }

  next() {
    this.seqNo++;
    let toReturn;
    if (this.looking) {
      this.looking = false;
      toReturn = this.lookValue;
    } else {
      toReturn = this.impl.next(this.api);
    }
    this.history.push(toReturn.value);
    return toReturn;
  }

  fork() {
    const forkImpl = this.impl.fork(this.api);
    const fork = new PStratum(forkImpl);
    // DRY: sync state
    fork.looking = this.looking;
    fork.lookValue = this.lookValue;
    fork.seqNo = this.seqNo;
    fork.history = [...this.history];
    return fork;
  }

  join(friend) {
    // DRY: sync state
    this.looking = friend.looking;
    this.lookValue = friend.lookValue;
    this.seqNo = friend.seqNo;
    this.history = friend.history;
    this.impl.join(this.api, friend.impl);
  }

  reach(start, end) {
    if (this.impl.reach) {
      return this.impl.reach(this.api, start, end);
    }
    if (this.historyOn) {
      return this.history.slice(start, end);
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class Parser {
  constructor({ impl, assign }) {
    this.impl = impl;
    this.assign = assign ?? {};
  }
  parse(lexer) {
    const unadaptedResult = this.impl.parse(lexer);
    const pr =
      unadaptedResult instanceof ParseResult
        ? unadaptedResult
        : new ParseResult(unadaptedResult);
    if (pr.status === ParseResult.VALUE) {
      pr.value = {
        ...pr.value,
        ...this.assign,
      };
    }
    return pr;
  }
}

class ParseResult {
  static UNRECOGNIZED = { name: "unrecognized" };
  static VALUE = { name: "value" };
  static INVALID = { name: "invalid" };
  constructor(value, opt_status) {
    if (value === ParseResult.UNRECOGNIZED || value === ParseResult.INVALID) {
      this.status = value;
      return;
    }
    this.status =
      opt_status ??
      (value === undefined ? ParseResult.UNRECOGNIZED : ParseResult.VALUE);
    this.value = value;
  }
}

class ConcreteSyntaxParserDecorator {
  constructor(delegate) {
    this.delegate = delegate;
  }
  parse(lexer, ...a) {
    const start = lexer.seqNo;
    const result = this.delegate.parse(lexer, ...a);
    if (result.status === ParseResult.VALUE) {
      const end = lexer.seqNo;
      result.value.$cst = { start, end };
    }
    return result;
  }
}

class RememberSourceParserDecorator {
  constructor(delegate) {
    this.delegate = delegate;
  }
  parse(lexer, ...a) {
    const start = lexer.seqNo;
    const result = this.delegate.parse(lexer, ...a);
    if (result.status === ParseResult.VALUE) {
      const end = lexer.seqNo;
      result.value.$source = lexer.reach(start, end);
    }
    return result;
  }
}

class ParserFactory {
  constructor() {
    this.concrete = false;
    this.rememberSource = false;
  }
  decorate(obj) {
    if (this.concrete) {
      obj = new ConcreteSyntaxParserDecorator(obj);
    }
    if (this.rememberSource) {
      obj = new RememberSourceParserDecorator(obj);
    }

    return obj;
  }
  create(cls, parserParams, resultParams) {
    parserParams = parserParams ?? {};

    resultParams = resultParams ?? {};
    resultParams.assign = resultParams.assign ?? {};

    const impl = new cls(parserParams);
    const parser = new Parser({
      impl,
      assign: resultParams.assign,
    });

    // return parser;
    return this.decorate(parser);
  }
}

class SingleParserFactory {
  create() {
    throw new Error("abstract create() must be implemented");
  }
}

class AcceptParserUtil {
  static adapt(parser) {
    if (parser === undefined) return undefined;
    if (parser instanceof SingleParserFactory) {
      parser = parser.create();
    }
    if (!(parser instanceof Parser)) {
      parser = new Parser({ impl: parser });
    }
    return parser;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class WhitespaceParserImpl {
  static meta = {
    inputs: "bytes",
    outputs: "node",
  };
  static data = {
    whitespaceCharCodes: " \r\t".split("").map((chr) => chr.charCodeAt(0)),
  };
  parse(lexer) {
    const { whitespaceCharCodes } = this.constructor.data;

    let text = "";

    for (;;) {
      const { done, value } = lexer.look();
      if (done) break;
      if (!whitespaceCharCodes.includes(value)) break;
      text += String.fromCharCode(value);
      lexer.next();
    }

    if (text.length === 0) return;

    return { $: "whitespace", text };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class ParserConfigDSL extends SingleParserFactory {
  constructor(parserFactory, cls) {
    super();
    this.parserFactory = parserFactory;
    this.cls_ = cls;
    this.parseParams_ = {};
    this.grammarParams_ = {
      assign: {},
    };
  }

  parseParams(obj) {
    Object.assign(this.parseParams_, obj);
    return this;
  }

  assign(obj) {
    Object.assign(this.grammarParams_.assign, obj);
    return this;
  }

  create() {
    return this.parserFactory.create(
      this.cls_,
      this.parseParams_,
      this.grammarParams_,
    );
  }
}

class ParserBuilder {
  constructor({ parserFactory, parserRegistry }) {
    this.parserFactory = parserFactory;
    this.parserRegistry = parserRegistry;
    this.parserAPI_ = null;
  }

  get parserAPI() {
    if (this.parserAPI_) return this.parserAPI_;

    const parserAPI = {};

    const parsers = this.parserRegistry.parsers;
    for (const parserId in parsers) {
      const parserCls = parsers[parserId];
      parserAPI[parserId] = this.createParserFunction(parserCls);
    }

    return (this.parserAPI_ = parserAPI);
  }

  createParserFunction(parserCls) {
    if (parserCls.hasOwnProperty("createFunction")) {
      return parserCls.createFunction({
        parserFactory: this.parserFactory,
      });
    }

    return (params) => {
      const configDSL = new ParserConfigDSL(parserCls);
      configDSL.parseParams(params);
      return configDSL;
    };
  }

  def(def) {
    const a = this.parserAPI;
    return def(a);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const encoder$1 = new TextEncoder();
const decoder$1 = new TextDecoder();

class LiteralParserImpl {
  static meta = {
    inputs: "bytes",
    outputs: "node",
  };
  static createFunction({ parserFactory }) {
    return (value) => {
      const conf = new ParserConfigDSL(parserFactory, this);
      conf.parseParams({ value });
      return conf;
    };
  }
  constructor({ value }) {
    // adapt value
    if (typeof value === "string") {
      value = encoder$1.encode(value);
    }

    if (value.length === 0) {
      throw new Error(
        "tried to construct a LiteralParser with an " +
          "empty value, which could cause infinite " +
          "iteration",
      );
    }

    this.value = value;
  }
  parse(lexer) {
    for (let i = 0; i < this.value.length; i++) {
      let { done, value } = lexer.next();
      if (done) return;
      if (this.value[i] !== value) return;
    }

    const text = decoder$1.decode(this.value);
    return { $: "literal", text };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class StrUntilParserImpl {
  constructor({ stopChars }) {
    this.stopChars = stopChars;
  }
  parse(lexer) {
    let text = "";
    for (;;) {
      console.log("B");
      let { done, value } = lexer.look();

      if (done) break;

      // TODO: doing this strictly one byte at a time
      //       doesn't allow multi-byte stop characters
      if (typeof value === "number") value = String.fromCharCode(value);

      if (this.stopChars.includes(value)) break;

      text += value;
      lexer.next();
    }

    if (text.length === 0) return;

    console.log("test?", text);

    return { $: "until", text };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class SequenceParserImpl {
  static createFunction({ parserFactory }) {
    return (...parsers) => {
      const conf = new ParserConfigDSL(parserFactory, this);
      conf.parseParams({ parsers });
      return conf;
    };
  }
  constructor({ parsers }) {
    this.parsers = parsers.map(AcceptParserUtil.adapt);
  }
  parse(lexer) {
    const results = [];
    for (const parser of this.parsers) {
      const subLexer = lexer.fork();
      const result = parser.parse(subLexer);
      if (result.status === ParseResult.UNRECOGNIZED) {
        return;
      }
      if (result.status === ParseResult.INVALID) {
        // TODO: this is wrong
        return { done: true, value: result };
      }
      lexer.join(subLexer);
      results.push(result.value);
    }

    return { $: "sequence", results };
  }
}

class ChoiceParserImpl {
  static createFunction({ parserFactory }) {
    return (...parsers) => {
      const conf = new ParserConfigDSL(parserFactory, this);
      conf.parseParams({ parsers });
      return conf;
    };
  }
  constructor({ parsers }) {
    this.parsers = parsers.map(AcceptParserUtil.adapt);
  }
  parse(lexer) {
    for (const parser of this.parsers) {
      const subLexer = lexer.fork();
      const result = parser.parse(subLexer);
      if (result.status === ParseResult.UNRECOGNIZED) {
        continue;
      }
      if (result.status === ParseResult.INVALID) {
        // TODO: this is wrong
        return { done: true, value: result };
      }
      lexer.join(subLexer);
      return result.value;
    }

    return;
  }
}

class RepeatParserImpl {
  static createFunction({ parserFactory }) {
    return (delegate) => {
      const conf = new ParserConfigDSL(parserFactory, this);
      conf.parseParams({ delegate });
      return conf;
    };
  }
  constructor({ delegate }) {
    delegate = AcceptParserUtil.adapt(delegate);
    this.delegate = delegate;
  }

  parse(lexer) {
    const results = [];
    for (;;) {
      const subLexer = lexer.fork();
      const result = this.delegate.parse(subLexer);
      if (result.status === ParseResult.UNRECOGNIZED) {
        break;
      }
      if (result.status === ParseResult.INVALID) {
        return { done: true, value: result };
      }
      lexer.join(subLexer);
      results.push(result.value);
    }

    return { $: "repeat", results };
  }
}

class NoneParserImpl {
  static createFunction({ parserFactory }) {
    return () => {
      const conf = new ParserConfigDSL(parserFactory, this);
      return conf;
    };
  }
  parse() {
    return { $: "none", $discard: true };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class BytesPStratumImpl {
  static TYPE = TerminalPStratumImplType;

  constructor(bytes, opt_i) {
    this.bytes = bytes;
    this.i = opt_i ?? 0;
  }
  next() {
    if (this.i === this.bytes.length) {
      return { done: true, value: undefined };
    }

    const i = this.i++;
    return { done: false, value: this.bytes[i] };
  }
  fork() {
    return new BytesPStratumImpl(this.bytes, this.i);
  }
  join(api, forked) {
    this.i = forked.i;
  }
  reach(api, start, end) {
    return this.bytes.slice(start, end);
  }
}

class StringPStratumImpl {
  static TYPE = TerminalPStratumImplType;

  constructor(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.delegate = new BytesPStratumImpl(bytes);
  }
  // DRY: proxy methods
  next(...a) {
    return this.delegate.next(...a);
  }
  fork(...a) {
    return this.delegate.fork(...a);
  }
  join(...a) {
    return this.delegate.join(...a);
  }
  reach(...a) {
    return this.delegate.reach(...a);
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class ContextSwitchingPStratumImpl {
  constructor({ contexts, entry }) {
    this.contexts = { ...contexts };
    for (const key in this.contexts) {
      console.log("parsers?", this.contexts[key]);
      const new_array = [];
      for (const parser of this.contexts[key]) {
        if (parser.hasOwnProperty("transition")) {
          new_array.push({
            ...parser,
            parser: AcceptParserUtil.adapt(parser.parser),
          });
        } else {
          new_array.push(AcceptParserUtil.adapt(parser));
        }
      }
      this.contexts[key] = new_array;
    }
    this.stack = [
      {
        context_name: entry,
      },
    ];
    this.valid = true;

    this.lastvalue = null;
  }
  get stack_top() {
    console.log("stack top?", this.stack[this.stack.length - 1]);
    return this.stack[this.stack.length - 1];
  }
  get current_context() {
    return this.contexts[this.stack_top.context_name];
  }
  next(api) {
    if (!this.valid) return { done: true };
    const lexer = api.delegate;

    const context = this.current_context;
    console.log("context?", context);
    for (const spec of context) {
      {
        const { done, value } = lexer.look();
        this.anti_cycle_i =
          value === this.lastvalue ? (this.anti_cycle_i || 0) + 1 : 0;
        if (this.anti_cycle_i > 30) {
          throw new Error("infinite loop");
        }
        this.lastvalue = value;
        console.log("last value?", value, done);
        if (done) return { done };
      }

      let parser, transition, peek;
      if (spec.hasOwnProperty("parser")) {
        ({ parser, transition, peek } = spec);
      } else {
        parser = spec;
      }

      const subLexer = lexer.fork();
      // console.log('spec?', spec);
      const result = parser.parse(subLexer);
      if (result.status === ParseResult.UNRECOGNIZED) {
        continue;
      }
      if (result.status === ParseResult.INVALID) {
        return { done: true, value: result };
      }
      console.log("RESULT", result, spec);
      if (!peek) lexer.join(subLexer);

      if (transition) {
        console.log("GOT A TRANSITION");
        if (transition.pop) this.stack.pop();
        if (transition.to)
          this.stack.push({
            context_name: transition.to,
          });
      }

      if (result.value.$discard || peek) return this.next(api);

      console.log("PROVIDING VALUE", result.value);
      return { done: false, value: result.value };
    }

    return { done: true, value: "ran out of parsers" };
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class StrataParseFacade {
  static getDefaultParserRegistry() {
    const r = new ParserRegistry();
    r.register("sequence", SequenceParserImpl);
    r.register("choice", ChoiceParserImpl);
    r.register("repeat", RepeatParserImpl);
    r.register("literal", LiteralParserImpl);
    r.register("none", NoneParserImpl);

    return r;
  }
}

class StrataParser {
  constructor() {
    this.strata = [];
    this.error = null;
  }
  add(stratum) {
    if (!(stratum instanceof PStratum)) {
      stratum = new PStratum(stratum);
    }

    // TODO: verify that terminals don't delegate
    // TODO: verify the delegating strata delegate
    if (this.strata.length > 0) {
      const delegate = this.strata[this.strata.length - 1];
      stratum.setDelegate(delegate);
    }

    this.strata.push(stratum);
  }
  next() {
    return this.strata[this.strata.length - 1].next();
  }
  parse() {
    let done, value;
    const result = [];
    for (;;) {
      ({ done, value } = this.strata[this.strata.length - 1].next());
      if (done) break;
      result.push(value);
    }
    if (value) {
      this.error = value;
    }
    return result;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const PARSE_CONSTANTS = {
  list_ws: [" ", "\n", "\t"],
  list_quot: [`"`, `'`],
};

PARSE_CONSTANTS.list_stoptoken = [
  "|",
  ">",
  "<",
  "&",
  "\\",
  "#",
  ";",
  "(",
  ")",
  ...PARSE_CONSTANTS.list_ws,
  ...PARSE_CONSTANTS.list_quot,
];

PARSE_CONSTANTS.escapeSubstitutions = {
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
  '"': '"',
  "'": "'",
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const decoder = new TextDecoder();

class MergeWhitespacePStratumImpl {
  static meta = {
    inputs: "node",
    outputs: "node",
  };
  constructor(tabWidth) {
    this.tabWidth = tabWidth ?? 1;
    this.line = 0;
    this.col = 0;
  }
  countChar(c) {
    if (c === "\n") {
      this.line++;
      this.col = 0;
      return;
    }
    if (c === "\t") {
      this.col += this.tabWidth;
      return;
    }
    if (c === "\r") return;
    this.col++;
  }
  next(api) {
    const lexer = api.delegate;

    for (;;) {
      const { value, done } = lexer.next();
      if (done) return { value, done };

      if (value.$ === "whitespace") {
        for (const c of value.text) {
          this.countChar(c);
        }
        return { value, done: false };
        // continue;
      }

      value.$cst = {
        ...(value.$cst ?? {}),
        line: this.line,
        col: this.col,
      };

      if (value.hasOwnProperty("$source")) {
        let source = value.$source;
        if (source instanceof Uint8Array) {
          source = decoder.decode(source);
        }
        for (let c of source) {
          this.countChar(c);
        }
      } else {
        console.warn("source missing; can't count position");
      }

      return { value, done: false };
    }
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const parserConfigProfiles = {
  syntaxHighlighting: { cst: true },
  interpreting: { cst: false },
};

const list_ws = [" ", "\n", "\t"];
const list_quot = [`"`, `'`];
const list_stoptoken = [
  "|",
  ">",
  "<",
  "&",
  "\\",
  "#",
  ";",
  "(",
  ")",
  ...list_ws,
  ...list_quot,
];

const buildParserFirstHalf = (sp, profile) => {
  const options = profile ? parserConfigProfiles[profile] : { cst: false };

  const parserFactory = new ParserFactory();
  if (options.cst) {
    parserFactory.concrete = true;
    parserFactory.rememberSource = true;
  }

  const parserRegistry = StrataParseFacade.getDefaultParserRegistry();

  const parserBuilder = new ParserBuilder({
    parserFactory,
    parserRegistry,
  });

  const buildStringContext = (quote) => [
    parserFactory.create(
      StrUntilParserImpl,
      {
        stopChars: ["\\", "$", quote],
      },
      { assign: { $: "string.segment" } },
    ),
    parserBuilder.def((a) =>
      a
        .sequence(
          a.literal("\\"),
          a.choice(
            a.literal(quote),
            ...Object.keys(PARSE_CONSTANTS.escapeSubstitutions).map((chr) =>
              a.literal(chr),
            ),
            // TODO: \u[4],\x[2],\0[3]
          ),
        )
        .assign({ $: "string.escape" }),
    ),
    {
      parser: parserBuilder.def((a) =>
        a.literal(quote).assign({ $: "string.close" }),
      ),
      transition: { pop: true },
    },
    {
      parser: parserBuilder.def((a) => {
        return a.literal("$(").assign({ $: "op.cmd-subst" });
      }),
      transition: {
        to: "command",
      },
    },
  ];

  // sp.add(
  //     new FirstRecognizedPStratumImpl({
  //         parsers: [
  //             parserFactory.create(WhitespaceParserImpl),
  //             parserBuilder.def(a => a.literal('|').assign({ $: 'op.pipe' })),
  //             parserBuilder.def(a => a.literal('>').assign({ $: 'op.redirect', direction: 'out' })),
  //             parserBuilder.def(a => a.literal('<').assign({ $: 'op.redirect', direction: 'in' })),
  //             parserBuilder.def(a => a.literal('$((').assign({ $: 'op.arithmetic' })),
  //             parserBuilder.def(a => a.literal('$(').assign({ $: 'op.cmd-subst' })),
  //             parserBuilder.def(a => a.literal(')').assign({ $: 'op.close' })),
  //             parserFactory.create(StrUntilParserImpl, {
  //                 stopChars: list_stoptoken,
  //             }, { assign: { $: 'symbol' } }),
  //             // parserFactory.create(UnquotedTokenParserImpl),
  //             parserBuilder.def(buildStringParserDef('"')),
  //             parserBuilder.def(buildStringParserDef(`'`)),
  //         ]
  //     })
  // )

  sp.add(
    new ContextSwitchingPStratumImpl({
      entry: "command",
      contexts: {
        command: [
          parserBuilder.def((a) =>
            a.literal("\n").assign({ $: "op.line-terminator" }),
          ),
          parserFactory.create(WhitespaceParserImpl),
          parserBuilder.def((a) => a.literal("|").assign({ $: "op.pipe" })),
          parserBuilder.def((a) =>
            a.literal(">").assign({ $: "op.redirect", direction: "out" }),
          ),
          parserBuilder.def((a) =>
            a.literal("<").assign({ $: "op.redirect", direction: "in" }),
          ),
          {
            parser: parserBuilder.def((a) =>
              a.literal(")").assign({ $: "op.close" }),
            ),
            transition: {
              pop: true,
            },
          },
          {
            parser: parserBuilder.def((a) =>
              a.literal('"').assign({ $: "string.dquote" }),
            ),
            transition: {
              to: "string.dquote",
            },
          },
          {
            parser: parserBuilder.def((a) =>
              a.literal(`'`).assign({ $: "string.squote" }),
            ),
            transition: {
              to: "string.squote",
            },
          },
          {
            parser: parserBuilder.def((a) => a.none()),
            transition: {
              to: "symbol",
            },
          },
        ],
        "string.dquote": buildStringContext('"'),
        "string.squote": buildStringContext(`'`),
        symbol: [
          parserFactory.create(
            StrUntilParserImpl,
            {
              stopChars: [...list_stoptoken, "$"],
            },
            { assign: { $: "symbol" } },
          ),
          {
            // TODO: redundant definition to the one in 'command'
            parser: parserBuilder.def((a) =>
              a.literal("\n").assign({ $: "op.line-terminator" }),
            ),
            transition: { pop: true },
          },
          {
            parser: parserFactory.create(WhitespaceParserImpl),
            transition: { pop: true },
          },
          {
            peek: true,
            parser: parserBuilder.def((a) =>
              a.literal(")").assign({ $: "op.close" }),
            ),
            transition: { pop: true },
          },
          {
            parser: parserBuilder.def((a) => {
              return a.literal("$(").assign({ $: "op.cmd-subst" });
            }),
            transition: {
              to: "command",
            },
          },
          {
            parser: parserBuilder.def((a) => a.none()),
            transition: { pop: true },
          },
          {
            parser: parserBuilder.def((a) =>
              a.choice(...list_stoptoken.map((chr) => a.literal(chr))),
            ),
            transition: { pop: true },
          },
        ],
      },
      wrappers: {
        "string.dquote": {
          $: "string",
          quote: '"',
        },
        "string.squote": {
          $: "string",
          quote: `'`,
        },
      },
    }),
  );

  sp.add(new MergeWhitespacePStratumImpl());
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const splitTokens = (items, delimPredicate) => {
  const result = [];
  {
    let buffer = [];
    // single pass to split by pipe token
    for (let i = 0; i < items.length; i++) {
      if (delimPredicate(items[i])) {
        result.push(buffer);
        buffer = [];
        continue;
      }

      buffer.push(items[i]);
    }

    if (buffer.length !== 0) {
      result.push(buffer);
    }
  }
  return result;
};

class ShellConstructsPStratumImpl {
  static states = [
    {
      name: "pipeline",
      enter({ node }) {
        node.$ = "pipeline";
        node.commands = [];
      },
      exit({ node }) {
        console.log("!!!!!", this.stack_top.node);
        if (this.stack_top?.node?.$ === "script") {
          this.stack_top.node.statements.push(node);
        }
        if (this.stack_top?.node?.$ === "string") {
          this.stack_top.node.components.push(node);
        }
      },
      next({ value, lexer }) {
        if (value.$ === "op.line-terminator") {
          console.log("the stack??", this.stack);
          this.pop();
          return;
        }
        if (value.$ === "op.close") {
          if (this.stack.length === 1) {
            throw new Error("unexpected close");
          }
          lexer.next();
          this.pop();
          return;
        }
        if (value.$ === "op.pipe") {
          lexer.next();
        }
        this.push("command");
      },
    },
    {
      name: "command",
      enter({ node }) {
        node.$ = "command";
        node.tokens = [];
        node.inputRedirects = [];
        node.outputRedirects = [];
      },
      next({ value, lexer }) {
        if (value.$ === "op.line-terminator") {
          this.pop();
          return;
        }
        if (value.$ === "whitespace") {
          lexer.next();
          return;
        }
        if (value.$ === "op.close") {
          this.pop();
          return;
        }
        if (value.$ === "op.pipe") {
          this.pop();
          return;
        }
        if (value.$ === "op.redirect") {
          this.push("redirect", { direction: value.direction });
          lexer.next();
          return;
        }
        this.push("token");
      },
      exit({ node }) {
        this.stack_top.node.commands.push(node);
      },
    },
    {
      name: "redirect",
      enter({ node }) {
        node.$ = "redirect";
        node.tokens = [];
      },
      exit({ node }) {
        const { direction } = node;
        const arry =
          direction === "in"
            ? this.stack_top.node.inputRedirects
            : this.stack_top.node.outputRedirects;
        arry.push(node.tokens[0]);
      },
      next({ node, value, lexer }) {
        if (node.tokens.length === 1) {
          this.pop();
          return;
        }
        if (value.$ === "whitespace") {
          lexer.next();
          return;
        }
        if (value.$ === "op.close") {
          throw new Error("unexpected close");
        }
        this.push("token");
      },
    },
    {
      name: "token",
      enter({ node }) {
        node.$ = "token";
        node.components = [];
      },
      exit({ node }) {
        this.stack_top.node.tokens.push(node);
      },
      next({ value, lexer }) {
        if (value.$ === "op.line-terminator") {
          console.log("well, got here");
          this.pop();
          return;
        }
        if (value.$ === "string.dquote") {
          this.push("string", { quote: '"' });
          lexer.next();
          return;
        }
        if (value.$ === "string.squote") {
          this.push("string", { quote: "'" });
          lexer.next();
          return;
        }
        if (value.$ === "whitespace" || value.$ === "op.close") {
          this.pop();
          return;
        }
        this.push("string", { quote: null });
      },
    },
    {
      name: "string",
      enter({ node }) {
        node.$ = "string";
        node.components = [];
      },
      exit({ node }) {
        this.stack_top.node.components.push(...node.components);
      },
      next({ node, value, lexer }) {
        console.log("WHAT THO", node);
        if (value.$ === "op.line-terminator" && node.quote === null) {
          console.log("well, got here");
          this.pop();
          return;
        }
        if (value.$ === "string.close" && node.quote !== null) {
          lexer.next();
          this.pop();
          return;
        }
        if (
          node.quote === null &&
          (value.$ === "whitespace" || value.$ === "op.close")
        ) {
          this.pop();
          return;
        }
        if (value.$ === "op.cmd-subst") {
          this.push("pipeline");
          lexer.next();
          return;
        }
        node.components.push(value);
        lexer.next();
      },
    },
  ];

  constructor() {
    this.states = this.constructor.states;
    this.buffer = [];
    this.stack = [];
    this.done_ = false;

    this._init();
  }

  _init() {
    this.push("pipeline");
  }

  get stack_top() {
    return this.stack[this.stack.length - 1];
  }

  push(state_name, node) {
    const state = this.states.find((s) => s.name === state_name);
    if (!node) node = {};
    this.stack.push({ state, node });
    state.enter && state.enter.call(this, { node });
  }

  pop() {
    const { state, node } = this.stack.pop();
    state.exit && state.exit.call(this, { node });
  }

  chstate(state) {
    this.stack_top.state = state;
  }

  next(api) {
    if (this.done_) return { done: true };

    const lexer = api.delegate;

    console.log("THE NODE", this.stack[0].node);
    // return { done: true, value: { $: 'test' } };

    for (let i = 0; i < 500; i++) {
      const { done, value } = lexer.look();

      if (done) {
        while (this.stack.length > 1) {
          this.pop();
        }
        break;
      }

      const { state, node } = this.stack_top;
      console.log("value?", value, done);
      console.log("state?", state.name);

      state.next.call(this, { lexer, value, node, state });

      // if ( done ) break;
    }

    console.log("THE NODE", this.stack[0]);

    this.done_ = true;
    return { done: false, value: this.stack[0].node };
  }

  // old method; not used anymore
  consolidateTokens(tokens) {
    const types = tokens.map((token) => token.$);

    if (tokens.length === 0) {
      throw new Error("expected some tokens");
    }

    if (types.includes("op.pipe")) {
      const components = splitTokens(tokens, (t) => t.$ === "op.pipe").map(
        (tokens) => this.consolidateTokens(tokens),
      );

      return { $: "pipeline", components };
    }

    // const command = tokens.shift();
    const args = [];
    const outputRedirects = [];
    const inputRedirects = [];

    const states = {
      STATE_NORMAL: {},
      STATE_REDIRECT: {
        direction: null,
      },
    };
    const stack = [];
    let dest = args;
    let state = states.STATE_NORMAL;
    for (const token of tokens) {
      if (state === states.STATE_REDIRECT) {
        const arry =
          state.direction === "out" ? outputRedirects : inputRedirects;
        arry.push({
          // TODO: get string value only
          path: token,
        });
        state = states.STATE_NORMAL;
        continue;
      }
      if (token.$ === "op.redirect") {
        state = states.STATE_REDIRECT;
        state.direction = token.direction;
        continue;
      }
      if (token.$ === "op.cmd-subst") {
        const new_dest = [];
        dest = new_dest;
        stack.push({
          $: "command-substitution",
          tokens: new_dest,
        });
        continue;
      }
      if (token.$ === "op.close") {
        const sub = stack.pop();
        dest = stack.length === 0 ? args : stack[stack.length - 1].tokens;
        const cmd_node = this.consolidateTokens(sub.tokens);
        dest.push(cmd_node);
        continue;
      }
      dest.push(token);
    }

    const command = args.shift();

    return {
      $: "command",
      command,
      args,
      inputRedirects,
      outputRedirects,
    };
  }
}

class MultilinePStratumImpl extends ShellConstructsPStratumImpl {
  static states = [
    {
      name: "script",
      enter({ node }) {
        node.$ = "script";
        node.statements = [];
      },
      next({ value, lexer }) {
        if (value.$ === "op.line-terminator") {
          lexer.next();
          return;
        }

        this.push("pipeline");
      },
    },
    ...ShellConstructsPStratumImpl.states,
  ];

  _init() {
    this.push("script");
  }
}

const buildParserSecondHalf = (sp, { multiline } = {}) => {
  StrataParseFacade.getDefaultParserRegistry();

  // sp.add(new ReducePrimitivesPStratumImpl());
  if (multiline) {
    console.log("USING MULTILINE");
    sp.add(new MultilinePStratumImpl());
  } else {
    sp.add(new ShellConstructsPStratumImpl());
  }
};

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class PuterShellParser {
  constructor() {
  }
  parseLineForSyntax() {}
  parseLineForProcessing(input) {
    const sp = new StrataParser();
    sp.add(new StringPStratumImpl(input));
    // TODO: optimize by re-using this parser
    // buildParserFirstHalf(sp, "interpreting");
    buildParserFirstHalf(sp, "syntaxHighlighting");
    buildParserSecondHalf(sp);
    const result = sp.parse();
    if (sp.error) {
      throw new Error(sp.error);
    }
    console.log("PARSER RESULT", result);
    return result;
  }
  parseScript(input) {
    const sp = new StrataParser();
    sp.add(new StringPStratumImpl(input));
    buildParserFirstHalf(sp, "syntaxHighlighting");
    buildParserSecondHalf(sp, { multiline: true });
    const result = sp.parse();
    if (sp.error) {
      throw new Error(sp.error);
    }
    return result;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class BuiltinCommandProvider {
  async lookup(id) {
    return builtins[id];
  }

  // Only a single builtin can match a given name
  async lookupAll(...a) {
    const result = await this.lookup(...a);
    if (result) {
      return [result];
    }
    return undefined;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class CompositeCommandProvider {
  constructor(providers) {
    this.providers = providers;
  }

  async lookup(...a) {
    for (const provider of this.providers) {
      const command = await provider.lookup(...a);
      if (command) {
        return command;
      }
    }
  }

  async lookupAll(...a) {
    const results = [];
    for (const provider of this.providers) {
      const commands = await provider.lookupAll(...a);
      if (commands) {
        results.push(...commands);
      }
    }

    if (results.length === 0) return undefined;
    return results;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class ScriptCommandProvider {
  async lookup(id, { ctx }) {
    const { filesystem } = ctx.platform;

    const is_path = id.match(/^[.\/]/);
    if (!is_path) return undefined;

    const absPath = resolveRelativePath(ctx.vars, id);
    try {
      await filesystem.stat(absPath);
      // TODO: More rigorous check that it's an executable text file
    } catch (e) {
      return undefined;
    }

    return {
      path: id,
      async execute(ctx) {
        const script_blob = await filesystem.read(absPath);
        const script_text = await script_blob.text();

        console.log("result though?", script_text);

        // note: it's still called `parseLineForProcessing` but
        // it has since been extended to parse the entire file
        const ast = ctx.externs.parser.parseScript(script_text);
        const statements = ast[0].statements;

        for (const stmt of statements) {
          const pipeline = await Pipeline.createFromAST(ctx, stmt);
          await pipeline.execute(ctx);
        }
      },
    };
  }

  // Only a single script can match a given path
  async lookupAll(...a) {
    const result = await this.lookup(...a);
    if (result) {
      return [result];
    }
    return undefined;
  }
}

class HookableCommandProvider {
  constructor(commands) {
    this.commands = commands;
  }

  async lookup(id, { ctx }) {
    return this.commands[id];
  }

  async lookupAll(id, { ctx }) {
    const result = await this.lookup(id, { ctx });
    if (result) {
      return [result];
    }
    return undefined;
  }
}

/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const argparser_registry = {
  [SimpleArgParser.name]: SimpleArgParser,
};

const decorator_registry = {
  [ErrorsDecorator.name]: ErrorsDecorator,
};

const launchPuterShell = async (ctx) => {
  const config = ctx.config;
  const ptt = ctx.ptt;
  const puterShell = ctx.puterShell;

  // Need to replace `in` with something we can write to
  const real_pipe = new Pipe();
  const echo_pipe = new Pipe();
  const out_writer = new MultiWriter({
    delegates: [echo_pipe.in, real_pipe.in],
  });
  new Coupler(ptt.in, out_writer);
  const echo = new Coupler(echo_pipe.out, ptt.out);
  const stdin = new BetterReader({ delegate: real_pipe.out });
  echo.off();

  const readline = ReadlineLib.create({
    in: stdin,
    out: ptt.out,
    process: ctx.externs.process,
  });

  const sdkv2 = globalThis.puter;
  if (ctx.platform.name !== "node") {
    await sdkv2.setAuthToken(config["puter.auth.token"]);
    const source_without_trailing_slash =
      (config.source && config.source.replace(/\/$/, "")) ||
      "https://api.puter.com";
    await sdkv2.setAPIOrigin(source_without_trailing_slash);
  }

  // const commandProvider = new BuiltinCommandProvider();
  const commandProvider = new CompositeCommandProvider([
    new BuiltinCommandProvider(),
    new ScriptCommandProvider(),
    new HookableCommandProvider(ctx.commands || []),
    new CompositeCommandProvider(ctx.providers || []),
  ]);

  ctx = ctx.sub({
    externs: new Context$1({
      config,
      puterShell,
      readline: readline.readline.bind(readline),
      in: stdin,
      out: ptt.out,
      echo,
      parser: new PuterShellParser(),
      commandProvider,
      sdkv2,
      historyManager: readline.history,
    }),
    registries: new Context$1({
      argparsers: argparser_registry,
      decorators: decorator_registry,
      // While we use the BuiltinCommandProvider to provide the
      // functionality of command lookup, we still need a registry
      // of builtins to support the `help` command.
      builtins,
    }),
    plugins: new Context$1(),
    locals: new Context$1(),
  });

  const ansiShell = new ANSIShell(ctx);

  // TODO: move ioctl to PTY
  ptt.on("ioctl.set", (evt) => {
    ansiShell.dispatchEvent(
      new CustomEvent("signal.window-resize", {
        detail: {
          ...evt.data.windowSize,
        },
      }),
    );
  });

  const fire = (text) => {
    // Define fire-like colors (ANSI 256-color codes)
    const fireColors = [202, 208, 166];

    // Split the text into an array of characters
    const chars = text.split("");

    // Apply a fire-like color to each character
    const fireText = chars
      .map((char) => {
        // Select a random fire color for each character
        const colorCode =
          fireColors[Math.floor(Math.random() * fireColors.length)];
        // Return the character wrapped in the ANSI escape code for the selected color
        return `\x1b[38;5;${colorCode}m${char}\x1b[0m`;
      })
      .join("");

    return fireText;
  };

  ctx.externs.out.write(
    `${fire("AnuraOS Phoenix Shell")} [v${SHELL_VERSIONS[0].v}]\n` + "\n",
  );

  for (;;) {
    await ansiShell.doPromptIteration();
  }
};

const encoder = new TextEncoder();

class HtermPTT {
  constructor(hterm, node, decorate, onReady) {
    this.node = node;
    this.hterm = new hterm.Terminal();

    this.hterm.decorate(this.node);

    this.hterm.onTerminalReady = async () => {
      node
        .querySelector("iframe")
        .contentDocument.querySelector("x-screen").style.overflow = "hidden";
      let io = this.hterm.io.push();
      if (decorate) {
        await decorate(this);
      } else {
        this.hterm.setBackgroundColor("#141516");
        this.hterm.setCursorColor("#bbb");
      }

      this.ioctl_listeners = {};

      this.readableStream = new ReadableStream({
        start: (controller) => {
          this.readController = controller;
        },
      });
      this.writableStream = new WritableStream({
        start: (controller) => {
          this.writeController = controller;
        },
        write: (chunk) => {
          if (typeof chunk === "string") {
            chunk = encoder.encode(chunk);
          }
          io.writeUTF8(this.LF_to_CRLF(chunk));
        },
      });
      this.out = this.writableStream.getWriter();
      this.in = this.readableStream.getReader();
      this.in = new BetterReader({ delegate: this.in });

      io.onVTKeystroke = (key) => {
        this.readController.enqueue(encoder.encode(key));
      };

      io.sendString = (str) => {
        this.readController.enqueue(encoder.encode(str));
      };

      io.onTerminalResize = (cols, rows) => {
        this.emit("ioctl.set", {
          data: {
            windowSize: {
              rows,
              cols,
            },
          },
        });
      };

      this.hterm.installKeyboard();

      onReady(this);
    };
  }

  on(name, listener) {
    if (!this.ioctl_listeners.hasOwnProperty(name)) {
      this.ioctl_listeners[name] = [];
    }
    this.ioctl_listeners[name].push(listener);
  }

  emit(name, evt) {
    if (!this.ioctl_listeners.hasOwnProperty(name)) return;
    for (const listener of this.ioctl_listeners[name]) {
      listener(evt);
    }
  }

  LF_to_CRLF(input) {
    let lfCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === 0x0a) {
        lfCount++;
      }
    }

    const output = new Uint8Array(input.length + lfCount);

    let outputIndex = 0;
    for (let i = 0; i < input.length; i++) {
      // If LF is encountered, insert CR (0x0D) before LF (0x0A)
      if (input[i] === 0x0a) {
        output[outputIndex++] = 0x0d;
      }
      output[outputIndex++] = input[i];
    }

    return output;
  }
}

const CreateEnvProvider = (anura) => {
  return {
    getEnv: () => {
      const directories = Object.fromEntries(
        Object.entries(anura.settings.get("directories")).map(([k, v]) => [
          "DIRECTORIES_" + k.toUpperCase(),
          v,
        ]),
      );

      return {
        USER: "anura",
        HOME: "/",
        HOSTNAME: location.hostname,
        PS1: "[\\u@\\h \\w]\\$ ",
        ...directories,
        ...(anura.settings.get("env") || {}),
      };
    },

    get(k) {
      return this.getEnv()[k];
    },
  };
};

function convertAnuraError(e) {
  if (ErrorCodes[e.code] === undefined) {
    console.error(`Unknown error code: ${e.code}`);
    console.error(e);
    return e;
  }
  return new PosixError(ErrorCodes[e.code], e.message);
}

function wrapAPIs(apis) {
  for (const method in apis) {
    if (typeof apis[method] !== "function") {
      continue;
    }
    const original = apis[method];
    apis[method] = async (...args) => {
      try {
        return await original(...args);
      } catch (e) {
        throw convertAnuraError(e);
      }
    };
  }
  return apis;
}

const shell = new anura.fs.Shell();

const CreateFilesystemProvider = (anura) =>
  wrapAPIs({
    capabilities: {},
    readdir: async (path) =>
      (await anura.fs.promises.readdir(path, { withFileTypes: true })).map(
        (dirent) => ({
          modified: dirent.mtimeMs / 1000,
          accessed: dirent.atimeMs / 1000,
          created: dirent.ctimeMs / 1000,
          is_dir: dirent.isDirectory(),
          is_symlink: dirent.isSymbolicLink(),
          is_shortcut: 0,
          subdomains: [],
          ...dirent,
        }),
      ),

    stat: async (path) =>
      anura.fs.promises.stat(path).then((stat) => ({
        modified: stat.mtimeMs / 1000,
        accessed: stat.atimeMs / 1000,
        created: stat.ctimeMs / 1000,
        is_dir: stat.isDirectory(),
        is_symlink: stat.isSymbolicLink(),
        is_shortcut: 0,
        subdomains: [],
        ...stat,
      })),
    mkdir: anura.fs.promises.mkdir,
    read: async (path) => {
      const data = await anura.fs.promises.readFile(path);
      return new Blob([data]);
    },
    write: async (path, data) => {
      if (data instanceof Blob) {
        return await anura.fs.promises.writeFile(
          path,
          Filer.Buffer(await data.arrayBuffer()),
        );
      }

      return await anura.fs.promises.writeFile(path, data);
    },
    rm: async (path, { recursive = false }) => {
      const stat = await anura.fs.promises.stat(path);

      if (stat.is_dir && !recursive) {
        throw PosixError.IsDirectory({ path });
      }

      return await shell.promises.rm(path, { recursive });
    },
    rmdir: async (path) => {
      const stat = await anura.fs.promises.stat(path);

      if (!stat.is_dir) {
        throw PosixError.IsNotDirectory({ path });
      }

      return await shell.promises.rm(path, { recursive: true });
    },
    move: anura.fs.promises.rename,
    copy: async (oldPath, newPath) => {
      const srcStat = await anura.fs.promises.stat(oldPath);
      const srcIsDir = srcStat.isDirectory();

      if (srcIsDir) {
        // Copying directories is not yet implemented in the Anura shell.
        throw PosixError.IsDirectory({ path: oldPath });
      }

      return await shell.promises.cp(oldPath, newPath);
    },
  });

const providers = [];
const commands = {};

const create_shell = async (
  config,
  element,
  hterm,
  anura,
  process,
  decorate,
) => {
  await new Promise((resolve) => {
    new HtermPTT(hterm, element, decorate, async (ptt) => {
      await launchPuterShell(
        new Context$1({
          ptt,
          config,
          providers,
          commands,
          externs: new Context$1({
            anura,
            process,
          }),
          platform: new Context$1({
            name: "node",
            env: CreateEnvProvider(anura),
            filesystem: CreateFilesystemProvider(anura),
          }),
        }),
      );
      resolve();
    });
  });
};

const register_provider = (provider) => {
  providers.push(provider);
};

const unregister_provider = (provider) => {
  const idx = providers.indexOf(provider);
  if (idx >= 0) {
    providers.splice(idx, 1);
  }
};

const register_command = (id, command) => {
  commands[id] = command;
};

const unregister_command = (idOrCommand) => {
  if (typeof idOrCommand === "string") {
    delete commands[idOrCommand];
    return;
  }
  for (const id in commands) {
    if (commands[id] === idOrCommand) {
      delete commands[id];
    }
  }
};

export { create_shell, register_command, register_provider, unregister_command, unregister_provider };
