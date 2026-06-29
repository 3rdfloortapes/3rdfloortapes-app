const OFFER_API_BASE = "https://threerdfloortapes-backend.onrender.com";

export interface SubmitOfferParams {
  product_id: string;
  variant_id: string;
  product_title: string;
  product_image?: string;
  list_price: number;
  offer_price: number;
  buyer_name: string;
  buyer_email: string;
  buyer_push_token?: string;
  message?: string;
}

export interface Offer {
  id: string;
  product_title: string;
  product_image?: string;
  list_price: number;
  offer_price: number;
  counter_price?: number;
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  discount_code?: string;
  owner_note?: string;
  created_at: string;
  updated_at: string;
}

async function apiCall(path: string, options?: RequestInit) {
  const res = await fetch(`${OFFER_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export async function submitOffer(params: SubmitOfferParams) {
  return apiCall('/offers', { method: 'POST', body: JSON.stringify(params) });
}

export async function getOfferStatus(offerId: string): Promise<Offer> {
  return apiCall(`/offers/${offerId}`);
}

export async function acceptCounterOffer(offerId: string) {
  return apiCall(`/offers/${offerId}/accept-counter`, { method: 'POST' });
}
