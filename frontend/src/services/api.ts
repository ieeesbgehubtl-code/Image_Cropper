import axios from 'axios';import type {BatchResponse,PassportResult} from '../types/api';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL??''});
const form=(files:File[],background:string)=>{const f=new FormData();files.forEach(file=>f.append(files.length===1?'file':'files',file));f.append('background',background);return f};
export async function processSingle(file:File,background:string){const {data}=await api.post<PassportResult>('/api/passport/single',form([file],background));return data}
export async function processMultiple(files:File[],background:string){const {data}=await api.post<BatchResponse>('/api/passport/multiple',form(files,background));return data}
export async function processZip(file:File,background:string){const f=new FormData();f.append('file',file);f.append('background',background);const {data}=await api.post<BatchResponse>('/api/passport/zip',f);return data}
export const downloadUrl=(path?:string)=>path?`${api.defaults.baseURL}${path}`:'#';
export async function cleanup(){const {data}=await api.delete('/api/cleanup');return data}
