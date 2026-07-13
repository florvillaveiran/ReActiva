import * as tus from 'tus-js-client';
import { supabase } from './supabase';

interface ResumableUploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (percentage: number) => void;
}

const resumableEndpoint = () => {
  const configuredUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  if (!configuredUrl) throw new Error('Supabase no está configurado para subir videos.');

  const url = new URL(configuredUrl);
  if (url.hostname.endsWith('.supabase.co')) {
    url.hostname = url.hostname.replace(/\.supabase\.co$/, '.storage.supabase.co');
  }
  url.pathname = '/storage/v1/upload/resumable';
  url.search = '';
  url.hash = '';
  return url.toString();
};

export const uploadResumableStorageFile = async ({
  bucket,
  path,
  file,
  onProgress,
}: ResumableUploadOptions) => {
  if (!supabase) throw new Error('Supabase no está configurado para subir videos.');

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new Error('Tu sesión venció. Volvé a iniciar sesión antes de subir el video.');
  }

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: resumableEndpoint(),
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
        'x-upsert': 'true',
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: file.type || 'video/mp4',
        cacheControl: '3600',
      },
      onError: (uploadError) => reject(uploadError),
      onProgress: (uploaded, total) => {
        const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
        onProgress?.(percentage);
      },
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads()
      .then(previousUploads => {
        if (previousUploads.length > 0) upload.resumeFromPreviousUpload(previousUploads[0]);
        upload.start();
      })
      .catch(reject);
  });

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};
