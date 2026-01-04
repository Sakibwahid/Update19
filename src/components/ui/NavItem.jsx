import React from "react";

export function NavItem({ label, link, Icon ,onClick}) {
    return (
        <li>
            <a
                href={link || "#"}
                className="flex items-center gap-3 w-full py-2 text-gray-400 hover:text-[#41FFEE] transition duration-300"
                onClick={onClick}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </a>
        </li>
    );
}
