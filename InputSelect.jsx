import {
    useState,
    Fragment,
    useRef,
    useId,
    useEffect,
    cloneElement,
} from "react";

const { Modal } = window.bootstrap;

import Input from ".";
import ModalPortal from "./ModalPortal";

/**
 * Komponen InputRadio
 * ------------------------------------------------------
 * Komponen radio / checkbox selection berbasis modal Bootstrap.
 *
 * Fitur:
 * - Single & multiple selection
 * - Controlled & uncontrolled mode
 * - Search filtering
 * - Keyboard navigation (panah, Enter/Space, Escape)
 * - Hover focus
 * - Modal integration
 * - Custom trigger button
 * - Touch & accessibility support
 * - Arabic text support
 * - Dynamic option rendering
 */
const InputRadio = ({
    label,
    className = "",
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder,
    parentModalId,
    isMultiple = false,
    isArabic = false,
    enableSearch = true,
    customButton = null,
}) => {
    const resolvedDefault = defaultValue ?? (isMultiple ? [] : "");
    const isControlled = value !== undefined;

    const [internalValue, setInternalValue] = useState(resolvedDefault);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const id = useId();

    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const inputRef = useRef(null);
    const itemRefs = useRef([]);
    const buttonClose = useRef(null);

    /** Menyimpan fungsi/data terbaru agar listener di effect tidak basi. */
    const latest = useRef({});

    const currentVal = isControlled ? value : internalValue;

    const selectedValues = isMultiple
        ? Array.isArray(currentVal)
            ? currentVal
            : []
        : [];

    /** Mengecek apakah opsi dipilih. */
    const isSelected = (optVal) =>
        isMultiple
            ? selectedValues.includes(optVal)
            : currentVal === optVal;

    /** Menutup modal. */
    const closeModal = () => {
        if (parentModalId) {
            buttonClose.current?.click();
        } else {
            modalInstance.current?.hide();
        }
    };

    /** Memilih atau membatalkan pilihan. */
    const handleSelect = (optVal) => {
        let nextVal;

        if (isMultiple) {
            nextVal = isSelected(optVal)
                ? selectedValues.filter((item) => item !== optVal)
                : [...selectedValues, optVal];
        } else {
            nextVal = optVal;
        }

        if (!isControlled) {
            setInternalValue(nextVal);
        }

        onChange?.({
            target: {
                value: nextVal,
                id,
            },
        });

        if (!isMultiple) {
            closeModal();
        }
    };

    /** Label pada tombol pemicu. */
    const triggerLabel = (() => {
        if (isMultiple) {
            if (!selectedValues.length) return null;

            const selected = options.filter((option) =>
                selectedValues.includes(option.value)
            );

            return selected.length === 1
                ? selected[0].label
                : `${selected.length} dipilih`;
        }

        return (
            options.find((option) => option.value === currentVal)?.label ??
            null
        );
    })();

    /** Filter opsi pencarian. */
    const filteredOptions = enableSearch
        ? options.filter((option) =>
            String(option.label ?? "")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : options;

    /** Buang referensi sisa jika daftar menyusut akibat pencarian. */
    itemRefs.current.length = filteredOptions.length;

    /**
     * Memindahkan fokus ke opsi secara langsung.
     * Tidak mengubah pilihan.
     * `scroll` dimatikan saat hover agar daftar tidak melompat.
     */
    const focusOption = (index, scroll = true) => {
        const total = latest.current.filteredOptions?.length ?? 0;

        if (index < 0 || index >= total) return;

        setActiveIndex(index);

        const item = itemRefs.current[index];

        if (item) {
            item.focus({ preventScroll: true });

            if (scroll) {
                item.scrollIntoView({
                    block: "nearest",
                });
            }
        }
    };

    latest.current = {
        filteredOptions,
        focusOption,
        closeModal,
        enableSearch,
    };

    /** Lifecycle modal Bootstrap. */
    useEffect(() => {
        const modalEl = modalRef.current;
        if (!modalEl) return;

        const instance = new Modal(modalEl, {
            keyboard: false,
        });

        modalInstance.current = instance;

        /** Escape ditangani hanya di sini (tidak dobel). */
        const onKeyDown = (event) => {
            if (
                event.key === "Escape" &&
                modalEl.classList.contains("show")
            ) {
                event.preventDefault();
                latest.current.closeModal();
            }
        };

        const onShow = () => {
            window.history.pushState({ modal: id }, "");
        };

        const onHide = () => {
            if (window.history.state?.modal === id) {
                window.history.back();
            }
        };

        const onPopState = () => {
            if (modalEl.classList.contains("show")) {
                instance.hide();
            }
        };

        const onShown = () => {
            const { enableSearch: search, filteredOptions, focusOption } =
                latest.current;

            if (search) {
                inputRef.current?.focus();
            } else if (filteredOptions.length > 0) {
                focusOption(0);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("popstate", onPopState);

        modalEl.addEventListener("shown.bs.modal", onShown);
        modalEl.addEventListener("show.bs.modal", onShow);
        modalEl.addEventListener("hide.bs.modal", onHide);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("popstate", onPopState);

            modalEl.removeEventListener("shown.bs.modal", onShown);
            modalEl.removeEventListener("show.bs.modal", onShow);
            modalEl.removeEventListener("hide.bs.modal", onHide);

            instance.dispose();

            if (modalInstance.current === instance) {
                modalInstance.current = null;
            }
        };
    }, [id]);

    /**
     * Reset indeks ketika pencarian berubah.
     * JANGAN mengosongkan itemRefs di sini, karena ref callback
     * sudah terpasang sebelum effect berjalan.
     */
    useEffect(() => {
        setActiveIndex(0);
    }, [search]);

    /**
     * Navigasi keyboard.
     * Panah memindahkan fokus, Enter/Space memilih opsi.
     * (Escape ditangani listener window.)
     */
    const handleKeyDown = (event) => {
        const { key, target } = event;

        if (!filteredOptions.length) return;

        const isSearchInput =
            target === inputRef.current ||
            target.closest?.("input, textarea, select");

        if (key === "ArrowDown" || key === "ArrowUp") {
            event.preventDefault();

            const focusedIndex = itemRefs.current.findIndex(
                (item) => item === document.activeElement
            );

            let nextIndex;

            if (isSearchInput) {
                nextIndex =
                    key === "ArrowDown"
                        ? 0
                        : filteredOptions.length - 1;
            } else {
                const currentIndex =
                    focusedIndex >= 0 ? focusedIndex : activeIndex;

                /** Panah atas di opsi pertama kembali ke input pencarian. */
                if (
                    key === "ArrowUp" &&
                    currentIndex === 0 &&
                    enableSearch
                ) {
                    inputRef.current?.focus();
                    return;
                }

                const direction = key === "ArrowDown" ? 1 : -1;

                nextIndex = Math.max(
                    0,
                    Math.min(
                        filteredOptions.length - 1,
                        currentIndex + direction
                    )
                );
            }

            focusOption(nextIndex);
            return;
        }

        /** Jangan memilih opsi ketika fokus masih berada di input. */
        if (isSearchInput) return;

        if (key === "Enter" || key === " ") {
            const focusedIndex = itemRefs.current.findIndex(
                (item) => item === document.activeElement
            );

            if (focusedIndex < 0) return;

            event.preventDefault();

            const option = filteredOptions[focusedIndex];

            if (option) {
                handleSelect(option.value);
            }
        }
    };

    /** Properti pemicu modal. */
    const modalTriggerProps = {
        "data-bs-toggle": "modal",
        "data-bs-target": `#${id}`,
    };

    /** Render tombol pemicu. */
    const renderTrigger = () => {
        if (customButton) {
            return typeof customButton === "function"
                ? customButton({
                    ...modalTriggerProps,
                    triggerLabel,
                })
                : cloneElement(customButton, modalTriggerProps);
        }

        return (
            <button
                {...modalTriggerProps}
                type="button"
                className={`${className || "mb-3"} card w-100 rounded-4 bg-white form-card justify-content-center`}
            >
                <div className="card-body py-0 px-3 flex-grow-0 d-flex align-items-center flex-nowrap gap-3 justify-content-between">
                    <p className="m-0 text-muted font-sans text-truncate">
                        {label}
                    </p>

                    {triggerLabel && (
                        <span className="badge text-truncate">
                            {triggerLabel}
                        </span>
                    )}
                </div>
            </button>
        );
    };

    return (
        <>
            {renderTrigger()}

            <ModalPortal>
                <div
                    ref={modalRef}
                    className="modal fade"
                    id={id}
                    tabIndex="-1"
                    aria-labelledby={`${id}Label`}
                    aria-hidden="true"
                    onKeyDown={handleKeyDown}
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
                        <div className="modal-content">
                            <div className="modal-header border-bottom-0">
                                {enableSearch ? (
                                    <Input
                                        ref={inputRef}
                                        className="flex-grow-1"
                                        type="text"
                                        label={
                                            <>
                                                <i className="bi bi-search me-2" />
                                                {placeholder}
                                            </>
                                        }
                                        placeholder={`Cari ${label}`}
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                    />
                                ) : (
                                    <h5
                                        id={`${id}Label`}
                                        className="m-0 flex-grow-1"
                                    >
                                        {label}
                                    </h5>
                                )}

                                <button
                                    ref={buttonClose}
                                    type="button"
                                    className="btn-close ms-3 border-0 me-0 shadow-none"
                                    aria-label="Tutup"
                                    {...(
                                        parentModalId
                                            ? {
                                                "data-bs-toggle": "modal",
                                                "data-bs-target": `#${parentModalId}`,
                                            }
                                            : {
                                                "data-bs-dismiss": "modal",
                                            }
                                    )}
                                />
                            </div>

                            <div className="modal-body">
                                {filteredOptions.length > 0 ? (
                                    <div
                                        role={
                                            isMultiple
                                                ? "group"
                                                : "radiogroup"
                                        }
                                        className={`list-group list-group-form border border-secondary-subtle d-flex flex-column p-1 gap-1 bg-white rounded-4 ${isArabic ? "arabic" : ""}`}
                                    >
                                        {filteredOptions.map((opt, index) => {
                                            const isItemSelected = isSelected(
                                                opt.value
                                            );

                                            return (
                                                <Fragment key={opt.value}>
                                                    <li
                                                        ref={(element) => {
                                                            itemRefs.current[index] =
                                                                element;
                                                        }}
                                                        tabIndex={-1}
                                                        role={
                                                            isMultiple
                                                                ? "checkbox"
                                                                : "radio"
                                                        }
                                                        aria-checked={
                                                            isItemSelected
                                                        }
                                                        onMouseEnter={() =>
                                                            focusOption(
                                                                index,
                                                                false
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            setActiveIndex(index)
                                                        }
                                                        onClick={() =>
                                                            handleSelect(opt.value)
                                                        }
                                                        className={`list-group-item list-group-item-action d-flex align-items-center gap-3${isItemSelected ? " active" : ""}`}
                                                        aria-current={
                                                            isItemSelected
                                                                ? "true"
                                                                : undefined
                                                        }
                                                    >
                                                        <div
                                                            className={`icon rounded-2 ${isItemSelected ? "" : "opacity-50"}`}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {opt.label}

                                                        <i
                                                            className={`bi bi-check-square${isItemSelected ? "-fill" : " opacity-25"} fs-5 ms-auto`}
                                                            aria-hidden="true"
                                                        />
                                                    </li>

                                                    {index <
                                                        filteredOptions.length - 1 && (
                                                        <hr className="mx-2 my-0 opacity-25" />
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center font-sans">
                                        Data tidak ditemukan
                                    </p>
                                )}
                            </div>

                            <div className="modal-footer border-top-0 d-flex justify-content-between align-items-center">
                                <small className="text-muted d-none d-sm-block">
                                    <span className="me-3">
                                        <i className="bi bi-arrow-up" />
                                        <i className="bi bi-arrow-down ms-1" />
                                        <span className="ms-2">
                                            Navigasi
                                        </span>
                                    </span>

                                    <span className="me-3">
                                        <i className="bi bi-arrow-return-left" />
                                        <span className="ms-2">Pilih</span>
                                    </span>

                                    <span>
                                        <kbd className="badge font-monospace">
                                            ESC
                                        </kbd>
                                        <span className="ms-2">Tutup</span>
                                    </span>
                                </small>

                                {isMultiple && (
                                    <button
                                        type="button"
                                        className="ms-auto btn btn-primary"
                                        onClick={closeModal}
                                    >
                                        Simpan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ModalPortal>
        </>
    );
};

export default InputRadio;