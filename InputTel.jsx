import { useState, useRef, useEffect, forwardRef, useId } from "react";
import { createPortal } from "react-dom";
import FlagImg from "./FlagImg";
import { COUNTRIES } from "./constants";

const { Modal } = window.bootstrap;

const InputTel = forwardRef(({
    label = "Nomor Telepon",
    className = "",
    placeholder = "",
    value,
    defaultValue = "",
    onChange,
    id,
    defaultCountry = "ID",
    parentModalId, 
    ...props
}, ref) => {
    const uid         = useId();
    const modalId     = `country-picker-${uid.replace(/:/g, "")}`;
    const dialogLabelId  = `dialog-label-${uid.replace(/:/g, "")}`;
    const searchInputId  = `dialog-search-${uid.replace(/:/g, "")}`;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue]   = useState(defaultValue);
    const [isFocused,     setIsFocused]       = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(
        () => COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
    );
    const [search,       setSearch]       = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const modalRef      = useRef(null);   // ref elemen modal Bootstrap
    const modalInstance = useRef(null);   // instance Bootstrap Modal
    const buttonCloseRef = useRef(null);  // ref tombol close (untuk programmatic close)
    const searchRef     = useRef(null);
    const inputRef      = useRef(null);
    const itemRefs      = useRef([]);
    const isKeyboardNav = useRef(false);

    const inputValue = isControlled ? value : internalValue;

    const filtered = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dialCode.includes(search) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleChange = (e) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
    };

    /** Menutup modal country picker.
     *  Jika ada parentModalId → klik buttonClose yang sudah dikonfigurasi
     *  dengan data-bs-toggle/target sehingga Bootstrap mengembalikan
     *  fokus ke parent modal secara native. */
    const closeDialog = () => {
        if (parentModalId) {
            buttonCloseRef.current?.click();
        } else {
            modalInstance.current?.hide();
        }
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        closeDialog();
    };

    /* ── Bootstrap Modal lifecycle ────────────────────────────────────── */
    useEffect(() => {
        const modalEl = modalRef.current;
        if (!modalEl) return;

        modalInstance.current = new Modal(modalEl, { keyboard: false });

        // Reset state saat modal mulai terbuka
        const onShow = () => {
            setSearch("");
            setFocusedIndex(-1);
            history.pushState({ modal: modalId }, "");
        };

        // Fokus ke search input setelah animasi selesai
        const onShown = () => searchRef.current?.focus();

        // Kembalikan fokus ke trigger input saat modal tertutup
        const onHide = () => {
            if (history.state?.modal === modalId) history.back();
            requestAnimationFrame(() => inputRef.current?.focus());
        };

        // Tutup modal saat tombol back browser ditekan
        const onPopState = () => {
            if (modalEl.classList.contains("show")) closeDialog();
        };

        // Tangani Escape secara manual (keyboard: false di atas menonaktifkan default)
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                closeDialog();
            }
        };

        modalEl.addEventListener("show.bs.modal",   onShow);
        modalEl.addEventListener("shown.bs.modal",  onShown);
        modalEl.addEventListener("hide.bs.modal",   onHide);
        window.addEventListener("popstate",         onPopState);
        window.addEventListener("keydown",          handleEsc);

        return () => {
            modalEl.removeEventListener("show.bs.modal",  onShow);
            modalEl.removeEventListener("shown.bs.modal", onShown);
            modalEl.removeEventListener("hide.bs.modal",  onHide);
            window.removeEventListener("popstate",        onPopState);
            window.removeEventListener("keydown",         handleEsc);
        };
    }, []);

    // Scroll item yang sedang difokus ke tengah layar
    useEffect(() => {
        if (isKeyboardNav.current && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].scrollIntoView({ block: "center", behavior: "smooth" });
        }
        isKeyboardNav.current = false;
    }, [focusedIndex]);

    const handleKeyDown = (e) => {
        if (!filtered.length) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                isKeyboardNav.current = true;
                setFocusedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                isKeyboardNav.current = true;
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
                break;
            case "Enter":
                e.preventDefault();
                if (focusedIndex >= 0) selectCountry(filtered[focusedIndex]);
                break;
            case "Escape":
                e.preventDefault();
                closeDialog();
                break;
        }
    };

    /* ── Portal: Bootstrap Modal (menggantikan native <dialog>) ────────── */
    const countryModal = createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby={dialogLabelId}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
                <div className="modal-content">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="modal-header border-bottom-0 p-3">
                        <div className="form-floating position-relative flex-grow-1">
                            <input
                                id={searchInputId}
                                type="text"
                                ref={searchRef}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setFocusedIndex(-1);
                                }}
                                onKeyDown={handleKeyDown}
                                className="form-control rounded-4 px-3"
                                placeholder="Cari negara atau kode dial..."
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded="true"
                                aria-controls="country-list"
                            />
                            <label className="ms-1" htmlFor={searchInputId} id={dialogLabelId}>
                                <i className="bi bi-search me-2" />
                                Cari negara atau kode dial...
                            </label>
                        </div>

                        {/* Tombol close: kembali ke parent modal atau dismiss biasa */}
                        <button
                            ref={buttonCloseRef}
                            type="button"
                            className="btn-close ms-2 me-0 shadow-none border-0"
                            aria-label="Tutup"
                            {...(parentModalId
                                ? {
                                    "data-bs-toggle": "modal",
                                    "data-bs-target": `#${parentModalId}`,
                                }
                                : {
                                    "data-bs-dismiss": "modal",
                                    "aria-label": "Close",
                                })}
                        />
                    </div>

                    {/* ── Body ────────────────────────────────────────────── */}
                    <div className="modal-body overflow-auto p-3 pt-0">
                        {filtered.length === 0 ? (
                            <div className="text-center text-muted py-4">
                                <i className="bi bi-search d-block mb-2" />
                                <small>Negara tidak ditemukan</small>
                            </div>
                        ) : (
                            <ul
                                id="country-list"
                                role="listbox"
                                aria-label="Pilih negara"
                                className="list-group list-group-flush d-flex flex-column gap-1 p-0 m-0"
                            >
                                {filtered.map((country, index) => {
                                    const isItemSelected = selectedCountry.code === country.code;
                                    const isActive       = focusedIndex === index;
                                    return (
                                        <li
                                            key={country.code}
                                            ref={(el) => (itemRefs.current[index] = el)}
                                            role="option"
                                            aria-selected={isItemSelected}
                                            className={[
                                                "list-group-item list-group-item-action m-0",
                                                "d-flex align-items-center gap-3 px-2 py-2",
                                                "rounded-3 border-0",
                                                isActive ? "active" : "",
                                            ].filter(Boolean).join(" ")}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => selectCountry(country)}
                                            onMouseEnter={() => setFocusedIndex(index)}
                                            onMouseLeave={() => setFocusedIndex(-1)}
                                            {...(parentModalId
                                                ? {
                                                    "data-bs-toggle": "modal",
                                                    "data-bs-target": `#${parentModalId}`,
                                                }
                                                : {
                                                    "data-bs-dismiss": "modal",
                                                })}
                                        >
                                            <FlagImg code={country.code} size={24} />
                                            <span className="flex-grow-1">{country.name}</span>
                                            <span>{country.dialCode}</span>
                                            {isItemSelected && (
                                                <i className="bi bi-check2 text-primary" />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* ── Footer: keyboard hints ──────────────────────────── */}
                    <div className="modal-footer border-top-0">
                        <small className="text-muted d-none d-sm-block">
                            <span className="me-3">
                                <i className="bi bi-arrow-up" />
                                <i className="bi bi-arrow-down ms-1" />
                                <span className="ms-2">Navigasi</span>
                            </span>
                            <span className="me-3">
                                <i className="bi bi-arrow-return-left" />
                                <span className="ms-2">Pilih</span>
                            </span>
                            <span>
                                <kbd className="badge font-monospace">ESC</kbd>
                                <span className="ms-2">Tutup</span>
                            </span>
                        </small>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );

    return (
        <>
            <div
                className={[
                    "input-group rounded-4 input-tel border",
                    isFocused ? "active" : "",
                    className || "mb-3",
                ].filter(Boolean).join(" ")}
            >
                {/* Trigger button: buka country picker modal */}
                <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target={`#${modalId}`}
                    className="btn btn-light d-flex align-items-center gap-2 rounded-start-4"
                    aria-label={`Pilih kode negara, sekarang ${selectedCountry.name} ${selectedCountry.dialCode}`}
                >
                    <FlagImg code={selectedCountry.code} size={20} />
                    <span>{selectedCountry.dialCode}</span>
                </button>

                <div className="form-floating">
                    <input
                        {...props}
                        ref={inputRef}
                        type="number"
                        inputMode="numeric"
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        value={inputValue}
                        className="form-control rounded-4 px-3 rounded-start-0 border-start-0"
                        id={id}
                        required
                        placeholder={placeholder}
                    />
                    <label className="ms-1" htmlFor={id}>{label}</label>
                </div>
            </div>

            {countryModal}
        </>
    );
});

InputTel.displayName = "InputTel";
export default InputTel;