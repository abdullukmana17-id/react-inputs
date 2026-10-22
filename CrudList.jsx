import { useState, Fragment } from "react";
import Input from ".";

/**
 * Komponen CrudList
 * ------------------------------------------------------
 * Komponen daftar CRUD berbasis desain list-group Bootstrap
 * yang mendukung:
 *
 * - Tambah item baru (via input + tombol atau tekan Enter)
 * - Edit item inline dengan konfirmasi / batal
 * - Hapus item
 * - Controlled & uncontrolled mode
 * - Accessibility attributes
 *
 * @param {Object}   props
 * @param {string}   [props.label="Daftar Item"]    - Label header daftar
 * @param {Array}    [props.items]                  - Items controlled (array of { id, label })
 * @param {Array}    [props.defaultItems=[]]         - Items awal uncontrolled
 * @param {Function} [props.onChange]               - Callback saat items berubah: (items) => void
 * @param {string}   [props.placeholder]            - Placeholder input tambah item
 * @param {string}   [props.className]              - Class tambahan wrapper luar
 */
const CrudList = ({
    label = "Daftar Item",
    items: controlledItems,
    defaultItems = [],
    onChange,
    placeholder = "Tambah item baru",
    className = "",
}) => {
    const isControlled = controlledItems !== undefined;

    const [internalItems, setInternalItems] = useState(defaultItems);
    const [addVal, setAddVal] = useState("");
    const [editId, setEditId] = useState(null);
    const [editVal, setEditVal] = useState("");

    const items = isControlled ? controlledItems : internalItems;

    const commit = (next) => {
        if (!isControlled) setInternalItems(next);
        onChange?.(next);
    };

    /** Tambah item baru */
    const handleAdd = () => {
        const v = addVal.trim();
        if (!v) return;
        commit([...items, { id: Date.now(), label: v }]);
        setAddVal("");
    };

    /** Hapus item */
    const handleRemove = (id) => commit(items.filter((i) => i.id !== id));

    /** Mulai mode edit */
    const startEdit = (item) => {
        setEditId(item.id);
        setEditVal(item.label);
    };

    /** Konfirmasi perubahan edit */
    const confirmEdit = () => {
        const v = editVal.trim();
        if (v) commit(items.map((i) => (i.id === editId ? { ...i, label: v } : i)));
        setEditId(null);
    };

    /** Batalkan mode edit */
    const cancelEdit = () => setEditId(null);

    const handleAddKey = (e) => { if (e.key === "Enter") handleAdd(); };
    const handleEditKey = (e) => {
        if (e.key === "Enter") confirmEdit();
        if (e.key === "Escape") cancelEdit();
    };

    return (
        <div className={className}>
            <div className="list-group list-group-form mb-2 border border-secondary-subtle d-flex flex-column p-1 gap-1 bg-white rounded-4">

                {/* Header */}
                <li className="list-group-item border-0 pb-0">
                    <p className="mb-0 text-secondary">
                        {label}
                    </p>
                </li>

                {/* Empty state */}
                {items.length === 0 && (
                    <li className="list-group-item border-0 text-center text-secondary" style={{ fontSize: 13 }}>
                        Belum ada item. Tambahkan di bawah.
                    </li>
                )}

                {/* Daftar item */}
                {items.map((item, index) => {
                    const isEditing = editId === item.id;
                    return (
                        <Fragment key={item.id}>
                            {index > 0 && <hr className="mx-2 my-0 opacity-25" />}
                            <li
                                className={`list-group-item border-0 d-flex align-items-center gap-3${isEditing ? " active bg-light" : ""}`}
                                style={{ borderRadius: "calc(.75rem)" }}
                                aria-current={isEditing}
                            >
                                {/* Nomor urut */}
                                <div className={`icon rounded-2`}>
                                    {index + 1}
                                </div>

                                {/* Label / Input edit */}
                                <div className="flex-grow-1 text-muted">
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            className="form-control py-0 border-0 shadow-none rounded-0 bg-transparent px-0"
                                            value={editVal}
                                            onChange={(e) => setEditVal(e.target.value)}
                                            onKeyDown={handleEditKey}
                                        />
                                    ) : (
                                        <span>{item.label}</span>
                                    )}
                                </div>

                                {/* Tombol aksi */}
                                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                onClick={confirmEdit}
                                            >
                                                <i className="bi bi-check-lg" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                onClick={cancelEdit}
                                            >
                                                <i className="bi bi-x-lg" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                onClick={() => startEdit(item)}
                                            >
                                                <i className="bi bi-pencil" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                onClick={() => handleRemove(item.id)}
                                            >
                                                <i className="bi bi-trash" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        </Fragment>
                    );
                })}
            </div>
            <div className="d-flex align-items-center position-relative mt-2">
                <Input
                    type="text"
                    className="mb-0 flex-grow-1"
                    placeholder={placeholder}
                    label={placeholder}
                    value={addVal}
                    onChange={(e) => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    aria-label="Input item baru"
                />
                <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center position-absolute top-50 translate-middle-y end-0 me-2 rounded-3 py-2"
                    onClick={handleAdd}
                >
                    <i className="bi bi-plus-lg" />
                </button>
            </div>
        </div>
    );
};

export default CrudList;