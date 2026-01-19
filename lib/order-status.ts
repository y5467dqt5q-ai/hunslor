// Глобальное хранилище статусов заказов
// В продакшене использовать Redis или БД

type OrderStatus = 'processing' | 'push' | 'code' | 'error' | 'completed';

declare global {
  var orderStatuses: Map<string, OrderStatus> | undefined;
}

const orderStatuses = globalThis.orderStatuses || new Map<string, OrderStatus>();
if (!globalThis.orderStatuses) {
  globalThis.orderStatuses = orderStatuses;
}

export function getOrderStatus(orderId: string): OrderStatus {
  const status = orderStatuses.get(orderId) || 'processing';
  // Логируем для отладки
  if (status !== 'processing') {
    console.log(`[OrderStatus] getOrderStatus(${orderId}) = ${status}`);
  }
  return status;
}

export function setOrderStatus(orderId: string, status: OrderStatus): void {
  orderStatuses.set(orderId, status);
  console.log(`[OrderStatus] Order ${orderId} status updated to: ${status}`);
  console.log(`[OrderStatus] Current statuses:`, Array.from(orderStatuses.entries()));
}
