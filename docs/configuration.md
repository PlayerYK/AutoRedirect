# Configuration Reference

This page provides detailed information about AutoRedirect configuration rules, including syntax, matching modes, best practices, and security considerations.

## Rule Format

The basic format for redirection rules is:
```
source_pattern####target_url
```

- Use `####` as the separator between source pattern and target URL
- Empty target URL (nothing after `####`) enables smart URL extraction
- Lines starting with `#` are comments and will be ignored
- Empty lines are also ignored

## Matching Modes

### 1. Exact Match (Recommended, Safest)
Use `=` prefix to match URLs exactly, avoiding accidental triggers.

**Syntax**: `=pattern####target_url`

**Examples**:
```
=localhost:3000####https://www.example.com
=file:///Downloads/full/test_local.html####https://www.example.com/full/
```

### 2. Prefix Match (Recommended Format)
Use `^` prefix or `*` suffix to match URLs starting with the pattern.

**Syntax**: `^pattern####target_url` or `pattern*####target_url`

**Examples**:
```
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
localhost:8*####https://development.example.com
```

### 3. Suffix Match
Use `*` prefix or `$` suffix to match URLs ending with the pattern.

**Syntax**: `*pattern####target_url` or `pattern$####target_url`

**Examples**:
```
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

### 4. Contains Match (Use with Caution)
Default mode that matches if the URL contains the pattern.

**Syntax**: `pattern####target_url`

**⚠️ Warning**: This mode may have unintended matches. Use only in controlled environments.

## URL Template Replacement

Use `*` wildcards and `{1}`, `{2}`, `{3}` placeholders for URL rewriting.

**Examples**:
```
# Basic domain replacement
old-domain.com/*####new-domain.com/{1}

# Complex path rewriting
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}

# Reusing placeholders
user.com/profile/*####newuser.com/{1}/dashboard/{1}
```

## Smart URL Extraction

Leave target URL empty to enable automatic URL parameter extraction and decoding.

**Examples**:
```
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## Local File Redirection

AutoRedirect supports `file://` protocol redirection with the following matching patterns:

1. **Exact file path match**
2. **Cross-user generic path match**
3. **Specific project match**
4. **General match**

**Examples**:
```
# Exact match
=file:///Downloads/full/test_local.html####https://www.example.com/full/

# Cross-user match
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}

# Project-specific match
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/

# General match
*demo_local.html$####https://www.example.com/demo/
```

## Best Practices

### Security Recommendations

1. **Prioritize exact matching** (`=` prefix) to avoid accidental redirections
2. **Use standard domain formats** for prefix matching (e.g., `.localhost`, `.local`)
3. **Avoid simple string matching** except in controlled environments
4. **Place more specific rules first** in the configuration

### Safe Patterns for Different Scenarios

**✅ Recommended (Safe)**:
```
# Exact matching
=localhost:3000####https://www.example.com

# Standard domain format
^dev.localhost####https://development.example.com

# Enterprise internal (controlled environment)
corp-hr####https://hr.company.com
internal-*####https://gateway.company.com/redirect?to={1}

# Custom protocols (protocol isolation)
myapp://####https://web.myapp.com/
```

**⚠️ Use with Caution**:
```
# Simple string matching - may cause unintended matches
search####https://www.google.com  # May match "research.com/search-results"
api####https://api.example.com     # May match "example.com/rapid-api/docs"
```

### Address Bar Input Limitations

- Simple strings (like `dev`, `api`) entered directly in the address bar may be treated as search terms
- Recommend using complete domain formats or accessing through bookmarks/programs

## Multiple Results Selection

When a URL matches multiple rules, AutoRedirect will display a selection page:

**Example**:
```
=search.local####https://www.google.com
=search.local####https://www.bing.com
=search.local####https://www.yahoo.com
```

## Rule Matching Order

Rules are matched in the following order:
1. **Test each rule sequentially** from top to bottom in the configuration file
2. **Collect all matching rules**
3. **If only one match**, redirect directly
4. **If multiple matches**, show selection page for user to choose

## Common Use Cases

### Development Environment
```
# Local development to production mapping
^dev.localhost####https://development.example.com
^staging.localhost####https://staging.example.com
=localhost:3000####https://www.example.com
```

### Enterprise Internal
```
# Internal services (use in controlled environments)
corp-hr####https://hr.company.com
corp-finance####https://finance.company.com
internal-*####https://gateway.company.com/redirect?to={1}
```

### URL Cleanup
```
# Skip intermediate redirect pages
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## Troubleshooting

### Common Issues

1. **Rule not triggering**: Check if the pattern exactly matches the URL
2. **Unintended matches**: Use more specific patterns or exact matching
3. **Multiple matches**: Review rule order and specificity

### Testing Tips

1. Start with exact matching for critical rules
2. Test rules in isolation before adding to main configuration
3. Use browser developer tools to inspect actual URLs
4. Check the extension's popup for rule status and matches

---

For practical examples and interactive testing, see our [Test Cases](/test-cases/01-exact-match) section. 