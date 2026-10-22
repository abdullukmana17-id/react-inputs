import { useEffect, useRef } from "react";
import autosize from "autosize";

export default function Textarea({ 
    id, 
    label, 
    placeholder = "",
    value,
    defaultValue = "",
    onChange,
    className,
    ...props 
}) {
  const taRef = useRef(null);

  useEffect(() => {
    autosize(taRef.current);
    return () => autosize.destroy(taRef.current);
  }, []);

  // Trigger autosize update ketika value berubah (controlled mode)
  useEffect(() => {
    if (taRef.current) {
      autosize.update(taRef.current);
    }
  }, [value]);

  // Tentukan apakah controlled atau uncontrolled
  const isControlled = value !== undefined;

  return (
    <div className={`form-floating ${className || 'mb-3'}`}>
      <textarea
        ref={taRef}
        className="form-control rounded-4 px-3"
        placeholder={placeholder}
        id={id}
        {...(isControlled
          ? { value, onChange }
          : { defaultValue, onChange }
        )}
        {...props}
      />
      <label className="ms-1" htmlFor={id}>{label}</label>
    </div>
  );
}