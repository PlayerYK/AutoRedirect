**AutoRedirect** is a Manifest V3 Chrome extension for URL redirection — environment switching, domain migration, and redirect link optimization.

## Features

- **Multiple matching modes** — Exact, prefix, suffix, and wildcard patterns.
- **URL templates** — Rewrite paths and migrate domains with `{1}`, `{2}` placeholders.
- **URL extraction** — Skip intermediate redirect pages, go straight to the target.
- **Local file mapping** — Redirect local `file://` paths to remote servers.
- **Multi-result selection** — Choose from multiple targets when a rule has several matches.
- **Batch testing** — Built-in batch URL testing tool to verify rules quickly.

## Examples

```
# Exact match: local port → dev server
=localhost:3000####https://dev.example.com

# Domain migration: preserve paths
old-domain.com/*####https://new-domain.com/{1}

# URL extraction: skip Zhihu redirect pages
link.zhihu.com/?target=####

# Suffix match: local file → online version
*demo_local.html$####https://www.example.com/demo/
```

## Who is it for

- **Developers** — Switch between local, dev, staging, and production environments.
- **Site admins** — Handle domain migrations and URL restructuring.
- **Everyday users** — Skip ad pages and redirect intermediaries.

## Documentation

Full guide and more examples: [https://playeryk.github.io/AutoRedirect/](https://playeryk.github.io/AutoRedirect/)

## Recent Updates

- Redesigned options page with a cleaner, modern visual style
- New batch URL testing tool for validating multiple rules at once
- Enhanced rule editor: line numbers, syntax highlighting, error line indicators, comment toggling

## Links

- GitHub: [https://github.com/PlayerYK/AutoRedirect](https://github.com/PlayerYK/AutoRedirect)
- Issues: [https://github.com/PlayerYK/AutoRedirect/issues](https://github.com/PlayerYK/AutoRedirect/issues)

