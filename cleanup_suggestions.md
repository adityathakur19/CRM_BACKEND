# Codebase Cleanup Suggestions

This file contains a list of unused files, dependencies, and other suggestions for cleaning up the codebase.

## Unused Files

The following files are not used anywhere in the project and can likely be removed.

### Components

*   `src/components/leads/LeadDetailDrawer.tsx`

### UI Components

The following UI components from `src/components/ui` seem to be part of a component library, but are not currently used in the application.

*   `src/components/ui/accordion.tsx`
*   `src/components/ui/alert-dialog.tsx`
*   `src/components/ui/alert.tsx`
*   `src/components/ui/aspect-ratio.tsx`
*   `src/components/ui/breadcrumb.tsx`
*   `src/components/ui/button-group.tsx`
*   `src/components/ui/calendar.tsx`
*   `src/components/ui/card.tsx`
*   `src/components/ui/carousel.tsx`
*   `src/components/ui/chart.tsx`
*   `src/components/ui/collapsible.tsx`
*   `src/components/ui/context-menu.tsx`
*   `src/components/ui/drawer.tsx`
*   `src/components/ui/empty.tsx`
*   `src/components/ui/field.tsx`
*   `src/components/ui/hover-card.tsx`
*   `src/components/ui/input-group.tsx`
*   `src/components/ui/input-otp.tsx`
*   `src/components/ui/item.tsx`
*   `src/components/ui/kbd.tsx`
*   `src/components/ui/menubar.tsx`
*   `src/components/ui/navigation-menu.tsx`
*   `src/components/ui/pagination.tsx`
*   `src/components/ui/popover.tsx`
*   `src/components/ui/radio-group.tsx`
*   `src/components/ui/resizable.tsx`
*   `src/components/ui/sidebar.tsx`
*   `src/components/ui/slider.tsx`
*   `src/components/ui/toggle-group.tsx`
*   `src/components/ui/toggle.tsx`

## Mostly Unused Files

*   `src/data/mockdata.ts`: This file contains mock data for testing, but a large portion of it is not being used. Some variables are defined and then immediately shadowed by local variables of the same name in the mock pages.

## Unused Dependencies

The following dependencies are listed in `package.json` but are not used in the code. You can likely remove them.

*   `@hookform/resolvers`
*   `date-fns`
*   `zod`
*   `autoprefixer`
*   `depcheck`
*   `postcss`
*   `ts-prune`
*   `tw-animate-css`

**To remove these dependencies, you can run the following command:**

```bash
npm uninstall @hookform/resolvers date-fns zod autoprefixer depcheck postcss ts-prune tw-animate-css
```

## Folders to Remove

After removing the unused files, you might be able to remove the following folders if they become empty:

*   `src/components/leads` (if `LeadDetailDrawer.tsx` is the only file in it)

I recommend reviewing the files before deleting them.
