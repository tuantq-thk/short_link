import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_TEMPLATES } from '@/features/templates/lib/template-utils';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const templateSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-zA-Z0-9._-]+$/),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(500).default(''),
    content: z.string().min(1).max(50_000),
  })
  .strict();

function storageIsSupabase() {
  return process.env.NEXT_PUBLIC_TEMPLATE_STORAGE_MODE === 'supabase';
}

function storageModeError() {
  return NextResponse.json(
    { error: 'Template storage hiện đang dùng local mode.' },
    { status: 409 },
  );
}

function mapTemplate(row: {
  id: string;
  name: string;
  description: string;
  content: string;
  built_in: boolean;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    content: row.content,
    builtIn: row.built_in,
  };
}

export async function GET() {
  if (!storageIsSupabase()) return storageModeError();
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('templates')
      .select('id, name, description, content, built_in')
      .order('built_in', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const customTemplates = (data || [])
      .filter((row) => !row.built_in)
      .map(mapTemplate)
      .filter((template) => !DEFAULT_TEMPLATES.some((builtIn) => builtIn.id === template.id));
    return NextResponse.json(
      { templates: [...DEFAULT_TEMPLATES, ...customTemplates] },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('template_list_failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Không tải được template từ Supabase.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!storageIsSupabase()) return storageModeError();
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu template chưa đúng định dạng.' }, { status: 400 });
  }
  const parsed = templateSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Template cần có id, tên và nội dung hợp lệ.' },
      { status: 400 },
    );

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('templates')
      .insert({
        id: parsed.data.id,
        name: parsed.data.name,
        description: parsed.data.description,
        content: parsed.data.content,
        built_in: false,
      })
      .select('id, name, description, content, built_in')
      .single();
    if (error) {
      if (error.code === '23505')
        return NextResponse.json({ error: 'Template id đã tồn tại.' }, { status: 409 });
      throw error;
    }
    return NextResponse.json(
      { template: mapTemplate(data) },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('template_save_failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Không lưu được template vào Supabase.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!storageIsSupabase()) return storageModeError();
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu template chưa đúng định dạng.' }, { status: 400 });
  }
  const parsed = templateSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Template cần có id, tên và nội dung hợp lệ.' },
      { status: 400 },
    );

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('templates')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        content: parsed.data.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.id)
      .eq('built_in', false)
      .select('id, name, description, content, built_in')
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: 'Không tìm thấy template để cập nhật.' }, { status: 404 });
    return NextResponse.json(
      { template: mapTemplate(data) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('template_update_failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { error: 'Không cập nhật được template trong Supabase.' },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!storageIsSupabase()) return storageModeError();
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !/^[a-zA-Z0-9._-]+$/.test(id))
    return NextResponse.json({ error: 'Template id không hợp lệ.' }, { status: 400 });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('built_in', false)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: 'Không tìm thấy template để xóa.' }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('template_delete_failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Không xóa được template khỏi Supabase.' }, { status: 503 });
  }
}
