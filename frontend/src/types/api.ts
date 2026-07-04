export interface PassportResult{original_filename:string;output_filename?:string;download_url?:string;success:boolean;message:string;face_count:number}
export interface BatchResponse{total:number;succeeded:number;failed:number;results:PassportResult[];zip_download_url?:string}
export type Theme='light'|'dark';
