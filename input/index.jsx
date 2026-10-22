/**
 * Input – modular entry point
 *
 * Struktur modul:
 *   Input/
 *   ├── index.jsx          ← file ini (router utama)
 *   ├── constants.js       ← COUNTRIES, FILE_ICONS, helpers
 *   ├── FlagImg.jsx        ← komponen bendera negara
 *   ├── InputText.jsx      ← type: text | email | number
 *   ├── InputPassword.jsx  ← type: password
 *   ├── InputDate.jsx      ← type: date | datetime-local | time
 *   ├── InputTel.jsx       ← type: tel (dengan country modal)
 *   ├── InputColor.jsx     ← type: color
 *   ├── InputRange.jsx     ← type: range (custom slider)
 *   ├── InputRadio.jsx     ← type: radio
 *   ├── InputCheckbox.jsx  ← type: checkbox
 *   ├── InputFile.jsx      ← type: file  (single)
 *   ├── InputFiles.jsx     ← type: files (multiple + validasi)
 *   └── InputImage.jsx     ← type: image (dengan preview)
 */

import { forwardRef } from "react";
import InputText     from "./InputText";
import InputPassword from "./InputPassword";
import InputDate     from "./InputDate";
import InputTel      from "./InputTel";
import InputColor    from "./InputColor";
import InputRange    from "./InputRange";
import InputRadio    from "./InputRadio";
import InputCheckbox from "./InputCheckbox";
import ImageInfoCard from "./ImageInfoCard";
import InputSelect   from "./InputSelect";
import MultiStepInputRadio from "./MultiStepInputRadio";
import CrudList from "./CrudList";
import CodeEditor from "./CodeEditor";
import Textarea from "./Textarea";

const Input = forwardRef((props, ref) => {
    const { type = "text" } = props;

    if (type === "text" || type === "email" || type === "number") {
        return <InputText ref={ref} {...props} />;
    }

    if (type === "password") {
        return <InputPassword ref={ref} {...props} />;
    }

    if (type === "date" || type === "datetime-local" || type === "time") {
        return <InputDate ref={ref} {...props} />;
    }

    if (type === "tel") {
        return <InputTel ref={ref} {...props} />;
    }

    if (type === "color") {
        return <InputColor ref={ref} {...props} />;
    }

    if (type === "range") {
        return <InputRange ref={ref} {...props} />;
    }

    if (type === "radio") {
        return <InputRadio {...props} />;
    }

    if (type === "checkbox") {
        return <InputCheckbox {...props} />;
    }

    if (type === "image") {
        return <ImageInfoCard {...props} />;
    }

    if (type === "select") {
        return <InputSelect {...props} />;
    }

    if (type === "step") {
        return <MultiStepInputRadio {...props} />
    }

    if (type === "list") {
        return <CrudList {...props} />
    }

    if (type === "code") {
        return <CodeEditor {...props} />
    }

    if (type === "textarea") {
        return <Textarea {...props} />
    }

    return <p>Tipe tidak didukung: <code>{type}</code></p>;
});

Input.displayName = "Input";
export default Input;
