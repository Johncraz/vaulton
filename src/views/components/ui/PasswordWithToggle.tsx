import { EyeCloseIcon } from "../icons/Eye-close";
import { EyeOpenIcon } from "../icons/Eye-open";
import { twMerge } from "tailwind-merge";

interface SecureInputWithToggleProps {
    name: string;
    id?: string;
    label?: string;
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    buttonClass?: string;
    labelClass?: string;
    [key: string]: any; // for any other input props like value, onChange, etc.
}

export const SecureInputWithToggle = ({
    name,
    id,
    label,
    placeholder = "Enter password",
    wrapperClass,
    inputClass,
    buttonClass,
    labelClass,
    ...props
}: SecureInputWithToggleProps) => {
    const inputId = id || name;

    return (
        <div>
            {label && (
                <label
                    for={inputId}
                    class={twMerge(
                        "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                        labelClass
                    )}
                >
                    {label}
                </label>
            )}
            <div
                class={twMerge("flex items-center relative", wrapperClass)}
                data-password-with-toggle
            >
                <input
                    class={twMerge("input-field mt-0!", inputClass)}
                    type="password"
                    name={name}
                    id={inputId}
                    placeholder={placeholder}
                    autocomplete="off"
                    {...props}
                />
                <button
                    type="button"
                    class={twMerge(
                        "absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer group",
                        buttonClass
                    )}
                    tabindex={-1}
                >
                    <EyeCloseIcon className="size-5 group-hover:fill-gray-800 dark:group-hover:fill-zinc-500 group-hover:scale-105 transition-[fill,scale] ease-in-out duration-200" />
                    <EyeOpenIcon
                        className="size-5 group-hover:fill-zinc-800 dark:group-hover:fill-zinc-500 group-hover:scale-105 transition-[fill,scale] ease-in-out duration-200"
                        style={{ display: "none" }}
                    />
                </button>
            </div>
        </div>
    );
};
