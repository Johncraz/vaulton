
export const PATH = {
    AUTH: {
        LOGIN: '/login'
    },
    USER: {
        ROOT: '/user'
    },
    DASHBOARD: {
        INDEX: '/'
    },
    CATEGORIES: {
        INDEX: '/categories'
    },
    SETTINGS: {
        INDEX: "/settings"
    },
    STATIC: {
        ROOT: '/static',
        CSS: '/static/css',
        LIB: '/static/lib',
        IMAGES: "/static/images"
    },
} as const;

export const ALLOWED_PATHS = ["/login", "/static"];
export const COOKIES_NAME = "session";