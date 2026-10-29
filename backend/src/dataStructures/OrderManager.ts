import { Queue } from "./Queue";

export type OrderStatus = "Pending" | "In Transit" | "Delivered";

export interface Order {
  id: string;
  source: string;
  destination: string;
  status: OrderStatus;
}

export class OrderManager {
  private queue: Queue<Order>;
  private statusMap: Map<string, OrderStatus>;

  constructor() {
    this.queue = new Queue<Order>();
    this.statusMap = new Map();
  }

  addOrder(order: Order) {
    this.queue.enqueue(order);
    this.statusMap.set(order.id, "Pending");
  }

  getNextOrder(): Order | undefined {
    return this.queue.dequeue();
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    if (this.statusMap.has(orderId)) {
      this.statusMap.set(orderId, status);
    }
  }

  getOrderStatus(orderId: string): OrderStatus | undefined {
    return this.statusMap.get(orderId);
  }

  getAllOrderStatuses(): Record<string, OrderStatus> {
    const statuses: Record<string, OrderStatus> = {};
    for (const [id, status] of this.statusMap) {
      statuses[id] = status;
    }
    return statuses;
  }

  getPendingQueue(): Order[] {
    return this.queue.getItems();
  }
}
