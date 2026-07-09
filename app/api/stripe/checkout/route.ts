import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PokéYou Pro Trainer Tier',
              description: 'Unlock unlimited card generations and premium themes.',
            },
            unit_amount: 500, // $5.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?canceled=true`,
      client_reference_id: userId, // Pass the Supabase User ID to the webhook
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
