import { useState, useRef, useEffect, Fragment, forwardRef } from "react";

/**
 * Komponen InputRange
 * ------------------------------------------------------
 * Komponen range slider custom berbasis Bootstrap card
 * yang mendukung:
 *
 * - Controlled & uncontrolled mode
 * - Pointer & touch interaction
 * - Keyboard accessibility
 * - Dynamic step generation
 * - Progress visualization
 * - Custom unit display
 * - Responsive interaction
 *
 * @param {Object} props - Properti komponen
 * @param {string} props.label - Label utama range
 * @param {string} [props.className=""] - Class tambahan wrapper
 * @param {number} props.value - Nilai aktif (controlled mode)
 * @param {number} props.defaultValue - Nilai awal (uncontrolled mode)
 * @param {Function} props.onChange - Callback saat nilai berubah
 * @param {string} props.id - ID komponen
 * @param {number} [props.min=0] - Nilai minimum
 * @param {number} [props.max=100] - Nilai maksimum
 * @param {number} [props.step=1] - Interval perubahan nilai
 * @param {string} [props.unit=""] - Satuan nilai
 */
const InputRange = forwardRef(({
    label,
    className = "",
    value,
    defaultValue,
    onChange,
    id,
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    ...props
}, ref) => {
    /** Menentukan apakah komponen menggunakan mode controlled */
    const isControlled = value !== undefined;
    /** State internal untuk menyimpan nilai range pada mode uncontrolled */
    const [internalValue, setInternalValue] = useState(
        defaultValue !== undefined ? defaultValue : min
    );
    /** Reference elemen track range */
    const rangeTrackRef = useRef(null);
    /** Menyimpan status drag pointer saat slider digeser */
    const isDragging = useRef(false);
    /** Menyimpan context terbaru untuk menghindari stale closure pada global event listener */
    const rangeCtxRef = useRef({});
    /** Nilai aktif komponen */
    const inputValue = isControlled ? value : internalValue;
    /** Nilai range yang telah diparsing menjadi number */
    const currentRangeValue =
        inputValue !== "" && inputValue !== undefined ? parseFloat(inputValue) : min;

    /**
     * Membuat seluruh step range berdasarkan:
     * - min
     * - max
     * - step
     *
     * Mendukung nilai desimal dengan presisi otomatis.
     */
    const generateSteps = () => {
        const steps = [];
        /** Menghitung jumlah angka desimal pada step */
        const precision = String(step).includes(".") ? String(step).split(".")[1].length : 0;
        /** Faktor pengali untuk menghindari floating point issue */
        const factor = Math.pow(10, precision);
        const iMin = Math.round(min * factor);
        const iMax = Math.round(max * factor);
        const iStep = Math.round(step * factor);
        /** Generate seluruh nilai step */
        for (let v = iMin; v <= iMax; v += iStep) {
            steps.push(v / factor);
        }
        /** Memastikan nilai max tetap tersedia */
        if (steps[steps.length - 1] !== max) steps.push(max);
        return steps;
    };

    /** Mengambil sebagian step untuk ditampilkan sebagai visual dot agar tampilan tetap ringkas. */
    const getDisplaySteps = (steps, maxDots = 5) => {
        /** Jika jumlah step kecil, tampilkan semua */
        if (steps.length <= maxDots) return steps;
        const result = [];
        /** Mengambil step secara proporsional */
        for (let i = 0; i < maxDots; i++) {
            const idx = Math.round((i * (steps.length - 1)) / (maxDots - 1));
            result.push(steps[idx]);
        }
        return result;
    };

    /** Seluruh nilai step */
    const stepValues = generateSteps();
    /** Step yang akan divisualisasikan */
    const displaySteps = getDisplaySteps(stepValues, 5);
    /** Persentase progress keseluruhan range */
    const totalPct = ((currentRangeValue - min) / (max - min)) * 100;

    /** Menghitung persentase progress antar step. */
    const getLinePercentage = (fromVal, toVal) => {
        /** Belum mencapai segment */
        if (currentRangeValue <= fromVal) return 0;
        /** Segment sudah penuh */
        if (currentRangeValue >= toVal) return 100;
        /** Progress parsial segment */
        return parseFloat(
            (((currentRangeValue - fromVal) / (toVal - fromVal)) * 100).toFixed(2)
        );
    };

    /** Mengubah posisi pointer menjadi nilai range. */
    const getValueFromClientX = (clientX) => {
        const {
            trackRef,
            min: rMin,
            max: rMax,
            step: rStep
        } = rangeCtxRef.current;
        /** Validasi reference track */
        if (!trackRef?.current) return rMin;
        /** Mengambil posisi dan ukuran track */
        const rect = trackRef.current.getBoundingClientRect();
        /** Membatasi posisi pointer di dalam track */
        const x = Math.max(
            0,
            Math.min(
                clientX - rect.left, rect.width
            )
        );
        /** Persentase posisi pointer */
        const pct = x / rect.width;
        /** Nilai mentah sebelum snapping */
        const rawValue = rMin + pct * (rMax - rMin);
        /** Snap ke step terdekat */
        const snapped = Math.round(
            (
                rawValue - rMin
            ) / rStep
        ) * rStep + rMin;
        /** Presisi angka desimal */
        const precision = String(rStep).includes(".")
            ? String(rStep).split(".")[1].length
            : 0;
        /** Clamp & return nilai final */
        return parseFloat(Math.max(rMin, Math.min(rMax, snapped)).toFixed(precision));
    };

    /** Handler utama perubahan nilai range. */
    const handleRangeChange = (newValue) => {
        const {
            isCtrl,
            onChange: cb,
            id: rId,
            setInternal
        } = rangeCtxRef.current;
        /** Membuat synthetic event menyerupai input native */
        const syntheticEvent = {
            target: {
                value: newValue,
                id: rId
            }
        };
        /** Update state internal jika uncontrolled */
        if (!isCtrl) setInternal(newValue);
        /** Menjalankan callback parent */
        cb?.(syntheticEvent);
    };

    /** Handler ketika user mulai drag slider. */
    const handleRangePointerDown = (e) => {
        e.preventDefault();
        /** Mengaktifkan mode dragging */
        isDragging.current = true;
        /** Mendukung mouse & touch */
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        /** Update nilai berdasarkan posisi pointer */
        handleRangeChange(getValueFromClientX(clientX));
    };

    /** Menyimpan context terbaru setiap render */
    rangeCtxRef.current = {
        trackRef: rangeTrackRef,
        min, max, step,
        isCtrl: isControlled,
        onChange,
        id,
        setInternal: setInternalValue,
    };

    /** Global listener untuk drag interaction. */
    useEffect(() => {
        /** Event pointer bergerak */
        const onMove = (e) => {
            /** Abaikan jika tidak dragging */
            if (!isDragging.current) return;
            const clientX = e.touches
                ? e.touches[0].clientX
                : e.clientX;
            handleRangeChange(
                getValueFromClientX(clientX)
            );
        };
        /** Event pointer selesai */
        const onUp = () => { isDragging.current = false; };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onUp);

        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onUp);
        };
    }, []);

    const handleRangeKeyDown = (e) => {
        const currentVal = parseFloat(inputValue) || min;
        const precision = String(step).includes(".") ? String(step).split(".")[1].length : 0;
        let next = currentVal;

        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            next = parseFloat(Math.min(max, currentVal + step).toFixed(precision));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            next = parseFloat(Math.max(min, currentVal - step).toFixed(precision));
        } else if (e.key === "Home") {
            e.preventDefault();
            next = min;
        } else if (e.key === "End") {
            e.preventDefault();
            next = max;
        } else {
            return;
        }
        handleRangeChange(next);
    };

    return (
        <div className={`${className || "mb-3"}`}>
            <div
                ref={ref}
                {...props}
                id={id}
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={currentRangeValue}
                aria-label={label}
                tabIndex={0}
                className="card card-range border border-secondary-subtle rounded-4 bg-white"
                onKeyDown={handleRangeKeyDown}
                style={{ userSelect: "none", outline: "none" }}
                onFocus={(e) => e.currentTarget.classList.add("range-focus")}
                onBlur={(e) => e.currentTarget.classList.remove("range-focus")}
            >
                <div className="card-header bg-transparent border-bottom-0 pe-2 pt-2">
                    <p className="m-0 mt-1 d-flex align-items-center justify-content-between">
                        <label htmlFor={id} className="form-label mb-0 fw-medium font-serif">
                            {label}
                        </label>
                        <code>
                            {currentRangeValue}{unit}
                        </code>
                    </p>
                </div>

                <div
                    ref={rangeTrackRef}
                    className="card-body d-flex align-items-center px-3 gap-2 pb-5"
                    onMouseDown={handleRangePointerDown}
                    onTouchStart={handleRangePointerDown}
                    style={{ cursor: "pointer" }}
                >
                    {displaySteps.map((stepVal, i) => {
                        const isActive = currentRangeValue >= stepVal;
                        const isNext = i < displaySteps.length - 1;
                        return (
                            <Fragment key={stepVal}>
                                <div
                                    className={`dot${isActive ? " active" : ""}`}
                                    data-content={`${stepVal}${unit}`}
                                />
                                {isNext && (
                                    <div
                                        className="line rounded-pill"
                                        style={{
                                            "--percentage-step": `${getLinePercentage(stepVal, displaySteps[i + 1])}%`,
                                            flexGrow: 1,
                                        }}
                                    />
                                )}
                            </Fragment>
                        );
                    })}
                </div>

                <div
                    className="range-progress-bar"
                    style={{ "--range-pct": `${totalPct}%` }}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
});

InputRange.displayName = "InputRange";
export default InputRange;