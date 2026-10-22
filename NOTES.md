# mac-files: the log

Newest last. The files' reasoning before 14 October 2026 is in their headers
and in the history of grimoire and StarGrimoire (README, *History*).

## The files gathered here (14 October 2026)

The nineteen `mac-*.js` files came from grimoire's main, where they were
written, and `mac-rar.js` from StarGrimoire's `js/rar.js`, renamed so that
one rule, a site's `js/mac-*.js`, finds every copy. The maintainer asked
whether the readers belonged in a repository the games share, since three
sites now copy them (grimoire, StarGrimoire, and SnoidGrimoire for
Zoombinis), and chose the account and the name. It was made under e-z-g and moved to ratlizard, beside grimoire, the same day at the maintainer's asking; GitHub redirects the old address.

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

## `mac-hfs.js`: index keys at full width, tree files filling their blocks, no start blocks (15 October 2026)

A Cythera disk this wrote for Infinite Mac, with three catalog levels,
mounted and read on Mac OS 7.6, but the Finder could not move a file into a
folder there (error -127) and the game, which creates a file beside its
save without checking the result, read garbage on opening a save in that
folder. The same save opened from another volume, or from the volume's top
folder, loaded. `fsck_hfs` (macOS still checks plain HFS, through
`hdiutil attach -nomount` on a copy) stopped at the extents file's size,
then at a catalog index key of 27 bytes where it expects 37, then at 41
file records with non-zero reserved fields. Three changes, each matching
what Apple's HFS writes on the maintainer's own upload, which `fsck_hfs`
passes:

- an index record's key is padded to the tree's key length, with the
  length byte 37 and the child pointer at offset 38 -- the middle of the
  three forms the header says were mounted; the variable form mounts but
  takes no insertions on 7.6;
- each B-tree file takes as many more free nodes as fill its last
  allocation block, so its logical size is its whole allocation (on volumes
  of 512-byte blocks this was already so);
- `filStBlk` and `filRStBlk` stay 0; the forks are found through the
  extent records.

Rebuilt with the change, the same disk passes `fsck_hfs`, and on 7.6 the
save opens from that folder and saves there. systemless's reader, which
this writer was ported from, only reads, walks the leaf chain without
opening an index node and reads forks through the extent records, so it
has none of the three. grimoire's `hfs_check.mjs` checks all three now;
against the old writer the key length and start blocks fail and the
block fill cannot, its volumes using 512-byte blocks. Whether the
desktop-file alert in the header is the same fault is untested.

## Comments and messages reworded to the wording rules (16 October 2026)

`node tools/wording/wording-check.js` in the workspace (cythera-workbench's
`workspace/tools/wording/`) found 351 places in `js/` where code or data
was described as an agent (says, holds, takes, keeps, wants, refuses) or
with an emphatic "own". Each was reworded in place: comments, and the error
messages of `mac-ppc-asm.js`, `mac-resfork.js`, `mac-rar.js`,
`mac-stuffit.js`, `mac-stuffitx.js`, `mac-qtmusic.js` and `mac-zip.js`. No
grimoire check matches those messages. The one string a page shows,
`mac-rsrc-types.js`'s empty help page ("This page has no text."), moved
grimoire's resource snapshot, re-pinned there; nothing else it hashes
changed. `utilities/check.mjs` passes, and grimoire's `check_all` passes
with the copies. The rule reads one line at a time, so a phrase broken
across two lines ("the archive's" / "own maps") is not caught; the one
seen was fixed by hand.

## The rewording's second pass: sentences rewritten whole (16 October 2026)

The first pass swapped the flagged word for one from the rule's list, one
line at a time, and 34 sentences came out stilted or slightly off ("this
byte gives how many more", "the table has how long it is", "BO sets what
is tested"). Each was rewritten as a sentence after reading the whole
word-diff of the first pass. The one error message changed is `mac-rar.js`'s
"a filter program this page does not recognise". The wording hook and the
whole scan now say to rewrite the sentence rather than swap the word.

## No sentence ends on a dangling conjunction or adverb (20 October 2026)

Sixteen comments that ended on a word left hanging ("as before.", "at
once.", "stored or not.", "the byte after.") were written out in full, in
eleven files; grimoire and the player took the copies. No code changed.

## A PICT's pixels written back (21 October 2026)

`mac-rsrc-types.js` has `pictReplacePixels(data, rgba, W, H)`, with
`pictImageLayout` and `packBitsUnits` beside it: a picture with its one
image's pixels replaced and every other byte as it was, in the same form
(indexed in the same colour table, 16-bit packed by the word, 32-bit
packed by the plane, or the 1-bit bitmap). An unchanged pixel of an
indexed picture is given the index it had; another colour the first exact
match in the table, else the nearest. Grimoire uses it for Replace with a
PNG on a PICT's page, and its `pict_write_check.mjs` round-trips all
twenty-one PICTs of Cythera's two forks through the decoder. The decoder
also returned `end` as undefined for every direct picture
(`decodeDirectBitsRows` names it `p`), corrected in the same change;
nothing read it for a direct picture until the writer. systemless and
alchemy/port draw pictures without returning where the rows end, so neither
has a counterpart to that slip. `utilities/check.mjs` passes, and grimoire's
checks pass with the copy.

## The Finder flags in MacBinary, and the icons, cursors and patterns written back (21 October 2026)

`writeMacBinary` writes `f.finderFlags`, the high byte at 73 and the low
byte at 101, and wrote none before: an application came out without
hasBundle (0x2000), so the Finder never read its BNDL and the application
and its documents had blank icons. A grimoire visitor saw that on the
program Replacement Files gave. `mac-rsrc-types.js` has `rsrcReplaceImage`
and `rsrcImagePlanes` beside `pictReplacePixels`, for ICN#, ics#, icl4,
icl8, ics4, ics8, CURS, crsr, cicn and ppat: an unchanged pixel retains its
bits, so a picture saved and put back unchanged is the same bytes, and the
PNG's alpha is the mask where the resource has one. `paletteIndexer` is the
colour rule the PICT writer used, now shared. `decode1bitIcon` draws an
ICN#'s or ics#'s mask as transparency when asked (`masked`), so that a PNG
saved from one has the mask; the resource snapshot calls it without the
flag and does not move. Grimoire's `image_write_check.mjs` round-trips all
139 image resources of Cythera's two forks. `utilities/check.mjs` passes,
and grimoire's checks pass with the copies.
