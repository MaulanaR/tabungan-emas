import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
})

export interface TransactionDetails {
  orderId: string
  grossAmount: number
}

export interface TransactionParams {
  transactionDetails: TransactionDetails
  customerDetails?: {
    email: string
    firstName: string
    lastName?: string
    phone?: string
  }
  itemDetails?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

export const midtransService = {
  async createTransaction(params: TransactionParams) {
    try {
      const parameter = {
        transaction_details: {
          order_id: params.transactionDetails.orderId,
          gross_amount: params.transactionDetails.grossAmount,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
      }

      const transaction = await snap.createTransaction(parameter)
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      }
    } catch (error: any) {
      console.error('Midtrans transaction error:', error)
      throw new Error(error.message || 'Failed to create transaction')
    }
  },

  async createTransactionToken(params: TransactionParams): Promise<string> {
    try {
      const parameter = {
        transaction_details: {
          order_id: params.transactionDetails.orderId,
          gross_amount: params.transactionDetails.grossAmount,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
      }

      const token = await snap.createTransactionToken(parameter)
      return token
    } catch (error: any) {
      console.error('Midtrans token error:', error)
      throw new Error(error.message || 'Failed to create transaction token')
    }
  },

  async createTransactionRedirectUrl(params: TransactionParams): Promise<string> {
    try {
      const parameter = {
        transaction_details: {
          order_id: params.transactionDetails.orderId,
          gross_amount: params.transactionDetails.grossAmount,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
      }

      const redirectUrl = await snap.createTransactionRedirectUrl(parameter)
      return redirectUrl
    } catch (error: any) {
      console.error('Midtrans redirect URL error:', error)
      throw new Error(error.message || 'Failed to create redirect URL')
    }
  },

  async handleNotification(notificationJson: any) {
    try {
      const statusResponse = await snap.transaction.notification(notificationJson)
      return statusResponse
    } catch (error: any) {
      console.error('Midtrans notification error:', error)
      throw new Error(error.message || 'Failed to handle notification')
    }
  },

  getClientKey(): string {
    return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
  },

  isProduction(): boolean {
    return process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  },

  getSnapUrl(): string {
    return this.isProduction()
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
  },
}

export default midtransService
