import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

/**
 * @typedef {import('react').ButtonHTMLAttributes<HTMLButtonElement>} ButtonHTMLProps
 * @typedef {ButtonHTMLProps & {
*   variant?: 'filled' | 'outline',
*   size?: 'sm' | 'md' | 'lg',
* }} ButtonProps
*/

/**
* Button component
*
* @param {ButtonProps} props - The props for the Button component
* @returns {JSX.Element} The rendered button element
*/

export function Button({size="sm", variant="filled", className, children, ...props}) {
    const basestyles = [
        "inline-flex shadow-lg rounded-lg justify-center items-center"
    ]
    const variants = {
        filled:
        "border border-transparent text-gray-600 bg-[#41FFEE] hover:bg-[#7debe1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white",
      outline: "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50", 
    }

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      };
      
      const classes= twMerge(
        clsx(basestyles,variants[variant],sizes[size]), className
      );
    
    return (
        <button  className={classes} {...props}>
            {children}
        </button>
    );
}

   