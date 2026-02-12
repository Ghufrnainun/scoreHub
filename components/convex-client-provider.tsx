'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useState, type ReactNode } from 'react';

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
  }

  const [client] = useState(() => new ConvexReactClient(convexUrl));

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
