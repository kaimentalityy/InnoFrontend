export interface User {
    id?: string;
    email: string;
    name: string;
    surname: string;
    birthDate: string;
    roles?: string[];
}

export interface UpdateUserRequest {
    username?: string;
    password?: string;
    name?: string;
    surname?: string;
    email?: string;
    birthDate?: string;
    role?: string;
}

export interface Item {
    id: number;
    name: string;
    price: number;
    description?: string;
}

export interface OrderItem {
    itemId: number;
    quantity: number;
}

export interface Order {
    id: number;
    userId: string;
    status: 'PAYMENT_PENDING' | 'CONFIRMED' | string;
    createdDate: string;
    items?: Item[];
}

export interface CreateOrderRequest {
    userId: string;
    status: string;
    items: OrderItem[];
}

export interface Payment {
    id: number;
    orderId: number;
    userId: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    paymentDate: string;
    order?: Order;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    surname: string;
    birthDate: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
