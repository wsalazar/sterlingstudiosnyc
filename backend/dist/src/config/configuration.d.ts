declare const _default: () => {
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    database: {
        url: string;
        directUrl: string;
    };
    auth: {
        saltRounds: number;
        jwtSecret: string;
    };
    cors: {
        origin: string;
    };
};
export default _default;
