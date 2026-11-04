export function safeUrl(value: string): string {
  try {
    if (
      /[\u0000-\u0020\u007f]/.test(value) ||
      value.startsWith("//") ||
      value.includes("\\")
    )
      return "#";
    const url = new URL(value, "https://templatehub.example");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? value
      : "#";
  } catch {
    return "#";
  }
}
