import { useState, Fragment } from "react";

/**
 * Komponen InputCheckbox
 * ------------------------------------------------------
 * Komponen checkbox custom berbasis list-group Bootstrap
 * yang mendukung:
 *
 * - Multiple selection
 * - Controlled & uncontrolled mode
 * - Read-only mode
 * - Custom styling
 * - Accessibility attributes
 *
 * @param {Object} props - Properti komponen
 * @param {string} props.label - Label utama input
 * @param {string} [props.className=""] - Class tambahan wrapper
 * @param {Array} props.value - Nilai checkbox aktif (controlled mode)
 * @param {Function} props.onChange - Callback saat nilai berubah
 * @param {string} props.id - ID input
 * @param {Array} [props.options=[]] - Daftar opsi checkbox
 * @param {boolean} [props.readOnly=false] - Mode hanya baca
 */
const InputCheckbox = ({
    label,
    className = "",
    value,
    onChange,
    id,
    options = [],
    readOnly = false,
}) => {
    /**
     * Controlled mode terjadi ketika prop `value`
     * dikirim dari parent component.
     */
    const isControlled = value !== undefined;
    /** Digunakan hanya jika parent tidak mengontrol value. */
    const [internalValue, setInternalValue] = useState([]);

    /**
     * Nilai aktif checkbox saat ini.
     *
     * Prioritas:
     * 1. value dari parent (controlled)
     * 2. state internal (uncontrolled)
     */
    const currentVal = isControlled
        ? (Array.isArray(value) ? value : [])
        : (Array.isArray(internalValue) ? internalValue : []);

    /**
     * Mengaktifkan / menonaktifkan opsi checkbox.
     *
     * @param {*} optVal - Value opsi checkbox
     */
    const handleToggle = (optVal) => {
        /** Hentikan interaksi jika mode readonly aktif */
        if (readOnly) return;
        
        /**
         * Jika value sudah ada:
         * → hapus dari array
         *
         * Jika belum ada:
         * → tambahkan ke array
         */
        const next = currentVal.includes(optVal)
            ? currentVal.filter((v) => v !== optVal)
            : [...currentVal, optVal];

        /** Update state internal jika uncontrolled mode */
        if (!isControlled) setInternalValue(next);

        /** Kirim event perubahan ke parent component. */
        onChange?.({ target: { value: next, id } });
    };

    return (
        <div className={`${className || "mb-3"}`}>
            <div className={`list-group list-group-form border border-secondary-subtle d-flex flex-column p-1 gap-1 bg-white rounded-4${readOnly ? " opacity-75" : ""}`}>
                <li className="list-group-item">
                    <p className="mb-0">{label} {readOnly ? '(Hanya Baca)' : ''}</p>
                </li>
                {options.map((opt, index) => {
                    const isChecked = currentVal.includes(opt.value);
                    return (
                        <Fragment key={opt.value}>
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={isChecked}
                                onClick={() => handleToggle(opt.value)}
                                disabled={readOnly}
                                style={{ 
                                    borderRadius: "calc(.75rem)",
                                    cursor: readOnly ? "default" : "pointer",
                                    pointerEvents: readOnly ? "auto" : "auto"
                                }}
                                className={`list-group-item list-group-item-action d-flex align-items-center gap-3${isChecked && !readOnly ? " active" : ""}${readOnly ? " pe-none" : ""}`}
                                aria-current={isChecked}
                                aria-readonly={readOnly}
                            >
                                <i className={`bi bi-check-square${isChecked ? "-fill" : " opacity-25"} flex-shrink-0 fs-5`} />
                                {opt.label}
                            </button>
                            {index < options.length - 1 && (
                                <hr className="mx-2 my-0 opacity-25" />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default InputCheckbox;