# 0002: React Aria Components behind our own `ui/` layer

- **Date:** 3 November 2026
- **Status:** accepted

## Context

The app needs about eight widgets. Most are plain HTML, but a few are hard to get right: a bottom sheet or dialog, tabs and a toast need focus handling, screen reader support, touch-versus-click handling and dismissal. Full styled libraries (MUI, Mantine, Chakra) bring their own look and styling system, which would fight CSS Modules and a clay-and-tablet design.

## Decision

Use [React Aria Components](https://react-spectrum.adobe.com/react-aria/) for accessible, unstyled primitives. It has the strongest accessibility and mobile press handling of the headless libraries, and is styled with plain class names. Radix Primitives was a close second, weaker on touch.

Components never import React Aria directly. They import our own wrappers from `src/ui` (`ui/Link`, later `ui/Button`, `ui/Sheet`, `ui/Toast`), and an ESLint rule stops any other folder importing `react-aria-components`.

## Consequences

Swapping the primitive library later touches only `src/ui`. Each wrapper exposes only the props the app uses, which keeps the surface small.

## Revisit when

A widget we need is missing from React Aria, or the library stops being maintained.
