import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * @typedef {import('react').InputHTMLAttributes<HTMLInputElement>} InputHTMLProps
 * @typedef {InputHTMLProps & {
 *   label?: string,
 *   error?: string,
 *   icon?: import('react').ReactNode,
 *   options?: string[] // Array of options for dropdown
 * }} TextInputProps
 */

/**
 * TextInput component with optional dropdown support
 *
 * @param {TextInputProps} props - The props for the TextInput component
 * @returns {JSX.Element} The rendered input or select element
 */

export function Input({ className, label, error, icon, options, ...props }) {
    const baseStyles = "text-white w-full block border border-gray-400 px-4 py-2 rounded-lg bg-transparent appearance-none";
    const errorStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";
    const classes = twMerge(clsx(baseStyles, error && errorStyles), className);

    return (
        <div className="mb-2">
            {label && <label className="block text-sm text-gray-300 mb-1">{label}</label>}

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}

                {options ? (
                    <select className={clsx(classes,icon && "pl-10")} {...props}>
                        {options.map((option, index) => (
                            <option key={index} value={option} className="bg-gray-700">
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input className={clsx(classes, icon && "pl-10")} {...props} />
                )}
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
