import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#f0f7ff",
                    100: "#e0effe",
                    200: "#bae0fd",
                    300: "#7dc8fc",
                    400: "#38aaf8",
                    500: "#0e90e9",
                    600: "#0270c7",
                    700: "#035aa1",
                    800: "#074d85",
                    900: "#0c406e",
                    950: "#082949",
                },
            },
        },
    },
    plugins: [],
};

export default config;
