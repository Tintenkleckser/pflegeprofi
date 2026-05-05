import { createClient } from './server';
import { prisma } from '@/lib/db';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryOnPoolTimeout<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error?.code !== 'P2024' && !String(error?.message ?? '').includes('connection pool')) {
        throw error;
      }
      await wait(400 * (attempt + 1));
    }
  }

  throw lastError;
}

/**
 * Get the authenticated user and their profile from the database.
 * Use in API routes and Server Components.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;

  // Get or create profile
  let profile = await retryOnPoolTimeout(() =>
    prisma.profile.findUnique({
      where: { id: user.id },
    })
  );

  if (!profile) {
    // Auto-create profile on first login
    profile = await retryOnPoolTimeout(() =>
      prisma.profile.create({
        data: {
          id: user.id,
          email: user.email || '',
          nativeLanguage: 'tr',
        },
      })
    );
  }

  return {
    id: user.id,
    email: user.email || profile.email,
    nativeLanguage: profile.nativeLanguage,
  };
}
