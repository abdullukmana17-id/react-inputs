import { useState, Fragment } from "react";

/**
 * Komponen InputRadio
 * ------------------------------------------------------
 * Komponen radio custom berbasis list-group Bootstrap
 * yang mendukung:
 *
 * - Single selection
 * - Controlled & uncontrolled mode
 * - Custom styling
 * - Accessibility attributes
 *
 * @param {Object} props - Properti komponen
 * @param {string} props.label - Label utama input
 * @param {string} [props.className=""] - Class tambahan wrapper
 * @param {string} props.value - Nilai radio aktif (controlled mode)
 * @param {string} [props.defaultValue=""] - Nilai awal (uncontrolled mode)
 * @param {Function} props.onChange - Callback saat pilihan berubah
 * @param {string} props.id - ID grup radio
 * @param {Array} [props.options=[]] - Daftar opsi radio
 */
const InputRadio = ({
    label,
    className = "",
    value,
    defaultValue = "",
    onChange,
    id,
    options = [],
}) => {
    /** Menentukan apakah komponen berjalan dalam mode controlled. */
    const isControlled = value !== undefined;
    /** State internal untuk mode uncontrolled. */
    const [internalValue, setInternalValue] = useState(defaultValue);

    /** Nilai aktif saat ini. */
    const currentVal = isControlled ? value : internalValue;

    /**
     * Handler ketika salah satu opsi dipilih.
     *
     * @param {string} optVal
     * Nilai opsi yang dipilih.
     */
    const handleSelect = (optVal) => {
        if (!isControlled) setInternalValue(optVal);
        /** Menjalankan callback onChange dengan format menyerupai event native. */
        onChange?.({ target: { value: optVal, id } });
    };

    return (
        <div className={`${className || "mb-3"}`}>
            <div className="list-group list-group-form border border-secondary-subtle d-flex flex-column p-1 gap-1 bg-white rounded-4">
                <li className="list-group-item">
                    <p className="mb-0">{label}</p>
                </li>
                {options.map((opt, index) => {
                    const isSelected = currentVal === opt.value;
                    return (
                        <Fragment key={opt.value}>
                            <li
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => handleSelect(opt.value)}
                                style={{ borderRadius: "calc(.75rem)" }}
                                className={`list-group-item list-group-item-action d-flex align-items-center gap-3${isSelected ? " active" : ""}`}
                                aria-current={isSelected}
                            >
                                <div className={`icon rounded-2 ${isSelected ? "" : "opacity-50"}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-grow-1">
                                    {opt.label}
                                </div>
                                <i className={`bi bi-check-square${isSelected ? "-fill" : " opacity-25"} fs-5 ms-auto`} />
                            </li>
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

export default InputRadio;