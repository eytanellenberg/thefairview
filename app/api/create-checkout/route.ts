import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const { tier, email } = await request.json();
    
    const prices = {
      premium: 'price_1234567890', // À remplacer par votre Stripe Price ID
      club: 'price_0987654321'
    };
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[tier as keyof typeof prices],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://thefairview-sport.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://thefairview-sport.vercel.app'}/premium`,
      customer_email: email,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 30, // 1 mois gratuit
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
