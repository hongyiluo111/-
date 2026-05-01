export const statusLabels: Record<string, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const paymentLabels: Record<string, string> = {
  unpaid: '未支付',
  paid: '已支付',
  refunded: '已退款',
};
