import { twMerge } from "tailwind-merge"

// components/Input.tsx
type InputType =
    | "text"
    | "email"
    | "number"
    | "url"
    | "tel"
    | "search"
    | "date"
    | "datetime-local"
    | "month"
    | "time"
    | "week"


interface InputProps {
    id: string
    name?: string
    label?: string
    type?: InputType
    placeholder?: string
    value?: string
    required?: boolean
    className?: string
    [key: string]: any;
}

export const Input = ({
    id,
    name,
    label,
    type = "text",
    placeholder,
    value,
    required = false,
    className = "",
    ...rest
}: InputProps) => {
    return (
        <div class="w-full">
            {label && (
                <label
                    for={id}
                    className={twMerge("block text-sm font-medium text-gray-700 dark:text-gray-300", className)}
                >
                    {label}
                </label>
            )}
            <input
                type={type}
                id={id}
                name={name || id}
                placeholder={placeholder}
                value={value}
                required={required}
                class={twMerge("input-field mt-2", !label ? className : "")}
                {...rest}
            />
        </div>
    )
}
