import { type FileResponse, open } from '@tauri-apps/plugin-dialog';

export const openImageDialog = async (): Promise<FileResponse[] | null> =>
  open({
    filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }],
    multiple: true,
  });

export const openDirectoryDialog = async (): Promise<string | null> =>
  open({ directory: true });
