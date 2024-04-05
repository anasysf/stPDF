#!/bin/sh

if [[ $OSTYPE == 'linux-gnu' ]]; then
  export WEBKIT_DISABLE_DMABUF_RENDERER=1
fi

cargo fmt -v --all -- --emit=files && pnpm tauri:dev
