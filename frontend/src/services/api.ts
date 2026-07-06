import axios from "axios";
import type { BatchResponse, PassportResult } from "../types/api";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001",
});
const form = (files: File[], background: string) => {
  const f = new FormData();
  files.forEach((file) =>
    f.append(files.length === 1 ? "file" : "files", file),
  );
  f.append("background", background);
  return f;
};
export async function processSingle(file: File, background: string) {
  const { data } = await api.post<PassportResult>(
    "/api/passport/single",
    form([file], background),
  );
  return data;
}
export async function processMultiple(files: File[], background: string) {
  const { data } = await api.post<BatchResponse>(
    "/api/passport/multiple",
    form(files, background),
  );
  return data;
}
export async function processZip(file: File, background: string) {
  const f = new FormData();
  f.append("file", file);
  f.append("background", background);
  const { data } = await api.post<BatchResponse>("/api/passport/zip", f);
  return data;
}
export const downloadUrl = (path?: string) =>
  path ? `${api.defaults.baseURL}${path}` : "#";
export const downloadUrlWithFilename = (path?: string, filename?: string) => {
  if (!path) return "#";
  const url = downloadUrl(path);
  if (!filename?.trim()) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}filename=${encodeURIComponent(filename.trim())}`;
};
export const downloadZipUrlWithFilenames = (
  path?: string,
  filenames?: Record<string, string>,
) => {
  if (!path) return "#";
  const url = downloadUrl(path);
  if (!filenames || !Object.keys(filenames).length) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}filenames=${encodeURIComponent(JSON.stringify(filenames))}`;
};
export async function cleanup() {
  const { data } = await api.delete("/api/cleanup");
  return data;
}
