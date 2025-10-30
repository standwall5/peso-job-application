import { createBrowserClient } from "@supabase/ssr";

type MinimalQueryResult = {
  select: () => MinimalQueryResult;
  eq: () => MinimalQueryResult;
  single: () => Promise<{ data: null; error: null }>;
  then: <T = any, TResult1 = any, TResult2 = any>(
    onFulfilled?:
      | ((value: { data: []; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
  catch: <TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ) => Promise<{ data: []; error: null } | TResult>;
};

type MinimalSupabaseClient = {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>;
  };
  from: (table?: string) => MinimalQueryResult;
};

export function createClient():
  | MinimalSupabaseClient
  | ReturnType<typeof createBrowserClient> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const makeQueryResult = (): MinimalQueryResult => {
      const result: MinimalQueryResult = {
        select: () => result,
        eq: () => result,
        single: async () => ({ data: null, error: null }),
        then: (onFulfilled, onRejected) =>
          Promise.resolve({ data: [] as [], error: null }).then(
            onFulfilled,
            onRejected
          ),
        catch: (onRejected) =>
          Promise.resolve({ data: [] as [], error: null }).catch(onRejected),
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
    };
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
