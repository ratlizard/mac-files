# mac-files

Classic Mac files read, and a few written, in the browser. These are the
files that grimoire (Cythera), StarGrimoire (EV Nova) and SnoidGrimoire
(Zoombinis) share. Each site copies the files it uses into its `js/` folder,
and its `utilities/copies_check.mjs` checks that each copy matches this
repository's file byte for byte.

They are classic scripts, with no `import` and no `export`. Each one defines
globals, so a page copied to a disk still works when it is double-clicked.
`mac-bytes.js` loads first, and each file's header lists what else it needs.

| file | what |
|---|---|
| `mac-bytes.js` | big-endian readers, Mac Roman, CRC-32, `safeFileName` |
| `mac-containers.js` | BinHex 4.0, MacBinary and AppleSingle/Double, unwrapped to both forks, and MacBinary written |
| `mac-resfork.js` | a resource fork read, and written back byte for byte |
| `mac-rsrc-types.js` | what is inside a fork (PICT, snd, NFNT, clut, cicn, crsr, ICN#, STR#, vers, DITL, MENU, cfrg, 68K CODE and more) |
| `mac-media.js` | decoded pixels and samples as PNG and WAV |
| `mac-export.js` | a store-only zip writer and the browser's downloads |
| `mac-stuffit.js` | StuffIt archives, classic and StuffIt 5, stored or packed with methods 2 (LZW), 3 (Huffman), 5 (LZAH), 13 and 15 (Arsenic) |
| `mac-stuffitx.js`, `mac-stuffitx-english.js` | StuffIt X, with its catalog, Brimstone, Cyanide, Iron, Deflate and the English preprocessing's dictionary |
| `mac-compactpro.js` | Compact Pro, with its catalog, RLE and LZH |
| `mac-zip.js` | zip, stored and deflated, with the AppleDouble beside each entry joined to it, and ZipIt self-extractors |
| `mac-rar.js` | RAR 1.5 to 4, with RAR 2.9's LZ, its filters and PPMd |
| `mac-vise.js` | Installer VISE 3 installers, and the DEFLATE inflater the others use |
| `mac-installshield.js` | InstallShield 3's `data.z` and PKWARE's implode |
| `mac-hfs.js` | an HFS disk image written, both forks, for an emulator to mount |
| `mac-pef.js` | a PowerPC program, with its sections, imports, exports and routines |
| `mac-ppc.js`, `mac-ppc-asm.js` | PowerPC instructions read, in LLVM's spelling, and written |
| `mac-qtmusic.js` | QuickTime Musical Instruments read, and a QTMA tune played through them |
| `mac-geneva.js` | a Geneva 9 and Geneva's widths, for the strikes a translation adds |

## Changing a file

A change is made here and copied to every site that has the file. The sites
test the decoders on the games' archives and installers, and against The
Unarchiver's `unar`. None of those files are in this repository. So a change
lands here only after a site that copies the file passes its checks with the
change copied in. Grimoire goes first if it has the file. Each other site
that has the file copies the change in its next piece of work, and its copies
check fails until then. Grimoire's checks on GitHub read a front's branch of
mac-files when it has the same name as grimoire's branch. The workspace's
`front.sh land` pushes that branch before it waits for the checks.

`node utilities/check.mjs` is this repository's check, and it needs no game.
It checks that the files load together and that no two declare the same name.
It checks that what they write (a resource fork, MacBinary, a zip, PowerPC)
reads back, and that DEFLATE from node's zlib inflates. `--control` gives each
part a fault the check must catch.

Several decoders were ported from other programs that read the same format.
The StuffIt methods came from Ben Letchford's stuffit-rs, the HFS writer from
his systemless, and StuffIt X, Compact Pro and RAR from XADMaster. A port can
copy a bug from its source. So **a commit that fixes a decoder states whether
the programs it was compared with have the same bug.**

`NOTES.md` is the log, newest last.

## History

The files were grimoire's until 14 October 2026, in `js/` of
[ratlizard/grimoire](https://github.com/ratlizard/grimoire), and
`mac-rar.js` was StarGrimoire's `js/rar.js` in
[e-z-g/stargrimoire](https://github.com/e-z-g/stargrimoire). Their history
before that date is in those repositories.

## License

GPL, version 3 or any later version. `LICENSE` is the text. `NOTICE` lists
what came from elsewhere and under which license.
