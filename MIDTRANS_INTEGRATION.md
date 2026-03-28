# Midtrans Payment Integration

## Overview

This project is integrated with Midtrans payment gateway for processing gold purchase payments. The integration supports multiple payment methods including QRIS, GoPay, OVO, bank transfers, and credit cards.

## Prerequisites

1. **Midtrans Account**: You need to have a Midtrans account with active credentials
2. **Environment Variables**: Configure your Midtrans credentials in `.env` file

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY"
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SERVER_KEY"
```

**Note:**
- For sandbox/testing: Use your sandbox credentials with `SB-Mid-` prefix
- For production: Set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="true"` and use production credentials

### 2. Database Setup

The database schema includes two new tables for payment tracking:

**payments table**:
- Stores payment transactions
- Tracks payment status (pending, success, failed)
- Links to users via `user_id`

**transactions table**:
- Stores successful payment credits/debits
- Automatically updated when payment is successful

**SQL Migration**:
```sql
-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  transaction_status TEXT,
  fraud_status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Usage

### 1. Payment Component

The `PaymentForm` component provides a complete payment interface:

```tsx
import PaymentForm from '@/components/payment-form'

<PaymentForm
  amount={100000}
  orderId="ORDER-123"
  description="Pembelian Emas"
  onSuccess={() => console.log('Payment successful')}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

### 2. Payment Page

Navigate to `/dashboard/payment` with query parameters:

```
/dashboard/payment?amount=100000&orderId=ORDER-123&description=Pembelian%20Emas&redirect=/dashboard/vault
```

**Parameters:**
- `amount` (required): Payment amount in IDR
- `orderId` (required): Unique order identifier
- `description` (optional): Payment description
- `redirect` (optional): URL to redirect after successful payment

### 3. Programmatic Payment Creation

Use the Midtrans utility service:

```typescript
import midtransService from '@/lib/midtrans'

// Create transaction
const { token, redirectUrl } = await midtransService.createTransaction({
  transactionDetails: {
    orderId: 'ORDER-123',
    grossAmount: 100000,
  },
  customerDetails: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+6281234567890',
  },
  itemDetails: [{
    id: 'ITEM-1',
    price: 100000,
    quantity: 1,
    name: 'Emas 1 gram',
  }],
})
```

## API Endpoints

### 1. Create Transaction

**POST** `/api/payment/create-transaction`

Creates a new Midtrans transaction and returns the snap token.

**Request Body:**
```json
{
  "orderId": "ORDER-123",
  "grossAmount": 100000,
  "description": "Pembelian Emas",
  "customerDetails": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+6281234567890"
  },
  "itemDetails": [
    {
      "id": "ITEM-1",
      "price": 100000,
      "quantity": 1,
      "name": "Emas 1 gram"
    }
  ]
}
```

**Response:**
```json
{
  "token": "SNAP_TOKEN_HERE",
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v3/pay?token=..."
}
```

### 2. Payment Notification Webhook

**POST** `/api/payment/notification`

Handles payment status notifications from Midtrans.

**Request:** Midtrans will send payment notification JSON

**Response:**
```json
{
  "status": "success",
  "paymentStatus": "success"
}
```

**Payment Status Flow:**
- `pending` → Payment initiated, waiting for user action
- `success` → Payment completed successfully
- `failed` → Payment failed or expired
- `challenge` → Payment under fraud review

## Integration with Gold Purchase Flow

### Example: Payment for Gold Purchase

```typescript
// 1. Create order ID
const orderId = `GOLD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 2. Create payment record
const { data: payment } = await supabase
  .from('payments')
  .insert({
    order_id: orderId,
    user_id: user.id,
    amount: totalPrice,
    description: 'Pembelian Emas',
    status: 'pending',
  })
  .select()
  .single()

// 3. Redirect to payment page
router.push(
  `/dashboard/payment?amount=${totalPrice}&orderId=${orderId}&description=Pembelian Emas&redirect=/dashboard/vault`
)
```

### Handle Payment Success

After successful payment, the system automatically:
1. Updates payment status to `success`
2. Creates a credit transaction record
3. Redirects to the specified redirect URL

## Testing

### Sandbox Testing

1. **Use Sandbox Credentials**:
   - Client Key: `SB-Mid-client-YOUR_CLIENT_KEY`
   - Server Key: `SB-Mid-server-YOUR_SERVER_KEY`

2. **Test Payment Methods**:
   - QRIS: Use any QRIS scanner app
   - GoPay/OVO: Use sandbox numbers provided by Midtrans
   - Bank Transfer: Use BCA, Mandiri, BNI virtual accounts
   - Credit Card: Use test card numbers (e.g., 4000 0012 3456 7890)

3. **Test Card Numbers** (for sandbox):
   - Success: `4000 0012 3456 7890` (any expiry date, any CVV)
   - Denied: `4000 0012 4343 4343`
   - Bank System Error: `4000 0012 5656 5656`

### Production Testing

1. **Switch to Production**:
   ```env
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="true"
   ```

2. **Use Production Credentials**:
   - Remove `SB-Mid-` prefix from keys
   - Test with real payment methods

## Troubleshooting

### Common Issues

**1. "Transaction token not found"**
- Check server key in `.env`
- Ensure `isProduction` flag matches your environment

**2. "Payment notification failed"**
- Verify webhook URL is accessible
- Check RLS policies on payments table
- Review server logs for specific error

**3. "Payment status not updating"**
- Ensure `/api/payment/notification` endpoint is working
- Check database permissions
- Verify Midtrans is sending notifications

**4. "Redirect URL not working"**
- Ensure redirect parameter is properly URL-encoded
- Check if user is authenticated at redirect destination

### Debugging

Enable detailed logging in the notification handler:

```typescript
console.log('Payment notification received:', notificationJson)
console.log('Payment status:', statusResponse.transaction_status)
console.log('Fraud status:', statusResponse.fraud_status)
```

## Security Considerations

1. **Never expose server keys** in client-side code
2. **Always validate** order amounts before processing
3. **Use HTTPS** for all payment-related requests
4. **Implement proper RLS** on database tables
5. **Verify webhook signatures** in production (future enhancement)

## Midtrans Documentation

- [Midtrans Official Docs](https://midtrans.com/docs)
- [Snap API Reference](https://midtrans.com/docs/snap-integration)
- [Test Card Numbers](https://midtrans.com/docs/test-credit-card)

## Support

For issues or questions:
1. Check Midtrans dashboard for transaction logs
2. Review server console logs
3. Verify all environment variables are set correctly
4. Ensure database migrations have been applied
