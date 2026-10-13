export const shippingFields: Array<{ label: string; key: 'shippingName' | 'shippingPhone' | 'shippingAddress' | 'shippingNote'; type: string; placeholder: string; textarea?: boolean }> = [
  { label: 'Full Name *', key: 'shippingName', type: 'text', placeholder: 'Nguyá»…n VÄƒn A' },
  { label: 'Phone Number *', key: 'shippingPhone', type: 'tel', placeholder: '0901234567' },
  { label: 'Shipping Address *', key: 'shippingAddress', type: 'text', placeholder: '123 ÄÆ°á»ng ABC, PhÆ°á»ng X, Quáº­n Y, TP. HCM', textarea: true },
  { label: 'Order Note (optional)', key: 'shippingNote', type: 'text', placeholder: 'Giao giá» hÃ nh chÃ­nh...' },
];
