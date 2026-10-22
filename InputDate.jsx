import { useState, forwardRef } from "react";

/**
 * Komponen InputDate
 * ------------------------------------------------------
 * Komponen input tanggal/waktu berbasis Bootstrap
 * dengan dukungan:
 *
 * - Controlled & uncontrolled mode
 * - Forwarded ref
 * - Floating label
 * - Mendukung berbagai tipe input date
 *
 * Contoh type:
 * - date
 * - datetime-local
 * - time
 * - month
 *
 * @param {Object} props - Properti komponen
 * @param {string} props.label - Label input
 * @param {string} [props.className=""] - Class tambahan wrapper
 * @param {string} [props.type="date"] - Tipe input HTML
 * @param {string} [props.placeholder=""] - Placeholder input
 * @param {string} props.value - Nilai input (controlled mode)
 * @param {string} [props.defaultValue=""] - Nilai default input
 * @param {Function} props.onChange - Callback saat nilai berubah
 * @param {string} props.id - ID input
 * @param {React.Ref} ref - Ref input dari parent component
 */
const InputDate = forwardRef(({
    label,
    className = "",
    type = "date",
    placeholder = "",
    value,
    defaultValue = "",
    onChange,
    id,
    ...props
}, ref) => {
    /**
     * Controlled mode aktif jika prop `value`
     * diberikan oleh parent component.
     */
    const isControlled = value !== undefined;
    /** State internal input untuk uncontrolled mode. */
    const [internalValue, setInternalValue] = useState(defaultValue);
    /**
     * Nilai aktif input saat ini.
     *
     * Prioritas:
     * 1. value dari parent (controlled)
     * 2. internal state (uncontrolled)
     */
    const inputValue = isControlled ? value : internalValue;

    /**
     * Handler ketika nilai input berubah.
     *
     * @param {Event} e - Event perubahan input
     */
    const handleChange = (e) => {
        /** Update state internal jika menggunakan uncontrolled mode */
        if (!isControlled) setInternalValue(e.target.value);
        /** Kirim event perubahan ke parent */
        onChange?.(e);
    };

    return (
        <div className={`form-floating position-relative ${className || "mb-3"}`}>
            <input
                ref={ref}
                {...props}
                type={type}
                onChange={handleChange}
                value={inputValue}
                className="form-control rounded-4 px-3"
                id={id}
                required
                placeholder={placeholder}
            />
            <label className="ms-1" htmlFor={id}>{label}</label>
        </div>
    );
});

InputDate.displayName = "InputDate";
export default InputDate;