import {
    IconBrandGithub,
    IconBrandLinkedin,
    IconBrandX,
} from "@tabler/icons-react";
import React from "react";
import { FloatingDock } from "./ui/floating-dock";

const items = [
    { title: "Twitter", icon: <IconBrandX />, href: "https://github.com/ad1tyayadav" },
    {
        title: "GitHub",
        icon: <IconBrandGithub />,
        href: "https://github.com/ad1tyayadav",
    },
    { title: "LinkedIn", icon: <IconBrandLinkedin />, href: "https://www.linkedin.com/in/aditya-yadav-39b20529a/" },
];

function Footer() {
    return (
        <div className="bottom-4 left-0 right-0 flex justify-center z-50">
            <FloatingDock
                items={items}
                desktopClassName="relative bg-gray-50 dark:bg-neutral-900 rounded-2xl px-4 py-2 shadow-lg"
                mobileClassName="fixed bottom-4 right-20"
            />
        </div>
    );
}

export default Footer;
