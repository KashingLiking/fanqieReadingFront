// src/api/order.ts
import {axios} from '@/utils/request' // 你自己的 axios 封装路径，根据项目实际调整

// 1️⃣ 提交订单
export const createOrder = (data: {
    cartItemIds: string[],
    shipping_address: {
        name: string,
        phone: string,
        zipCode: string,
        detail: string
    },
    payment_method: string
}) => {
    return axios.post('/api/cart/checkout', data);
};

// 2️⃣ 发起支付
export const payOrder = (orderId: number) => {
    return axios.post<ResponseVO<AliPayVO>>(`/api/orders/${orderId}/pay`);
};

interface ResponseVO<T> {
    code: number;
    message: string;
    data: T;
}

interface AliPayVO {
    paymentForm: string;
    orderId: string;
    totalAmount: number;
    paymentMethod: string;
}
