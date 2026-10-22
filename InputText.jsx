import { useState, forwardRef } from "react";

/**
 * Komponen InputText reusable berbasis Bootstrap.
 *
 * Mendukung controlled dan uncontrolled mode.
 *
 * @param {Object} props
 * @param {string|React.ReactNode} props.label
 * @param {string} [props.className=""]
 * @param {string} [props.type="text"]
 * @param {string} [props.placeholder=""]
 * @param {string} [props.value]
 * @param {string} [props.defaultValue=""]
 * @param {Function} [props.onChange]
 * @param {string} props.id
 */
const InputText = forwardRef(function InputText(
    {
        label,
        className = "",
        type = "text",
        placeholder = " ",
        value,
        defaultValue = "",
        onChange,
        id,
        ...props
    },
    ref
) {
    const isControlled = value !== undefined;

    const [internalValue, setInternalValue] = useState(
        () => defaultValue ?? ""
    );

    const inputValue = isControlled
        ? value ?? ""
        : internalValue;

    const handleChange = (event) => {
        if (!isControlled) {
            setInternalValue(event.target.value);
        }

        onChange?.(event);
    };

    return (
        <div className={`form-floating ${className || "mb-3"}`}>
            <input
                {...props}
                ref={ref}
                id={id}
                type={type}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleChange}
                className={`form-control rounded-4 px-3 ${props.className ?? ""}`.trim()}
                required={props.required}
            />

            {label != null && (
                <label className="ms-1" htmlFor={id}>
                    {label}
                </label>
            )}
        </div>
    );
});

InputText.displayName = "InputText";

export default InputText;