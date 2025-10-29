import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Development fallback: minimal stub to avoid crashes when env vars aren't set
    const makeQueryResult = () => {
      const result: any = {
        select: () => result,
        eq: () => result,
        single: async () => ({ data: null, error: null }),
        then: (onFulfilled: any, onRejected: any) =>
          Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected),
        catch: (onRejected: any) => Promise.resolve({ data: [], error: null }).catch(onRejected),
      };
      return result;
    };

    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null };
        },
      },
      from() {
        return makeQueryResult();
      },
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
