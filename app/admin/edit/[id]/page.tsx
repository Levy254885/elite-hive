import AdminShell from "@/components/admin/AdminShell";
import Editor from "@/components/admin/Editor";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminShell>
      <Editor id={id} />
    </AdminShell>
  );
}
