export interface User {
    id?: number;
    username: string;
    email: string;
    name: string;
    surname: string;
    birthDate: string;
}

export interface Item {
    id: number;
    name: string;
    price: number;
    description?: string;
}

export interface Order {
    id: number;
    userId: number;
    status: 'PAYMENT_PENDING' | 'CONFIRMED' | string;
    createdDate: string;
    items?: Item[];
}

export interface LoginCredentials {
    username: string;
    password?: string;
}

export interface RegisterData extends User {
    password?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
