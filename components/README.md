# Components Structure

## Server Components (default)
- `Header.tsx` - Server component for header
- `Footer.tsx` - Server component for footer

## Client Components (use 'use client' directive)
- Components that need interactivity will be in separate files with `'use client'` directive
- Example: `HeaderClient.tsx`, `ProductCardClient.tsx`, etc.

## Naming Convention
- Server Components: `ComponentName.tsx`
- Client Components: `ComponentNameClient.tsx` or `ComponentName.tsx` with `'use client'`
