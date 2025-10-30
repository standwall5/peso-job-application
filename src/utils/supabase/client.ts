import { createBrowserClient } from "@supabase/ssr";

type QueryResultData = { data: never[]; error: null };

type MinimalQueryResult = {
  select: () => MinimalQueryResult;
  eq: () => MinimalQueryResult;
  single: () => Promise<{ data: null; error: null }>;
  then: (
    onFulfilled?: ((value: QueryResultData) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise<unknown>;
  catch: (
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise<QueryResultData | unknown>;
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
          Promise.resolve({ data: [], error: null }).then(
            onFulfilled as (value: QueryResultData) => unknown,
            onRejected as (reason: unknown) => unknown
          ),
        catch: (onRejected) =>
          Promise.resolve({ data: [], error: null }).catch(
            onRejected as (reason: unknown) => unknown
          ),
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
