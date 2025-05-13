'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button, Modal, Form, Input, message } from 'antd'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'
import { useRouter } from 'next/navigation';
import { revalidateHome } from '@/action/revalidate'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51Ptwd9RuwfSTMxXEDOg4yP9eGWjHnxiOMVxnkUgTHVe8XHuY5yuVa13zSlX6sR1PGNqnHidjAGFzS4HiSIkDrDXB00gbiW5VjL')

interface PurchaseButtonProps {
  price?: number
  itemId: string
  itemType: 'Song' | 'Podcast' | 'Album'
  onSuccess : (itemId: string) => void

}

const PurchaseForm: React.FC<{ price: number; itemId: string; itemType: string; onSuccess: (itemId: string) => void }> = ({
  price,
  itemId,
  itemType,
  onSuccess,

}) => {
    const router = useRouter()
  const [form] = Form.useForm()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const token = useAtomValue(tokenAtom)

  const handlePurchase = async () => {
    if (!stripe || !elements) {
      message.error('Stripe has not loaded yet. Please try again later.')
      return
    }

    setLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found.')
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw error
      }

      const response = await axios.post(
        'http://localhost:3001/payments/purchase',
        {
          paymentMethodId: paymentMethod.id,
          amount: price,
          itemId,
          itemType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        message.success('Purchase successful!')
        onSuccess(itemId)
        router.push('home/purchase-list')
      } else {
        throw new Error(response.data.message || 'Purchase failed')
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      message.error(error.message || 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} onFinish={handlePurchase} layout="vertical">
      {/* <Form.Item label="Item Type" name="itemType" initialValue={itemType}>
        <Input disabled />
      </Form.Item>
      <Form.Item label="Item ID" name="itemId" initialValue={itemId}>
        <Input disabled />
      </Form.Item>
      <Form.Item label="Price" name="price" initialValue={`$${price.toFixed(2)}`}>
        <Input disabled />
      </Form.Item> */}
      <Form.Item
        name="card"
        label="Card Details"
        rules={[{ required: true, message: 'Please input your card details!' }]}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {loading ? 'Processing...' : `Pay $${price.toFixed(2)}`}
        </Button>
      </Form.Item>
    </Form>
  )
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ price, itemId, itemType, onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => setIsModalVisible(false)

  // Ensure price is a number and has a default value
  const safePrice = typeof price === 'number' ? price : 0
  
  const handleSuccess = (itemId: string) => {
    onSuccess(itemId);
    handleCancel();
  }
  return (
    <>
      <Button onClick={showModal}>Buy with ${safePrice.toFixed(2)}</Button>
      <Modal
        title={`Purchase ${itemType}`}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <Elements stripe={stripePromise}>
          <PurchaseForm price={safePrice} itemId={itemId} itemType={itemType} onSuccess={handleSuccess} />
        </Elements>
      </Modal>
    </>
  )
}

export default PurchaseButton