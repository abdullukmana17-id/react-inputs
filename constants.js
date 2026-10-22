export const COUNTRIES = [
    { code: "ID", dialCode: "+62", name: "Indonesia" },
    { code: "US", dialCode: "+1", name: "United States" },
    { code: "GB", dialCode: "+44", name: "United Kingdom" },
    { code: "AU", dialCode: "+61", name: "Australia" },
    { code: "SG", dialCode: "+65", name: "Singapore" },
    { code: "MY", dialCode: "+60", name: "Malaysia" },
    { code: "IN", dialCode: "+91", name: "India" },
    { code: "JP", dialCode: "+81", name: "Japan" },
    { code: "KR", dialCode: "+82", name: "South Korea" },
    { code: "CN", dialCode: "+86", name: "China" },
    { code: "DE", dialCode: "+49", name: "Germany" },
    { code: "FR", dialCode: "+33", name: "France" },
    { code: "IT", dialCode: "+39", name: "Italy" },
    { code: "ES", dialCode: "+34", name: "Spain" },
    { code: "BR", dialCode: "+55", name: "Brazil" },
    { code: "CA", dialCode: "+1", name: "Canada" },
    { code: "MX", dialCode: "+52", name: "Mexico" },
    { code: "SA", dialCode: "+966", name: "Saudi Arabia" },
    { code: "AE", dialCode: "+971", name: "UAE" },
    { code: "TH", dialCode: "+66", name: "Thailand" },
    { code: "VN", dialCode: "+84", name: "Vietnam" },
    { code: "PH", dialCode: "+63", name: "Philippines" },
    { code: "PK", dialCode: "+92", name: "Pakistan" },
    { code: "NL", dialCode: "+31", name: "Netherlands" },
    { code: "ZA", dialCode: "+27", name: "South Africa" },
];

export const FILE_ICONS = {
    image: { icon: "bi-file-image", bg: "bg-purple bg-opacity-10", text: "text-purple" },
    pdf:   { icon: "bi-file-pdf",   bg: "bg-danger bg-opacity-10",  text: "text-danger" },
    word:  { icon: "bi-file-word",  bg: "bg-primary bg-opacity-10", text: "text-primary" },
    excel: { icon: "bi-file-spreadsheet", bg: "bg-success bg-opacity-10", text: "text-success" },
    video: { icon: "bi-file-play",  bg: "bg-warning bg-opacity-10", text: "text-warning" },
    audio: { icon: "bi-file-music", bg: "bg-info bg-opacity-10",    text: "text-info" },
    zip:   { icon: "bi-file-zip",   bg: "bg-secondary bg-opacity-10", text: "text-secondary" },
    file:  { icon: "bi-file-earmark", bg: "bg-secondary bg-opacity-10", text: "text-secondary" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const getIconType = (file) => {
    const t = file.type;
    if (t.startsWith("image/")) return "image";
    if (t === "application/pdf") return "pdf";
    if (t.includes("word") || t.includes("document") ||
        file.name.endsWith(".docx") || file.name.endsWith(".doc")) return "word";
    if (t.includes("excel") || t.includes("spreadsheet") ||
        file.name.endsWith(".xlsx") || file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")) return "excel";
    if (t.startsWith("video/")) return "video";
    if (t.startsWith("audio/")) return "audio";
    if (t.includes("zip") || t.includes("rar") || t.includes("tar") ||
        t.includes("compressed")) return "zip";
    return "file";
};

export const fmtSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export const fmtExt = (file) => {
    const ext = file.name.split(".").pop().toUpperCase();
    return ext || file.type.split("/").pop().toUpperCase();
};