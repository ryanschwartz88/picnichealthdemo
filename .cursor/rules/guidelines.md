---
description: "Core guidelines for the PicnicHealth Account Strategy Planning Tool prototype. Enforces tech stack, architecture, and coding standards. Act as a senior software engineer pair-programming on a production-grade prototype."
alwaysApply: true
---

# Account Strategy Planning Tool - Project Rules

## 1. Core Philosophy

- **Act as a Senior Engineer**: Your role is a senior software engineer pair-programming with me. Prioritize clean, readable, scalable, and production-ready code.
- **Explain Decisions**: Briefly justify significant architectural or implementation choices in code comments or your explanations.
- **Adhere to the Plan**: All code must align with the architecture defined in the `README.md` (Next.js, Supabase, Gumloop with webhooks). Do not deviate or introduce new core technologies.

## 2. Tech Stack & Libraries

- **Primary Stack**: Strictly use Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.
- **UI Components**: Exclusively use **Shadcn/ui** components for all UI elements (Buttons, Cards, Modals, etc.). Do not use plain HTML elements like `<button>` or `<input>` where a Shadcn equivalent exists. Assume components are added via the Shadcn CLI as needed.
- **Icons**: Use the `lucide-react` library for all icons, as it is the default for Shadcn/ui.
- **Animations**: Use Motion Primitives (`framer-motion`) for fluid, performant animations.

## 3. Architecture & Patterns

- **API Routes**:
  - Place all API logic within the `app/api/` directory.
  - Key endpoints are `/api/generate-strategy` (client to server) and `/api/gumloop-webhook` (Gumloop to server).
  - API routes must be lean and act primarily as controllers that call other services or trigger external webhooks.
- **Asynchronous Flow**:
  - Remember that the AI generation is **asynchronous**. The frontend should not wait for the Gumloop flow to complete.
  - The UI must update in real-time based on Supabase subscriptions when the webhook completes.
- **Data Fetching**:
  - All Supabase client-side logic **must** be encapsulated in custom hooks (e.g., `useStrategies(accountId)`).
  - Do not write Supabase queries directly inside React components.
- **State Management**: Use only React hooks (`useState`, `useReducer`, `useContext`) for state. Do not introduce libraries like Redux or Zustand.
- **Error Handling & Loading States**:
  - Implement loading states for all asynchronous operations. Use **Shadcn `Skeleton`** components to prevent layout shift.
  - Display user-facing errors gracefully using **Shadcn `Toast` or `Alert`**. Do not use `window.alert()`.

## 4. Code Quality & Standards

- **TypeScript First**: Use strict TypeScript. **Avoid the `any` type at all costs.** Define interfaces or types for all Supabase table rows and API payloads.
- **JSDoc Comments**: Add JSDoc comments to all custom hooks, API routes, and complex functions.
- **Environment Variables**: All secret keys (Supabase URL/anon key, Gumloop Webhook URL, etc.) **must** be accessed from `.env.local` via `process.env`. Never hardcode secrets.
- **Code Style**: Follow ESLint and Prettier configurations. Use consistent naming conventions.

## 5. Data Models & Types

Based on the README, define these core types:

```typescript
// lib/types.ts
export interface Account {
  id: string;
  name: string;
  created_at: string;
}

export interface Strategy {
  id: string;
  account_id: string;
  user_id: string;
  title: string;
  status: 'pending' | 'generating' | 'complete' | 'failed';
  inputs: Record<string, any>;
  priorities: Record<string, any> | null;
  key_assets: Record<string, any> | null;
  opportunities: Record<string, any> | null;
  contacts: Record<string, any> | null;
  created_at: string;
}

export interface GenerateStrategyRequest {
  accountName: string;
  title: string;
  customURL?: string;
  focusArea?: string;
}

export interface GumloopWebhookPayload {
  strategyId: string;
  priorities: Record<string, any>;
  keyAssets: Record<string, any>;
  opportunities: Record<string, any>;
  contacts: Record<string, any>;
}
```

## 6. Code Templates & Snippets

### Template: Shadcn/ui React Component

When creating a new component, follow this structure:

```typescript
// app/components/app/StrategyCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StrategyCardProps {
  title: string;
  data: Record<string, any> | null;
  isLoading: boolean;
}

/**
 * A reusable card component to display a section of the AI-generated strategy.
 * Handles its own loading and empty states.
 * @param {StrategyCardProps} props - The component props.
 */
export const StrategyCard = ({ title, data, isLoading }: StrategyCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          {/* Render the actual data here */}
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">No data available.</p>
        )}
      </CardContent>
    </Card>
  );
};
```

### Template: Supabase Data Hook

When creating a data-fetching hook, use this pattern:

```typescript
// app/hooks/useStrategies.ts

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; // Assumes you have a client helper
import type { Strategy } from "@/lib/types"; // Assumes a types file

/**
 * Custom hook to fetch and subscribe to strategy updates for a given account.
 * @param {string | null} accountId - The ID of the account to fetch strategies for.
 * @returns {{ strategies: Strategy[], isLoading: boolean, error: string | null }}
 */
export function useStrategies(accountId: string | null) {
  const supabase = createClient();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setIsLoading(false);
      setStrategies([]);
      return;
    };

    const fetchStrategies = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("account_id", accountId);

      if (error) {
        setError(error.message);
        console.error("Error fetching strategies:", error);
      } else {
        setStrategies(data || []);
      }
      setIsLoading(false);
    };

    fetchStrategies();

    const channel = supabase
      .channel(`strategies-for-${accountId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "strategies", filter: `account_id=eq.${accountId}` },
        (payload) => {
          // Naive implementation: refetch all on change.
          // A more advanced version could intelligently merge `payload.new`.
          fetchStrategies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, supabase]);

  return { strategies, isLoading, error };
}
```

### Template: API Route

```typescript
// app/api/generate-strategy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { GenerateStrategyRequest } from "@/lib/types";

/**
 * POST /api/generate-strategy
 * Initiates strategy generation for a target account via Gumloop webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateStrategyRequest = await request.json();
    const supabase = createClient();

    // Validate required fields
    if (!body.accountName || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: accountName, title" },
        { status: 400 }
      );
    }

    // Create strategy record in pending state
    const { data: strategy, error } = await supabase
      .from("strategies")
      .insert({
        account_id: body.accountName, // This should be an actual account ID
        title: body.title,
        status: "pending",
        inputs: {
          customURL: body.customURL,
          focusArea: body.focusArea,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating strategy:", error);
      return NextResponse.json(
        { error: "Failed to create strategy" },
        { status: 500 }
      );
    }

    // Trigger Gumloop flow (implement this based on your Gumloop setup)
    // await triggerGumloopFlow(strategy.id, body);

    return NextResponse.json({
      strategyId: strategy.id,
      status: "generating",
    });
  } catch (error) {
    console.error("Error in generate-strategy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 7. File Structure & Organization

Follow this exact structure:

```
app/
├── api/
│   ├── generate-strategy/
│   │   └── route.ts
│   └── gumloop-webhook/
│       └── route.ts
├── components/
│   ├── ui/              # Shadcn components (auto-generated)
│   └── app/             # Custom components
│       ├── StrategyDashboard.tsx
│       ├── AccountSidebar.tsx
│       ├── InputForm.tsx
│       └── StrategyCard.tsx
├── hooks/               # Custom React hooks
│   ├── useStrategies.ts
│   └── useAccounts.ts
├── lib/
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Utility functions
├── utils/
│   └── supabase/
│       ├── client.ts    # Client-side Supabase
│       └── server.ts    # Server-side Supabase
└── globals.css          # Global styles
```

## 8. Environment Variables

Always use these environment variables (never hardcode):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Gumloop
GUMLOOP_WEBHOOK_SECRET=
GUMLOOP_TRIGGER_URL=
```

## 9. UI/UX Guidelines

- **Loading States**: Always show skeleton loaders during data fetching
- **Error States**: Use Shadcn Alert components for errors, Toast for notifications
- **Responsive Design**: Mobile-first approach with Tailwind responsive classes
- **Accessibility**: Follow Shadcn/ui accessibility patterns
- **Real-time Updates**: Use Supabase subscriptions for live data updates

## 10. Security & Best Practices

- **Row Level Security**: Implement proper RLS policies in Supabase
- **Input Validation**: Validate all API inputs using Zod or similar
- **Error Handling**: Never expose internal errors to users
- **Type Safety**: Use strict TypeScript with no `any` types
- **Environment Secrets**: Never commit secrets to version control

## 11. Testing & Quality

- **Component Testing**: Test custom components with React Testing Library
- **API Testing**: Test API routes with proper error scenarios
- **Type Checking**: Ensure all TypeScript types are properly defined
- **Linting**: Follow ESLint rules and fix all warnings

---

**Remember**: This is a production-grade prototype. Every line of code should be clean, typed, documented, and follow these guidelines. When in doubt, prioritize code quality over speed.
