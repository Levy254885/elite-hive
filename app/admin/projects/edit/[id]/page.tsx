import AdminShell from "@/components/admin/AdminShell";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminShell>
      <ProjectEditor id={id} />
    </AdminShell>
  );
}
