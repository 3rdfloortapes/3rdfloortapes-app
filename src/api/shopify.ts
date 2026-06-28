const SHOPIFY_DOMAIN = '3rdfloortapes.com';
const STOREFRONT_API_VERSION = '2026-04';
const STOREFRONT_ACCESS_TOKEN = '5fabb532b22a5f0c4647ec4b47d4ae54';
const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;

async function storefrontQuery(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);
  const json = await response.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function fetchCollections(first = 20) {
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges { node { id title handle description image { url altText } } }
      }
    }
  `;
  const data = await storefrontQuery(query, { first });
  return data.collections.edges.map((e: any) => e.node);
}

export async function fetchProductsByCollection(collectionHandle: string, first = 24, after?: string) {
  const query = `
    query GetCollectionProducts($handle: String!, $first: Int!, $after: String) {
      collection(handle: $handle) {
        id title
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id title handle availableForSale description
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 10) { edges { node { url altText } } }
              variants(first: 1) { edges { node { id availableForSale price { amount currencyCode } } } }
              tags
            }
          }
        }
      }
    }
  `;
  const data = await storefrontQuery(query, { handle: collectionHandle, first, after });
  return {
    title: data.collection.title,
    products: data.collection.products.edges.map((e: any) => e.node),
    pageInfo: data.collection.products.pageInfo,
  };
}

export async function searchProducts(query: string, first = 20) {
  const gql = `
    query SearchProducts($query: String!, $first: Int!) {
      products(query: $query, first: $first) {
        edges {
          node {
            id title handle availableForSale description
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
            variants(first: 1) { edges { node { id availableForSale price { amount currencyCode } } } }
            tags
          }
        }
      }
    }
  `;
  const data = await storefrontQuery(gql, { query, first });
  return data.products.edges.map((e: any) => e.node);
}

export async function createCart() {
  const mutation = `
    mutation CartCreate {
      cartCreate {
        cart {
          id checkoutUrl
          lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first: 1) { edges { node { url } } } } } } } } }
          cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } }
        }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontQuery(mutation);
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, variantId: string, quantity = 1) {
  const mutation = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id checkoutUrl
          lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first: 1) { edges { node { url } } } } } } } } }
          cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } }
        }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontQuery(mutation, { cartId, lines: [{ merchandiseId: variantId, quantity }] });
  return data.cartLinesAdd.cart;
}

export async function removeFromCart(cartId: string, lineId: string) {
  const mutation = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id checkoutUrl
          lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first: 1) { edges { node { url } } } } } } } } }
          cost { totalAmount { amount currencyCode } }
        }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontQuery(mutation, { cartId, lineIds: [lineId] });
  return data.cartLinesRemove.cart;
}

export function formatPrice(amount: string, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(parseFloat(amount));
}

export function getProductImage(product: any): string | null {
  return product?.images?.edges?.[0]?.node?.url ?? null;
}

export function getFirstVariant(product: any) {
  return product?.variants?.edges?.[0]?.node ?? null;
}
