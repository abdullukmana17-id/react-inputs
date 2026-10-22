import { useState, useRef, forwardRef } from "react";

/**
 * Komponen InputColor
 * ------------------------------------------------------
 * Komponen input warna berbasis <input type="color">
 * dengan dukungan:
 *
 * - Controlled & uncontrolled mode
 * - Preview nilai warna HEX
 * - Forwarded ref
 * - Bootstrap floating label
 *
 * @param {Object} props - Properti komponen
 * @param {string} props.label - Label input
 * @param {string} [props.className=""] - Class tambahan wrapper
 * @param {string} props.value - Nilai warna (controlled mode)
 * @param {string} [props.defaultValue="#000000"] - Nilai default warna
 * @param {Function} props.onChange - Callback saat warna berubah
 * @param {string} props.id - ID input
 * @param {React.Ref} ref - Ref dari parent component
 */
const InputColor = forwardRef(({
    label,
    className = "",
    value,
    defaultValue = "#000000",
    onChange,
    id,
    ...props
}, ref) => {

    /**
     * Controlled mode aktif jika prop `value`
     * diberikan oleh parent component.
     */
    const isControlled = value !== undefined;
    /** State internal warna untuk uncontrolled mode. */
    const [internalValue, setInternalValue] = useState(defaultValue);
    /** Referensi elemen input color. */
    const inputRef = useRef(null);
    /**
     * Nilai warna aktif saat ini.
     *
     * Prioritas:
     * 1. value dari parent (controlled)
     * 2. internal state (uncontrolled)
     */
    const inputValue = isControlled ? value : internalValue;

    /** Handler ketika warna berubah. */
    const handleChange = (e) => {
        /** Update state internal jika menggunakan uncontrolled mode */
        if (!isControlled) setInternalValue(e.target.value);
        /** Kirim event ke parent component */
        onChange?.(e);
    };

    return (
        <div className={`form-floating ${className || "mb-3"} position-relative d-flex align-items-center gap-2`}>
            <input
                ref={inputRef}
                type="color"
                onChange={handleChange}
                value={inputValue}
                className="form-control form-control-color rounded-4 px-2 w-100 position-relative"
                id={id}
                title="Pilih warna"
                {...props}
            />
            <label htmlFor={id} className="position-absolute top-50 translate-middle-y z-1 ps-3 px-2">
                {label}
            </label>
            {inputValue && (
                <span className="position-absolute top-50 translate-middle-y me-5 end-0">
                    <code>{inputValue}</code>
                </span>
            )}
        </div>
    );
});

InputColor.displayName = "InputColor";
export default InputColor;