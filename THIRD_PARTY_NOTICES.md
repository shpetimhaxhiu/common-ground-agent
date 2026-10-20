# Third-party source notices

The root MIT license covers this project's original code. Copied or adapted third-party components retain their original licenses.

## Vercel AI Elements

`components/ai-elements/plan.tsx` derives from AI Elements Plan, obtained through the official registry at https://elements.ai-sdk.dev/api/registry/plan.json.

Copyright 2023 Vercel, Inc. Licensed under the Apache License, Version 2.0. See [the bundled license](LICENSES/Apache-2.0.txt) and [upstream license](https://github.com/vercel/ai-elements/blob/main/LICENSE).

Modifications: removed the unused shimmer/motion dependency for static reports, retained the collapsible report composition, added aria-busy and project styling.

## shadcn/ui

Components in `components/ui/` were generated from shadcn/ui and customized for this application.

Copyright (c) 2023 shadcn. MIT License; the full notice is preserved in [LICENSES/shadcn-MIT.txt](LICENSES/shadcn-MIT.txt). Upstream: https://github.com/shadcn-ui/ui/blob/main/LICENSE.md.

## Installed packages

Dependencies retain their package licenses and notices. Dependencies, generated Prisma clients, runtime data, provider responses and secrets are not vendored into this repository.
