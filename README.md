# Freelens Duplicate Extension

Don't debug in live workloads, duplicate instead.

A Freelens extension for duplicating Kubernetes resources using [duplik8s](https://github.com/Telemaco019/duplik8s).

[Screencast_20250723_203500.webm](https://github.com/user-attachments/assets/a6be2a78-6804-410c-9cef-fb1137074b2c)

## Requirements

- Freelens >= 1.5.2
- kubectl with duplik8s plugin installed

## Installation

1. Install duplik8s: `kubectl krew install duplicate`
2. Install this extension in Freelens Extensions page `@omarluq/freelens-duplicate-extension`

## Usage

Right-click on a Pod, Deployment, or StatefulSet and select "Duplicate".

## Build

```bash
pnpm install
pnpm build
pnpm pack
```

## License

MIT

