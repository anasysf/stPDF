#!/bin/sh

export WEBKIT_DISABLE_DMABUF_RENDERER=1

pnpm tauri:dev
