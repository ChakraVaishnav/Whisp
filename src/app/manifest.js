export default function manifest() {
    return {
        name: 'Whisp - Encrypted Chat',
        short_name: 'Whisp',
        description: 'A modern, encrypted chat app focused on privacy, simplicity, and speed.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
