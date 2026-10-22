import { useState, Fragment, useRef, useId, useEffect } from "react";
const { Modal } = window.bootstrap;
import Input from "./index";
import ModalPortal from "./ModalPortal";

const buildInitialValues = (steps, defaultValues = []) =>
    steps.reduce((acc, step, idx) => ({
        ...acc,
        [idx]: defaultValues[idx] !== undefined
            ? defaultValues[idx]
            : step?.isMultiple ? [] : null,
    }), {});

// ✅ DefaultTrigger mengikuti desain InputRadio
const DefaultTrigger = ({ label, className, selectedLabels, steps }) => {
    /** Ringkasan nilai terpilih untuk badge */
    const triggerLabel = (() => {
        const filled = selectedLabels.filter(Boolean);
        if (!filled.length) return null;
        if (filled.length === 1) return filled[0];
        return filled.join(" / ");
    })();

    /** Placeholder: gabung label tiap step jika prop label tidak diberikan */
    const displayLabel = label ?? steps.map((s) => s.label).join(" / ");

    return (
        <button
            type="button"
            className={`${className || "mb-3"} card w-100 rounded-4 bg-white form-card justify-content-center`}
        >
            <div className="card-body py-0 px-3 flex-grow-0 d-flex align-items-center flex-nowrap gap-3 justify-content-between">
                <p className="m-0 text-muted font-sans text-truncate">{displayLabel}</p>
                {triggerLabel && (
                    <span className="badge text-truncate">{triggerLabel}</span>
                )}
            </div>
        </button>
    );
};

const MultiStepInputRadio = ({
    steps = [],
    onComplete,
    className = "",       // ✅ Dipakai oleh DefaultTrigger sebagai className button
    label,                // ✅ Prop baru: label placeholder trigger (opsional)
    renderTrigger,
    requiredSteps = [],
    children,
    onValidationError,
    isSearch = true,
    defaultValues = [],
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [values, setValues] = useState(() =>
        buildInitialValues(steps, defaultValues)
    );
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const itemRefs = useRef([]);
    const buttonClose = useRef(null);
    const inputRef = useRef(null);
    const mainId = useId();

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;
    const currentValue = values[currentStepIndex];
    const isStepRequired = requiredSteps.includes(currentStepIndex);
    const isMultipleSelection = currentStep?.isMultiple || false;
    const isSkippable = currentStep?.isSkippable || false;
    const isNoInput = currentStep?.noInput || false;
    const enableSearch = currentStep?.enableSearch !== false;

    useEffect(() => {
        setValues(buildInitialValues(steps, defaultValues));
    }, [JSON.stringify(defaultValues)]);

    const isSelected = (optVal) =>
        isMultipleSelection
            ? Array.isArray(currentValue) && currentValue.includes(optVal)
            : currentValue === optVal;

    const getAvailableOptions = () => {
        let baseOptions = currentStep?.options || [];
        if (typeof currentStep?.getDynamicOptions === "function") {
            baseOptions = currentStep.getDynamicOptions(values);
        }
        return baseOptions.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    };

    const validateStep = (stepIndex) => {
        const step = steps[stepIndex];
        const isRequired = requiredSteps.includes(stepIndex);
        const value = values[stepIndex];

        if (!isRequired && (step?.isSkippable || step?.noInput)) return { isValid: true };

        if (step?.isMultiple) {
            if (isRequired && (!Array.isArray(value) || value.length === 0))
                return { isValid: false, message: `${step?.label} wajib pilih minimal 1` };
            return { isValid: true };
        }

        if (isRequired && value === null)
            return { isValid: false, message: `${step?.label} wajib diisi` };

        return { isValid: true };
    };

    const handleSelect = (optVal) => {
        if (isMultipleSelection) {
            const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
            const index = newValue.indexOf(optVal);
            if (index > -1) newValue.splice(index, 1);
            else newValue.push(optVal);
            setValues((prev) => ({ ...prev, [currentStepIndex]: newValue }));
            setErrors((prev) => ({ ...prev, [currentStepIndex]: null }));
        } else {
            const newValues = { ...values, [currentStepIndex]: optVal };
            setValues(newValues);
            setErrors((prev) => ({ ...prev, [currentStepIndex]: null }));
            nextStep(newValues);
        }
    };

    const handleSkip = () => {
        const validation = validateStep(currentStepIndex);
        if (!validation.isValid) {
            setErrors((prev) => ({ ...prev, [currentStepIndex]: validation.message }));
            onValidationError?.(validation.message);
            return;
        }
        if (!isLastStep) nextStep();
        else handleSubmit();
    };

    const nextStep = (currentValues = values) => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setSearch("");
            setActiveIndex(0);
        } else {
            handleSubmit(currentValues);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
            setSearch("");
            setActiveIndex(0);
        }
    };

    const handleSubmit = (currentValues = values) => {
        const newErrors = {};
        let isFormValid = true;

        requiredSteps.forEach((stepIdx) => {
            const step = steps[stepIdx];
            const value = currentValues[stepIdx];
            if (step?.isMultiple) {
                if (!Array.isArray(value) || value.length === 0) {
                    newErrors[stepIdx] = `${steps[stepIdx]?.label} wajib diisi`;
                    isFormValid = false;
                }
            } else {
                if (value === null || value === undefined) {
                    newErrors[stepIdx] = `${steps[stepIdx]?.label} wajib diisi`;
                    isFormValid = false;
                }
            }
        });

        if (!isFormValid) {
            setErrors(newErrors);
            onValidationError?.("Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        closeModal(currentValues);
    };

    const closeModal = (finalValues = values) => {
        modalInstance.current?.hide();
        setTimeout(() => {
            setCurrentStepIndex(0);
            setSearch("");
            setActiveIndex(0);
            setErrors({});
            const valuesAsArray = steps.map((_, idx) => finalValues[idx] ?? null);
            onComplete?.(valuesAsArray);
        }, 300);
    };

    // ── selectedLabels per-step (null jika belum dipilih) ────────────────────
    const selectedLabelsByStep = steps.map((step, idx) => {
        const val = values[idx];
        if (step?.isMultiple) {
            if (!Array.isArray(val) || val.length === 0) return null;
        } else {
            if (!val) return null;
        }
        let options = step.options || [];
        if (typeof step?.getDynamicOptions === "function") {
            options = step.getDynamicOptions(values);
        }
        if (step?.isMultiple && Array.isArray(val)) {
            const labels = val
                .map((v) => options.find((o) => o.value === v)?.label)
                .filter(Boolean);
            return labels.length > 0 ? labels.join(", ") : null;
        }
        return options.find((o) => o.value === val)?.label ?? null;
    });

    const selectedLabels = selectedLabelsByStep.filter(Boolean);

    const filteredOptions = getAvailableOptions();

    // ── effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const modalEl = modalRef.current;
        if (!modalEl) return;

        modalInstance.current = new Modal(modalEl, { keyboard: false });

        const handler = (e) => { if (!modalEl.classList.contains("show")) return; handleKeyDown(e); };
        const onShow = () => history.pushState({ modal: mainId }, "");
        const onHide = () => { if (history.state?.modal === mainId) history.back(); };
        const onPopState = () => { if (modalEl.classList.contains("show")) closeModal(); };
        const onShown = () => inputRef.current?.focus();

        window.addEventListener("keydown", handler);
        window.addEventListener("popstate", onPopState);
        modalEl.addEventListener("shown.bs.modal", onShown);
        modalEl.addEventListener("show.bs.modal", onShow);
        modalEl.addEventListener("hide.bs.modal", onHide);

        return () => {
            window.removeEventListener("keydown", handler);
            window.removeEventListener("popstate", onPopState);
            modalEl.removeEventListener("shown.bs.modal", onShown);
            modalEl.removeEventListener("show.bs.modal", onShow);
            modalEl.removeEventListener("hide.bs.modal", onHide);
        };
    }, []);

    useEffect(() => setActiveIndex(0), [search]);
    useEffect(() => {
        itemRefs.current[activeIndex]?.scrollIntoView({ block: "center" });
    }, [activeIndex]);

    const handleKeyDown = (e) => {
        if (!filteredOptions.length) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((p) => p < filteredOptions.length - 1 ? p + 1 : p);
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((p) => p > 0 ? p - 1 : p);
                break;
            case "Enter":
                e.preventDefault();
                if (isMultipleSelection) { if (!isLastStep) nextStep(); else handleSubmit(); }
                else { const s = filteredOptions[activeIndex]; if (s) handleSelect(s.value); }
                break;
            case " ":
                if (isMultipleSelection) {
                    e.preventDefault();
                    const s = filteredOptions[activeIndex];
                    if (s) handleSelect(s.value);
                }
                break;
            case "Escape":
                e.preventDefault();
                closeModal();
                break;
        }
    };

    const modalTriggerProps = {
        "data-bs-toggle": "modal",
        "data-bs-target": `#${mainId}`,
    };

    const triggerProps = {
        selectedLabels,
        selectedLabelsByStep,
        isRequired: requiredSteps.length > 0,
        values,
        steps,
    };

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Trigger ─────────────────────────────────────────────────── */}
            <div {...modalTriggerProps} role="button">
                {renderTrigger
                    ? renderTrigger(triggerProps)
                    : <DefaultTrigger
                        label={label}
                        className={className}
                        selectedLabels={selectedLabelsByStep}
                        steps={steps}
                    />
                }
            </div>

            {/* ── Modal ───────────────────────────────────────────────────── */}
            <ModalPortal>
                <div
                    ref={modalRef}
                    className="modal fade"
                    id={mainId}
                    tabIndex="-1"
                    aria-labelledby={`${mainId}Label`}
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
                        <div className="modal-content">

                            <div className="modal-header border-bottom-0 d-flex align-items-center">
                                <h5 className="m-0 modal-title">
                                    {currentStep?.label}
                                    {isStepRequired && (
                                        <span className="text-muted fw-normal ms-2">(Wajib pilih)</span>
                                    )}
                                </h5>
                                <button
                                    ref={buttonClose}
                                    type="button"
                                    className="btn-close ms-auto border-0 me-0 shadow-none"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                />
                            </div>

                            {errors[currentStepIndex] && (
                                <div className="alert alert-danger m-3 mb-0 rounded-4" role="alert">
                                    <i className="bi bi-exclamation-circle me-2" />
                                    {errors[currentStepIndex]}
                                </div>
                            )}

                            {!isNoInput && (
                                <div className="modal-header border-bottom-0 py-2 d-flex align-items-center gap-3">
                                    {isSearch && enableSearch && (
                                        <Input
                                            ref={inputRef}
                                            onKeyDown={handleKeyDown}
                                            className="flex-grow-1 m-0"
                                            type="text"
                                            label={
                                                <>
                                                    <i className="bi bi-search me-2" />
                                                    {currentStep?.placeholder || `Cari ${currentStep?.label}`}
                                                </>
                                            }
                                            placeholder={`Cari ${currentStep?.label}`}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    )}
                                    <div className="d-flex flex-shrink-0 mx-2 align-items-center gap-2">
                                        {currentStepIndex > 0 && (
                                            <i type="button" className="bi bi-chevron-left small" onClick={prevStep} />
                                        )}
                                        <small className="text-muted">
                                            {currentStepIndex + 1} / {steps.length}
                                        </small>
                                        {!isLastStep && (
                                            <i type="button" className="bi bi-chevron-right small" onClick={nextStep} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isNoInput && (
                                <div className="modal-body">
                                    {filteredOptions.length > 0 ? (
                                        <div className="list-group list-group-form border border-secondary-subtle d-flex flex-column p-1 gap-1 bg-white rounded-4">
                                            {filteredOptions.map((opt, index) => {
                                                const isActive = index === activeIndex;
                                                const isItemSelected = isSelected(opt.value);
                                                return (
                                                    <Fragment key={opt.value}>
                                                        <li
                                                            ref={(el) => (itemRefs.current[index] = el)}
                                                            type="button"
                                                            role={isMultipleSelection ? "checkbox" : "radio"}
                                                            aria-checked={isItemSelected}
                                                            onClick={() => handleSelect(opt.value)}
                                                            className={`list-group-item list-group-item-action d-flex align-items-center gap-3${isItemSelected || isActive ? " active" : ""}`}
                                                            aria-current={isItemSelected}
                                                            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                                        >
                                                            <div className={`icon rounded-2 ${isItemSelected ? "" : "opacity-50"}`}>
                                                                {isMultipleSelection
                                                                    ? <i className={`bi bi-check2-square${isItemSelected ? "-fill" : ""}`} />
                                                                    : index + 1}
                                                            </div>
                                                            <p className="m-0 font-sans small flex-grow-1">{opt.label}</p>
                                                            <i className={`bi bi-check-square${isItemSelected ? "-fill" : " opacity-25"} fs-5`} />
                                                        </li>
                                                        {index < filteredOptions.length - 1 && (
                                                            <hr className="mx-2 my-0 opacity-25" />
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center font-sans text-muted py-4">
                                            Data tidak ditemukan
                                        </p>
                                    )}
                                </div>
                            )}

                            {isNoInput && (
                                <div className="modal-body d-flex align-items-center justify-content-center py-5">
                                    <p className="text-center font-sans text-muted">
                                        {currentStep?.message || "Lanjut ke step berikutnya"}
                                    </p>
                                </div>
                            )}

                            <div className="modal-footer border-top-0 bg-transparent d-flex gap-1">
                                {!isNoInput && isMultipleSelection && (
                                    <small className="text-muted d-none d-sm-flex align-items-center flex-grow-1">
                                        <span className="me-3">
                                            <i className="bi bi-arrow-up" /><i className="bi bi-arrow-down ms-1" />
                                            <span className="ms-2">Navigasi</span>
                                        </span>
                                        <span className="me-3">
                                            <kbd className="badge font-monospace">SPACE</kbd>
                                            <span className="ms-2">Pilih</span>
                                        </span>
                                        <span>
                                            <kbd className="badge font-monospace">ESC</kbd>
                                            <span className="ms-2">Tutup</span>
                                        </span>
                                    </small>
                                )}

                                {!isNoInput && !isMultipleSelection && (
                                    <small className="text-muted d-none d-sm-flex align-items-center flex-grow-1">
                                        <span className="me-3">
                                            <i className="bi bi-arrow-up" /><i className="bi bi-arrow-down ms-1" />
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
                                )}

                                <button className="btn btn-outline-dark" data-bs-dismiss="modal" type="button">
                                    Batal
                                </button>

                                {isSkippable && !isNoInput && (
                                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={handleSkip}>
                                        Lewati
                                    </button>
                                )}

                                {(isMultipleSelection || isNoInput) && !isLastStep && (
                                    <button type="button" className="btn btn-primary rounded-3" onClick={() => nextStep()}>
                                        Lanjut <i className="bi bi-chevron-right ms-2" />
                                    </button>
                                )}

                                {isLastStep && (
                                    <button type="button" className="btn btn-primary rounded-3" onClick={() => handleSubmit()}>
                                        Simpan <i className="bi bi-check-lg ms-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ModalPortal>

            {children && children}
        </>
    );
};

export default MultiStepInputRadio;