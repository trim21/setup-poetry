# Setup Python-Poetry

[![ci](https://github.com/Trim21/setup-poetry/workflows/build-test/badge.svg)](https://github.com/Trim21/setup-poetry/actions)

```yaml
uses: trim21/setup-poetry@dist/v1
with:
  version: "" # empty string for latest poetry
```

default it will install latest poetry.

Or you can use any valid pep440 version range.

for example

- `>=1.2,<2.0`
- `~=1.2` (version 1.2 or later, but not version 2.0 or later)
- `== 3.1.*` (`==` is required, `3.1.*` and `3.1.x` won't work)
- `~=1.1.0, != 1.1.3`: version 1.1.0 or later, but not version 1.1.3 and not version 1.2.0 or later.
