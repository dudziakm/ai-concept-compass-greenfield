# @dudziakm/ai-toolkit

Private GitHub Packages distribution of the team `code-review` skill and shared
engineering conventions.

The first package published under this personal GitHub scope is private by
default. After the initial release, verify the package page still shows private
visibility before granting consumers access; changing a package to public cannot
be reversed to private.

## Consumer setup

Commit only this registry mapping to the consumer repository's `.npmrc`:

```text
@dudziakm:registry=https://npm.pkg.github.com
```

Do not commit a token. CI may supply `GH_PKG_TOKEN`; local developers should
use `npm login` or a user-level `.npmrc`.

Install the package with the GitHub Packages credential available to npm. Its
fail-soft `postinstall` copies the managed skill to `.claude/skills/code-review/`,
updates a delimited block in `CLAUDE.md`, and writes
`.claude/.ai-toolkit-manifest.json`. Reinstalling updates only the managed files.

To remove managed artifacts, run:

```bash
node node_modules/@dudziakm/ai-toolkit/uninstall.js
```

The uninstaller removes only files named in the manifest and the package's
sentinel-delimited rules block.
