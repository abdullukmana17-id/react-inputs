import {
    forwardRef,
    useMemo,
    useState
} from "react";

import CodeMirror from "@uiw/react-codemirror";

import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";

import {
    githubLight,
    githubDark
} from "@uiw/codemirror-theme-github";

const CodeEditor = forwardRef(({
    label,
    value,
    defaultValue = "",
    onChange,
    language = "html",
    className = "",

    /**
     * NEW
     */
    mini = false,

    ...props
}, ref) => {

    const isControlled =
        value !== undefined;

    const [internalValue, setInternalValue] =
        useState(defaultValue);

    const editorValue = isControlled
        ? value
        : internalValue;

    /**
     * Detect bootstrap theme
     */
    const currentTheme =
        document.documentElement.getAttribute(
            "data-bs-theme"
        ) || "light";

    /**
     * Codemirror theme
     */
    const codeTheme = useMemo(() => {

        return currentTheme === "dark"
            ? githubDark
            : githubLight;

    }, [currentTheme]);

    /**
     * Extensions
     */
    const getLanguage = () => {

        switch (language) {

            case "javascript":
            case "js":
                return [javascript()];

            case "html":
                return [html()];

            case "css":
                return [css()];

            case "json":
                return [json()];

            case "xml":
                return [xml()];

            default:
                return [html()];
        }
    };

    /**
     * Handle change
     */
    const handleChange = (val) => {

        if (!isControlled) {
            setInternalValue(val);
        }

        onChange?.(val);
    };

    /**
     * Shared styles
     */
    const editorStyles = {
        height: mini
            ? "140px"
            : "100%",

        fontSize: "14px",
    };

    return (
        <>
            {mini ? (
                <div
                    className={`
                        ${className}
                        card
                        rounded-4
                        overflow-hidden
                        bg-white
                    `}
                >

                    {label && (
                        <div
                            className="
                                card-header
                                bg-body-tertiary
                                border-bottom
                            "
                        >
                            <p
                                className="
                                    small
                                    mb-0
                                    fw-medium
                                    text-body-secondary
                                "
                            >
                                {label}
                            </p>
                        </div>
                    )}

                    <div className="card-body p-0">

                        <CodeMirror
                            ref={ref}
                            value={editorValue}
                            theme={codeTheme}
                            extensions={getLanguage()}
                            onChange={handleChange}
                            basicSetup={{
                                lineNumbers: false,

                                foldGutter: false,

                                autocompletion: true,

                                highlightActiveLine: true,

                                highlightActiveLineGutter: false,
                            }}
                            style={editorStyles}
                            {...props}
                        />

                    </div>
                </div>
            ) : (
                <div
                    className={`
                        ${className}
                        d-flex
                        flex-column
                        h-100
                        overflow-hidden
                    `}
                >

                    <div
                        className="
                            flex-grow-1
                            overflow-hidden
                            bg-body
                        "
                        style={{
                            minHeight: "100%",
                            maxHeight: "100%",
                        }}
                    >

                        <CodeMirror
                            ref={ref}
                            value={editorValue}
                            theme={codeTheme}
                            extensions={getLanguage()}
                            onChange={handleChange}
                            basicSetup={{
                                lineNumbers: true,

                                foldGutter: true,

                                autocompletion: true,

                                highlightActiveLine: true,

                                highlightActiveLineGutter: true,
                            }}
                            style={editorStyles}
                            {...props}
                        />

                    </div>
                </div>
            )}
        </>
    );
});

CodeEditor.displayName =
    "CodeEditor";

export default CodeEditor;