# mac-files: the log

Newest last. The files' reasoning before 14 October 2026 is in their headers
and in the history of grimoire and StarGrimoire (README, *History*).

## The files gathered here (14 October 2026)

The nineteen `mac-*.js` files came from grimoire's main, where they were
written, and `mac-rar.js` from StarGrimoire's `js/rar.js`, renamed so that
one rule, a site's `js/mac-*.js`, finds every copy. The maintainer asked
whether the readers belonged in a repository the games share, since three
sites now copy them (grimoire, StarGrimoire, and SnoidGrimoire for
Zoombinis), and chose the account and the name.

Two headers changed on the way. `mac-rar.js` no longer calls itself
StarGrimoire's own. `mac-geneva.js` names its licences where they now sit,
in `licences/`, and in grimoire's `res/`.

`utilities/check.mjs` is new: what can be checked with no game's files. The
files load together in a page's order; no top-level name is declared in two
files, which as classic scripts would replace each other silently; and a
resource fork, MacBinary, a zip (stored and deflated by node's zlib) and
fourteen PowerPC instructions written by the files read back as written,
and node's DEFLATE at four levels inflates through `inflateRaw`.
`--control` gives each of the nine parts a fault (a misnamed file, a second
`crc32`, a file that does not parse, one byte flipped in each written file,
an instruction compared with a different word) and all nine were caught.
The decoders' real tests stay in the sites, which have the archives.
