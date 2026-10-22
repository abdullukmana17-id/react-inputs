import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import Input from ".";

const { Tooltip } = window.bootstrap;

/* ──────────────────────────────────────────────────────────
   IMAGE CARD
────────────────────────────────────────────────────────── */

function ImageInfoCard({
    url = "",
    label = "Image Info",
    onRemove,
}) {
    const [info, setInfo] =
        useState(null);

    const [status, setStatus] =
        useState("idle");

    const tooltipRef =
        useRef(null);

    useEffect(() => {
        if (
            !tooltipRef.current ||
            !info
        ) {
            return;
        }

        const tooltip =
            new Tooltip(
                tooltipRef.current,
                {
                    boundary:
                        document.body,
                }
            );

        return () =>
            tooltip.dispose();
    }, [info]);

    function parseMeta(rawUrl) {
        try {
            const clean =
                rawUrl.split("?")[0];

            const parts =
                clean.split("/");

            const name =
                decodeURIComponent(
                    parts[
                    parts.length - 1
                    ]
                ) || "unknown";

            const dot =
                name.lastIndexOf(
                    "."
                );

            const ext =
                dot !== -1
                    ? name
                        .slice(
                            dot + 1
                        )
                        .toUpperCase()
                    : "—";

            return {
                name,
                ext,
            };
        } catch {
            return {
                name: "unknown",
                ext: "",
            };
        }
    }

    useEffect(() => {
        if (!url) {
            setStatus("idle");
            setInfo(null);

            return;
        }

        let mounted = true;

        setStatus("loading");
        setInfo(null);

        const img = new Image();

        img.crossOrigin =
            "anonymous";

        img.onload = async () => {
            if (!mounted) return;

            const {
                name,
                ext,
            } = parseMeta(url);

            let bytes = 0;

            try {
                const isBlob =
                    url.startsWith(
                        "blob:"
                    );

                if (!isBlob) {
                    const res =
                        await fetch(
                            url,
                            {
                                method:
                                    "HEAD",
                            }
                        );

                    bytes =
                        parseInt(
                            res.headers.get(
                                "content-length"
                            ) || "0",
                            10
                        );
                }
            } catch {
                bytes = 0;
            }

            if (!mounted) return;

            setInfo({
                width:
                    img.naturalWidth,
                height:
                    img.naturalHeight,
                size: bytes,
                name,
                ext,
            });

            setStatus("ready");
        };

        img.onerror = () => {
            if (!mounted) return;

            setStatus("error");
        };

        img.src = url;

        return () => {
            mounted = false;
        };
    }, [url]);

    const fmtBytes = (b) => {
        if (!b) return "";

        if (b < 1024) {
            return `${b} B`;
        }

        if (b < 1048576) {
            return `${(
                b / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            b / 1048576
        ).toFixed(2)} MB`;
    };

    return (
        <>
            {status === "ready" &&
                info && (
                    <div
                        className="position-relative"
                        data-bs-title={`
                            <p class='m-0 font-sans small text-start'>
                                <span class='opacity-75'>
                                    ${info.width}
                                    <i class="bi bi-x-lg mx-1"></i>
                                    ${info.height}
                                </span>
                                <span class='opacity-75 ms-2'>
                                    (${fmtBytes(
                            info.size
                        )})
                                </span>
                            </p>
                        `}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-custom-class="custom-tooltip"
                        data-bs-html="true"
                        ref={tooltipRef}
                    >
                        <img
                            src={url}
                            alt={info.name}
                            crossOrigin="anonymous"
                            className="img-cover rounded-3 border border-secondary-subtle"
                            style={{
                                height:
                                    "100px",
                                width:
                                    "100px",
                            }}
                        />

                        <div
                            type="button"
                            className="position-absolute top-0 end-0 m-2 btn btn-light btn-sm p-1 py-0 opacity-50"
                            onClick={
                                onRemove
                            }
                            aria-label="Hapus gambar"
                        >
                            <i className="bi bi-x-lg"></i>
                        </div>
                    </div>
                )}

            {status ===
                "loading" && (
                    <div
                        className="rounded-3 border border-secondary-subtle d-flex align-items-center justify-content-center"
                        style={{
                            height:
                                "100px",
                            width:
                                "100px",
                        }}
                    >
                        <div
                            className="spinner-border spinner-border-sm text-secondary"
                            role="status"
                        />
                    </div>
                )}

            {status ===
                "error" && (
                    <div
                        className="rounded-3 border border-danger-subtle d-flex flex-column align-items-center justify-content-center text-danger gap-1"
                        style={{
                            height:
                                "100px",
                            width:
                                "100px",
                            fontSize:
                                "0.7rem",
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                            />

                            <line
                                x1="12"
                                y1="8"
                                x2="12"
                                y2="13"
                            />

                            <circle
                                cx="12"
                                cy="16.5"
                                r=".8"
                                fill="currentColor"
                            />
                        </svg>

                        <span>
                            URL tidak
                            valid
                        </span>
                    </div>
                )}
        </>
    );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */

export default function ImageGalleryUploader(
    {
        type = "image",
        initialUrls = [],
        multiple = true,
        onChange,
        maxFiles = 20,
        className,
        label,

        // upload local file only
        uploadUrl,
        uploadFieldName =
        "file",
        uploadHeaders = {},
        getUploadedUrl = (
            res
        ) => res.url,
    }
) {
    const [images, setImages] =
        useState(initialUrls);
    const [errorMessage, setErrorMessage] = useState("");

    const [
        dragging,
        setDragging,
    ] = useState(false);

    const [urlInput, setUrlInput] =
        useState("");

    const [
        uploadingCount,
        setUploadingCount,
    ] = useState(0);

    const fileInputRef =
        useRef(null);

    const dragCounter =
        useRef(0);

    /* notify parent */

    useEffect(() => {
        onChange?.(images);
    }, [images, onChange]);

    /* ───────────────────────────────────────────────────── */

    const addUrls = useCallback(
        (newUrls) => {
            setImages((prev) => {
                const merged = [
                    ...prev,
                    ...newUrls,
                ];

                return multiple
                    ? merged.slice(
                        0,
                        maxFiles
                    )
                    : [
                        newUrls[0] ??
                        prev[0],
                    ];
            });
        },
        [multiple, maxFiles]
    );

    const removeAt = (
        index
    ) => {
        setImages((prev) =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );
    };

    /* ─────────────────────────────────────────────────────
       VALIDATE IMAGE URL
    ───────────────────────────────────────────────────── */

    const validateImageUrl =
        (url) => {
            return new Promise(
                (resolve) => {
                    try {
                        const img =
                            new Image();

                        img.crossOrigin =
                            "anonymous";

                        img.onload =
                            () =>
                                resolve(
                                    true
                                );

                        img.onerror =
                            () =>
                                resolve(
                                    false
                                );

                        img.src = url;
                    } catch {
                        resolve(
                            false
                        );
                    }
                }
            );
        };

    /* ─────────────────────────────────────────────────────
       UPLOAD LOCAL FILE
    ───────────────────────────────────────────────────── */

    const uploadFile =
        useCallback(
            async (file) => {
                if (
                    !uploadUrl
                ) {
                    console.error(
                        "uploadUrl belum diset"
                    );

                    return;
                }

                setUploadingCount(
                    (c) =>
                        c + 1
                );

                try {
                    const formData =
                        new FormData();

                    formData.append(
                        uploadFieldName,
                        file
                    );

                    const res =
                        await fetch(
                            uploadUrl,
                            {
                                method:
                                    "POST",

                                headers:
                                    uploadHeaders,

                                body: formData,
                            }
                        );

                    if (
                        !res.ok
                    ) {
                        throw new Error(
                            `Upload gagal: ${res.status}`
                        );
                    }

                    const json =
                        await res.json();

                    const uploadedUrl =
                        getUploadedUrl(
                            json
                        );

                    if (
                        !uploadedUrl
                    ) {
                        throw new Error(
                            "URL gambar tidak ditemukan pada respons"
                        );
                    }

                    addUrls([
                        uploadedUrl,
                    ]);
                } catch (err) {
                    console.error(
                        "[ImageGalleryUploader] Upload file error:",
                        err
                    );

                    setErrorMessage(
                        err?.message || "Upload gambar gagal"
                    );
                } finally {
                    setUploadingCount(
                        (c) =>
                            c - 1
                    );
                }
            },
            [
                uploadUrl,
                uploadFieldName,
                uploadHeaders,
                getUploadedUrl,
                addUrls,
            ]
        );

    /* ─────────────────────────────────────────────────────
       ADD IMAGE FROM URL
    ───────────────────────────────────────────────────── */

    const uploadImageFromUrl =
        useCallback(async () => {
            setErrorMessage("");
            const trimmed =
                urlInput.trim();

            if (!trimmed)
                return;

            setUploadingCount(
                (c) => c + 1
            );

            try {
                const isValid =
                    await validateImageUrl(
                        trimmed
                    );

                if (
                    !isValid
                ) {
                    throw new Error(
                        "URL gambar tidak valid"
                    );
                }

                /* langsung gunakan URL
                   tanpa upload backend */

                addUrls([
                    trimmed,
                ]);

                setUrlInput("");
            } catch (err) {
                console.error(
                    "[ImageGalleryUploader] URL image error:",
                    err
                );

                setErrorMessage(
                    err?.message || "URL gambar tidak valid"
                );
            } finally {
                setUploadingCount(
                    (c) =>
                        c - 1
                );
            }
        }, [
            urlInput,
            addUrls,
        ]);

    /* ─────────────────────────────────────────────────────
       HANDLE FILES
    ───────────────────────────────────────────────────── */

    const handleFiles =
        useCallback(
            async (files) => {
                setErrorMessage("");
                const accepted =
                    Array.from(
                        files
                    ).filter((f) =>
                        f.type.startsWith(
                            "image/"
                        )
                    );

                const slots =
                    multiple
                        ? maxFiles -
                        images.length
                        : images.length ===
                            0
                            ? 1
                            : 0;

                const toProcess =
                    accepted.slice(
                        0,
                        slots
                    );

                if (
                    !uploadUrl
                ) {
                    console.error(
                        "uploadUrl belum diset"
                    );

                    return;
                }

                for (const file of toProcess) {
                    await uploadFile(
                        file
                    );
                }
            },
            [
                uploadUrl,
                uploadFile,
                multiple,
                maxFiles,
                images.length,
            ]
        );

    /* ─────────────────────────────────────────────────────
       DRAG EVENTS
    ───────────────────────────────────────────────────── */

    const onDragEnter = (
        e
    ) => {
        e.preventDefault();

        dragCounter.current++;

        if (
            e.dataTransfer.items
                .length > 0
        ) {
            setDragging(true);
        }
    };

    const onDragLeave = (
        e
    ) => {
        e.preventDefault();

        dragCounter.current--;

        if (
            dragCounter.current ===
            0
        ) {
            setDragging(false);
        }
    };

    const onDragOver = (
        e
    ) =>
        e.preventDefault();

    const onDrop = (e) => {
        e.preventDefault();

        dragCounter.current = 0;

        setDragging(false);

        handleFiles(
            e.dataTransfer.files
        );
    };

    /* ───────────────────────────────────────────────────── */

    const isUploading =
        uploadingCount > 0;

    const canAddMore =
        multiple
            ? images.length <
            maxFiles
            : images.length === 0;

    return (
        <>
            <button
                type="button"
                className={`${dragging ? " active" : ""}${!canAddMore ? " disabled" : ""} card w-100 rounded-4 bg-white ${images.length > 0 ? "" : "form-card"} justify-content-center mb-3`}
            >
                {images.length >
                    0 && (
                        <div className="card-header d-flex gap-2 bg-transparent border-bottom-0 flex-nowrap overflow-auto p-3">
                            {images.map(
                                (
                                    src,
                                    i
                                ) => (
                                    <ImageInfoCard
                                        key={`${src}-${i}`}
                                        url={
                                            src
                                        }
                                        label={`Gambar ${i + 1}`}
                                        onRemove={() =>
                                            removeAt(
                                                i
                                            )
                                        }
                                    />
                                )
                            )}

                            {Array.from(
                                {
                                    length:
                                        uploadingCount,
                                }
                            ).map(
                                (
                                    _,
                                    i
                                ) => (
                                    <div
                                        key={`uploading-${i}`}
                                        className="rounded-3 border border-secondary-subtle d-flex flex-column align-items-center justify-content-center text-muted gap-1"
                                        style={{
                                            height:
                                                "100px",
                                            width:
                                                "100px",
                                            flexShrink: 0,
                                            fontSize:
                                                "0.7rem",
                                        }}
                                    >
                                        <div
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                        />

                                        <span>
                                            Mengunggah
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                <div
                    onDragEnter={
                        onDragEnter
                    }
                    onDragLeave={
                        onDragLeave
                    }
                    onDragOver={
                        onDragOver
                    }
                    onDrop={onDrop}
                    onClick={() =>
                        canAddMore &&
                        !isUploading &&
                        fileInputRef.current?.click()
                    }
                    className={`card-body ${images.length > 0 ? "" : "py-0"} px-3 flex-grow-0 text-start`}
                >
                    <p className="m-0 text-muted font-sans text-truncate d-flex align-items-center flex-nowrap gap-1">
                        {label}

                        <span className="ms-2 me-auto">
                            {dragging
                                ? "(Lepaskan untuk mengunggah)"
                                : isUploading
                                    ? "(Sedang mengunggah...)"
                                    : "(Seret & lepas gambar di sini)"}
                        </span>
                        <span className="text-muted font-sans">
                            {
                                images.length
                            }

                            {multiple
                                ? `/${maxFiles}`
                                : ""}{" "}
                            Gambar
                        </span>
                    </p>
                </div>
            </button>
            {errorMessage && (
                <p className="m-0">
                    <small className="text-danger">
                        {errorMessage}
                    </small>
                </p>
            )}

            {canAddMore && (
                <div
                    className={`${className || "mb-3"} d-flex align-items-center position-relative mt-2`}
                >
                    <Input
                        type="text"
                        label="Tempel URL gambar"
                        className="mb-0 flex-grow-1"
                        placeholder="https://example.com/image.jpg"
                        value={
                            urlInput
                        }
                        onChange={(
                            e
                        ) =>
                            setUrlInput(
                                e
                                    .target
                                    .value
                            )
                        }
                        onKeyDown={(
                            e
                        ) => {
                            if (
                                e.key ===
                                "Enter" &&
                                !isUploading
                            ) {
                                e.preventDefault();

                                uploadImageFromUrl();
                            }
                        }}
                    />

                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center position-absolute top-50 translate-middle-y end-0 me-2 rounded-3 py-2"
                        onClick={
                            uploadImageFromUrl
                        }
                        disabled={
                            !urlInput.trim() ||
                            isUploading
                        }
                    >
                        <i className="bi bi-upload"></i>
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={
                    multiple
                }
                style={{
                    display:
                        "none",
                }}
                onChange={(e) => {
                    handleFiles(
                        e.target.files
                    );

                    e.target.value =
                        "";
                }}
            />
        </>
    );
}