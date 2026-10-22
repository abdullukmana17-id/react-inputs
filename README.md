# React Inputs
Kumpulan berbagai komponen input berbasis React yang reusable, fleksibel, dan mudah diintegrasikan ke dalam berbagai proyek aplikasi web.

## Instalasi
```bash
npm install autosize
```
```bash
npm install @uiw/react-codemirror @codemirror/lang-html @codemirror/lang-javascript @codemirror/lang-css @codemirror/lang-json @codemirror/lang-xml @uiw/codemirror-theme-github
```
## Basic Usage

Contoh penggunaan dasar komponen:

```jsx
<Input
    type="text"
    label="Nama Lengkap"
    value={name}
    placeholder="Masukkan nama"
    onChange={(e) => setName(e.target.value)}
/>
```

---

## Props Umum

| Props          | Type       | Deskripsi                     |
| -------------- | ---------- | ----------------------------- |
| `type`         | `string`   | Jenis input yang digunakan    |
| `label`        | `string`   | Label input                   |
| `value`        | `any`      | Nilai input                   |
| `defaultValue` | `any`      | Nilai default input           |
| `className`    | `string`   | Custom class tambahan         |
| `placeholder`  | `string`   | Placeholder input             |
| `onChange`     | `function` | Callback ketika nilai berubah |
| `disabled`     | `boolean`  | Menonaktifkan input           |
| `required`     | `boolean`  | Menandai input wajib diisi    |

---

## Supported Input Types

## Text

Digunakan untuk input teks biasa.

```jsx
<Input
    type="text"
    label="Nama Lengkap"
    value={name}
    placeholder="Masukkan nama"
    onChange={(e) => setName(e.target.value)}
/>
```

---

## Tel

Input nomor telepon dengan dukungan kode negara.

### Props Tambahan

| Props            | Type     | Deskripsi           |
| ---------------- | -------- | ------------------- |
| `defaultCountry` | `string` | Kode negara default |

```jsx
<Input
    type="tel"
    label="Nomor WhatsApp"
    value={phone}
    placeholder="8123456789"
    defaultCountry="ID"
    onChange={(e) => setPhone(e.target.value)}
/>
```

---

## Checkbox

Digunakan untuk memilih lebih dari satu opsi.

### Format Options

```jsx
const hobbyOptions = [
    {
        label: "Membaca",
        value: "membaca"
    },
    {
        label: "Gaming",
        value: "gaming"
    },
    {
        label: "Programming",
        value: "programming"
    }
];
```

```jsx
<Input
    type="checkbox"
    label="Pilih Hobi"
    value={hobbies}
    options={hobbyOptions}
    onChange={(e) => setHobbies(e.target.value)}
/>
```

---

## Color

Digunakan untuk memilih warna.

```jsx
<Input
    type="color"
    label="Warna Primary"
    value={color}
    onChange={(e) => setColor(e.target.value)}
/>
```

---

## Date

Digunakan untuk memilih tanggal.

```jsx
<Input
    type="date"
    label="Tanggal Lahir"
    value={birthDate}
    onChange={(e) => setBirthDate(e.target.value)}
/>
```

---

## Password

Input password dengan dukungan toggle visibility.

```jsx
<Input
    type="password"
    label="Password"
    defaultValue="123456"
/>
```

---

## Radio

Digunakan untuk memilih satu opsi.

### Format Options

```jsx
const hobbyOptions = [
    {
        label: "Membaca",
        value: "membaca"
    },
    {
        label: "Gaming",
        value: "gaming"
    },
    {
        label: "Programming",
        value: "programming"
    }
];
```

```jsx
<Input
    type="radio"
    label="Pilih Hobi"
    value={hobby}
    options={hobbyOptions}
    onChange={(e) => setHobby(e.target.value)}
/>
```

---

## Range

Digunakan untuk memilih nilai dalam rentang tertentu.

### Props Tambahan

| Props  | Type     | Deskripsi          |
| ------ | -------- | ------------------ |
| `min`  | `number` | Nilai minimum      |
| `max`  | `number` | Nilai maksimum     |
| `step` | `number` | Interval perubahan |
| `unit` | `string` | Satuan nilai       |

```jsx
<Input
    type="range"
    label="Volume"
    value={volume}
    min={0}
    max={100}
    step={1}
    unit="%"
    onChange={(e) => setVolume(e.target.value)}
/>
```

---

## Select

Dropdown select dengan dukungan multi-select dan pencarian.

### Format Options

```jsx
const options = [
    { value: "id", label: "Indonesia" },
    { value: "en", label: "English" },
    { value: "ar", label: "Arabic" },
];
```

### Props Tambahan

| Props           | Type      | Deskripsi                 |
| --------------- | --------- | ------------------------- |
| `options`       | `array`   | Daftar pilihan            |
| `isMultiple`    | `boolean` | Mengaktifkan multi-select |
| `enableSearch`  | `boolean` | Mengaktifkan pencarian    |
| `parentModalId` | `string`  | ID parent modal           |

```jsx
<Input
    type="select"
    label="Pilih Bahasa"
    placeholder="Bahasa"
    options={options}
    value={lang}
    isMultiple
    enableSearch={false}
    parentModalId="mainModal"
    onChange={(e) => setLang(e.target.value)}
/>
```

---

## Step

Input multi-step dinamis untuk pemilihan bertingkat.

### Struktur Step

```jsx
const steps = [
    {
        label: "Pilih Jenis",
        options: [
            { value: "surah", label: "Per Surah" },
            { value: "juz", label: "Per Juz" },
        ],
    },
    {
        label: "Pilih Detail",
        isMultiple: true,
        isSkippable: true,
        getDynamicOptions: (values) => {
            if (values[0] === "surah") {
                return [
                    { value: "1", label: "Al-Fatihah" },
                    { value: "2", label: "Al-Baqarah" },
                    { value: "114", label: "An-Nas" },
                ];
            }

            return Array.from({ length: 30 }, (_, i) => ({
                value: `${i + 1}`,
                label: `Juz ${i + 1}`,
            }));
        },
    },
];
```

### Props Tambahan

| Props           | Type       | Deskripsi                |
| --------------- | ---------- | ------------------------ |
| `steps`         | `array`    | Konfigurasi step         |
| `requiredSteps` | `number[]` | Step wajib diisi         |
| `defaultValues` | `array`    | Nilai default            |
| `onComplete`    | `function` | Callback setelah selesai |
| `renderTrigger` | `function` | Custom trigger button    |

```jsx
<Input
    type="step"
    steps={steps}
    requiredSteps={[0, 1]}
    defaultValues={["surah", "1"]}
    onComplete={(values) => console.log(values)}
    renderTrigger={({ selectedLabels }) => (
        <button className="btn btn-outline-primary">
            {selectedLabels.length
                ? selectedLabels.join(" - ")
                : "Pilih Bacaan"}
        </button>
    )}
/>
```

---

## List

Digunakan untuk membuat daftar item dinamis.

### Props Tambahan

| Props          | Type    | Deskripsi        |
| -------------- | ------- | ---------------- |
| `defaultItems` | `array` | Daftar item awal |

```jsx
<Input
    type="list"
    label="Daftar Tugas"
    defaultItems={[
        { id: 1, label: "Desain sistem komponen" },
        { id: 2, label: "Implementasi API backend" },
    ]}
    onChange={(items) => console.log("Updated:", items)}
/>
```

---

## Image

Upload gambar dengan dukungan multiple upload dan preview.

### Props Tambahan

| Props            | Type       | Deskripsi               |
| ---------------- | ---------- | ----------------------- |
| `uploadUrl`      | `string`   | Endpoint upload         |
| `multiple`       | `boolean`  | Upload multiple file    |
| `maxFiles`       | `number`   | Maksimal jumlah file    |
| `initialUrls`    | `string[]` | Gambar awal             |
| `getUploadedUrl` | `function` | Mapping response upload |

```jsx
<Input
    type="image"
    label="Foto Produk"
    uploadUrl="/api/upload"
    multiple={true}
    maxFiles={10}
    initialUrls={[
        "https://picsum.photos/seed/a/400/400",
        "https://picsum.photos/seed/b/400/400",
    ]}
    getUploadedUrl={(res) => res.data.imageUrl}
    onChange={(urls) => console.log(urls)}
/>
```

---

## Code

Editor kode berbasis syntax highlighting.

### Props Tambahan

| Props      | Type     | Deskripsi                 |
| ---------- | -------- | ------------------------- |
| `language` | `string` | Bahasa pemrograman editor |

```jsx
<Input
    type="code"
    label="HTML Editor"
    language="html"
    value={html}
    onChange={setHtml}
/>
```

---

# Best Practices

* Gunakan `value` dan `onChange` untuk controlled component.
* Gunakan `defaultValue` hanya untuk uncontrolled component.
* Selalu sediakan `label` untuk meningkatkan aksesibilitas.
* Gunakan `placeholder` sebagai petunjuk tambahan, bukan pengganti label.
* Pisahkan konfigurasi `options` atau `steps` di luar JSX agar kode lebih rapi dan reusable.

---

# Supported Languages for `type="code"`

| Language   | Value          |
| ---------- | -------------- |
| HTML       | `"html"`       |
| JavaScript | `"javascript"` |
| CSS        | `"css"`        |
| JSON       | `"json"`       |
| XML        | `"xml"`        |

---

# Example Form Integration

```jsx
export default function ExampleForm() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    return (
        <>
            <Input
                type="text"
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                type="tel"
                label="Nomor WhatsApp"
                value={phone}
                defaultCountry="ID"
                onChange={(e) => setPhone(e.target.value)}
            />
        </>
    );
}
