/**
 * Standard result format for all AI operations (GPT, image, video, song generation)
 */
export interface OperationResult<T = any> {
  /** The original operation result data */
  result: T;
  /** Final credit amount (pre-set or margin-adjusted) */
  credits: number;
  /** Request ID for tracking and cost analysis */
  requestId: string;
  /** Whether margin pricing was applied */
  isMarginBased: boolean;
}

/**
 * GPT operation specific result
 */
export interface GPTResult extends OperationResult<string> {
  /** The GPT response text */
  result: string;
}

/**
 * Image generation operation result
 */
export interface ImageResult extends OperationResult<{
  url: string;
  width: number;
  height: number;
  pixels: number;
}> {}

/**
 * Video generation operation result  
 */
export interface VideoResult extends OperationResult<{
  url: string;
  duration: number;
  aspectRatio: string;
  mode: string;
  version: string;
}> {}

/**
 * Song generation operation result
 */
export interface SongResult extends OperationResult<{
  jobId: string;
  music: {
    musicId: string;
    title: string;
    audioUrl: string;
    duration: number;
  };
}> {}