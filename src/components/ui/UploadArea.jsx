import { useRef, useState } from "react";

/**
 * UploadArea — drag-and-drop / click file upload zone.
 * Props: onFile(file), accept, maxMB, label
 */
export default function UploadArea({
  onFile,
  accept = "image/*",
  maxMB = 20,
  label = "Drop file here or click to upload",
  sublabel,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large. Max ${maxMB}MB.`);
      return;
    }
    setError(null);
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload area"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--glass-border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "48px 24px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? "var(--accent-soft)" : "var(--bg-card)",
        transition: "var(--transition)",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sublabel}</div>
      )}
      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--red)" }}>{error}</div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
