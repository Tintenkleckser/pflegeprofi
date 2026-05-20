export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: 'Account deletion is not configured',
          detail: 'SUPABASE_SERVICE_ROLE_KEY must be set on the server to delete Supabase Auth users.',
        },
        { status: 500 },
      );
    }

    await prisma.profile.delete({
      where: { id: user.id },
    }).catch((deleteError: any) => {
      if (deleteError?.code !== 'P2025') throw deleteError;
    });

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return NextResponse.json(
        {
          error: 'Auth account deletion failed',
          detail: deleteUserError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
  }
}
