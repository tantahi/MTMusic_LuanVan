'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Modal, Button } from 'antd';
import authservice from '@/services/auth.service';
import { getCookie } from '@/lib/utils';
import { PaymentRequest } from '@/types';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/atom/user.atom';

const stripePromise = loadStripe(
  'pk_test_51Ptwd9RuwfSTMxXEDOg4yP9eGWjHnxiOMVxnkUgTHVe8XHuY5yuVa13zSlX6sR1PGNqnHidjAGFzS4HiSIkDrDXB00gbiW5VjL'
);

export const PaymentModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
}> = ({ visible, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [user, setUser] = useAtom(userAtom);

  const total = 9900; // $99.00 in cents
  const tax = Math.round(total * 0.1); // 10% tax
  const price = total - tax;

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again later.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Card element not found.');
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setErrorMessage(error.message || 'Unknown error');
      setLoading(false);
      return;
    }

    try {
      const token = getCookie(document.cookie, 'token');

      if (token) {
        const paymentRequest: PaymentRequest = {
          paymentMethodId: paymentMethod?.id || '',
          amount: total, // Send the total amount to the system
        };

        const paymentResponse = await authservice.Payment(
          paymentRequest,
          token
        );

        if (paymentResponse.error) {
          setErrorMessage(paymentResponse.error);
          console.error(paymentResponse.error);
        } else {
          console.log('Payment successful!', paymentResponse);
          const data = await authservice.getMe(token)
          setUser(data.user)
          console.log(user)
          alert('Payment successful! You are now a VIP member for 1 year.');
        }
      } else {
        setErrorMessage('No token available')
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage('Payment failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Become a VIP Member for 1 Year"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <div className="bg-white p-4 font-[sans-serif]">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <div className="max-md:order-1 lg:col-span-1">
            <h2 className="text-gray-800 text-3xl font-extrabold">
              Register for VIP Membership
            </h2>
            <p className="text-gray-800 mt-4 text-sm">
              Enjoy exclusive benefits for a full year with our VIP membership. Complete your registration securely.
            </p>

            <form className="mt-8 max-w-lg" onSubmit={handlePayment}>
              <div className="grid gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Cardholder's Name"
                    className="bg-gray-100 text-gray-800 w-full rounded-md border px-4 py-3.5 text-sm outline-none focus:border-purple-500 focus:bg-transparent"
                  />
                </div>

                <div className="bg-gray-100 flex overflow-hidden rounded-md border focus-within:border-purple-500 focus-within:bg-transparent">
                  <CardElement
                    className="text-gray-800 w-full bg-transparent px-4 py-3.5 text-sm outline-none"
                    options={{ hidePostalCode: true }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-40 rounded-md bg-primary py-3.5 text-sm tracking-wide text-white hover:bg-primary-opacity"
              >
                {loading ? 'Processing...' : `Pay $${(total / 100).toFixed(2)}`}
              </button>

              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
          </div>

          <div className="bg-gray-100 rounded-md p-6 lg:col-span-1">
            <h2 className="text-gray-800 text-3xl font-extrabold">${(total / 100).toFixed(2)}</h2>

            <ul className="text-gray-800 mt-8 space-y-4">
              <li className="flex flex-wrap gap-4 text-sm">
                1 Year VIP Membership <span className="ml-auto font-bold">${(price / 100).toFixed(2)}</span>
              </li>
              <li className="flex flex-wrap gap-4 text-sm">
                Tax <span className="ml-auto font-bold">${(tax / 100).toFixed(2)}</span>
              </li>
              <li className="flex flex-wrap gap-4 border-t-2 pt-4 text-sm font-bold">
                Total <span className="ml-auto">${(total / 100).toFixed(2)}</span>
              </li>
            </ul>

            <div className="mt-8 text-sm text-gray-600">
  <h3 className="font-bold mb-2">VIP Benefits:</h3>
  <ul className="list-disc pl-5 space-y-2">
    <li>Exclusive access to premium content</li>
    <li>Priority customer support</li>
    <li>
      Ability to sell your own content:
      <ul className="list-circle pl-5 mt-1 space-y-1">
        <li>Set your own prices for songs, podcasts</li>
        <li>Keep 90% of the revenue from your sales</li>
      </ul>
    </li>
  </ul>
</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};