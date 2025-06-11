interface JwtDecryptedPayload {
    sub: number;
    email: string;
    fullname?: string;
    roles: string;
}

interface UserRequest {
    sub: number;
    email: string;
    fullname?: string
}