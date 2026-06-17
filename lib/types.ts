export type FileStatus = "pending" | "converting" | "done" | "error";

export interface FileJob {
  id:          string;
  file:        File;
  status:      FileStatus;
  progress:    number;   // 0-100
  statusMsg:   string;
  result?:     Blob;
  resultName?: string;
  error?:      string;
}

export interface ImageResizeOpts {
  width?:      number;
  height?:     number;
  keepAspect:  boolean;
}
