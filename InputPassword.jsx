import { useState, forwardRef } from "react";

const InputPassword = forwardRef(({
    label,
    className = "",
    placeholder = "",
    value,
    defaultValue = "",
    onChange,
    id,
    ...props
}, ref) => {
    /**
     * Menentukan apakah komponen menggunakan mode controlled.
     * Jika prop `value` tersedia, maka state dikontrol oleh parent component.
     */
    const isControlled = value !== undefined;
    /**
     * State internal untuk menyimpan nilai input ketika komponen digunakan dalam mode uncontrolled.
     */
    const [internalValue, setInternalValue] = useState(defaultValue);
    /** State untuk menentukan apakah password ditampilkan dalam bentuk teks biasa atau disembunyikan. */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Nilai input aktif.
     * - Controlled  → menggunakan prop `value`
     * - Uncontrolled → menggunakan state internal
     */
    const inputValue = isControlled ? value : internalValue;

    /**
     * Handler perubahan input.
     * - Memperbarui state internal jika uncontrolled
     * - Menjalankan callback `onChange` dari parent jika tersedia
     */
    const handleChange = (e) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
    };

    return (
        <div className={`form-floating position-relative ${className || "mb-3"}`}>
            <input
                ref={ref}
                {...props}
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                value={inputValue}
                className="form-control rounded-4 px-3"
                id={id}
                required
                placeholder={placeholder}
            />
            <label className="ms-1" htmlFor={id}>{label}</label>
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="position-absolute top-50 end-0 translate-middle-y me-3 border-0 btn btn-light btn-icon"
                tabIndex={-1}
            >
                {showPassword
                    ? <i className="bi bi-eye-slash" />
                    : <i className="bi bi-eye" />}
            </button>
        </div>
    );
});

InputPassword.displayName = "InputPassword";
export default InputPassword;