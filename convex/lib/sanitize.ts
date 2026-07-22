import sanitizeHtml, { IOptions, DisallowedTagsModes } from "sanitize-html";

const SANITIZE_OPTIONS: IOptions = {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {},
  disallowedTagsMode: "discard" as DisallowedTagsModes,
  allowedIframeHostnames: [],
};

const SANITIZE_PLAIN_TEXT: IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard" as DisallowedTagsModes,
};

export function sanitizeHtmlContent(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, SANITIZE_OPTIONS);
}

export function sanitizePlainText(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, SANITIZE_PLAIN_TEXT).trim();
}

export function sanitizeDescription(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

export function sanitizeBio(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "p", "br"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

export function sanitizeName(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, SANITIZE_PLAIN_TEXT).trim();
}

export function sanitizeAddress(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, SANITIZE_PLAIN_TEXT).trim();
}

export function sanitizeFeatures(input: string[]): string[] {
  return input
    .map((f) => sanitizePlainText(f))
    .filter((f) => f.length > 0 && f.length <= 50);
}