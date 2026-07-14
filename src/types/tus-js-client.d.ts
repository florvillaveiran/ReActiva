declare module 'tus-js-client' {
  export type PreviousUpload = unknown;

  export type UploadOptions = {
    endpoint: string;
    retryDelays?: number[];
    headers?: Record<string, string>;
    uploadDataDuringCreation?: boolean;
    removeFingerprintOnSuccess?: boolean;
    chunkSize?: number;
    metadata?: Record<string, string>;
    onError?: (error: Error) => void;
    onProgress?: (uploaded: number, total: number) => void;
    onSuccess?: () => void;
  };

  export class Upload {
    constructor(file: File, options: UploadOptions);
    findPreviousUploads(): Promise<PreviousUpload[]>;
    resumeFromPreviousUpload(previousUpload: PreviousUpload): void;
    start(): void;
  }
}
