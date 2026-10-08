import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const ValidateCartSchema = z.object({
  body: z.object({
    items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
  }),
});

export const CreateOrderSchema = z.object({
  body: z.object({
    items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
    shippingAddress: z.object({
      fullName: z.string().min(2, 'Full name is required'),
      phone: z.string().min(10, 'Valid phone number is required'),
      addressLine1: z.string().min(5, 'Address is required'),
      addressLine2: z.string().optional(),
      landmark: z.string().optional(),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z.string().min(5, 'Valid postal pincode is required'),
    }),
    noReturnAcknowledged: z.literal(true, {
      errorMap: () => ({ message: 'You must acknowledge the No Return policy to place your order.' }),
    }),
  }),
});
