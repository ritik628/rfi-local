"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProjects, createProject, deleteProject } from "@/lib/api/api";
import toast from "react-hot-toast";
import { Building, ClipboardList, LayoutGrid } from "lucide-react";
import SobhaLogo from "@/components/ui/SobhaLogo";
import ProjectCard from "@/components/blocks/ProjectCard";
import CreateProjectModal from "@/components/blocks/modals/CreateProjectModal";
import DeleteConfirmationModal from "@/components/blocks/modals/DeleteConfirmationModal";
import PageHeader from "@/components/blocks/PageHeader";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    client: "",
    consultant: "",
    contractor: "",
  });
  const [step, setStep] = useState("idle"); // idle | creating | done
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name, rfi_count}
  const [deleteBy, setDeleteBy] = useState("");
  const [deleteNotes, setDeleteNotes] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const load = async () => {
    setLoadingProjects(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Project name is required");
    setStep("creating");
    const safetyTimer = setTimeout(() => {
      setStep("idle");
      toast.error("Request timed out — please try again");
    }, 15000);
    try {
      await createProject(form);
      clearTimeout(safetyTimer);
      setStep("done");
      toast.success("Project created");
      load();
      setTimeout(() => {
        setShowModal(false);
        setStep("idle");
        setForm({
          name: "",
          description: "",
          client: "",
          consultant: "",
          contractor: "",
        });
      }, 1200);
    } catch (err) {
      clearTimeout(safetyTimer);
      setStep("idle");
    }
  };

  const openDeleteModal = (e, p) => {
    e.stopPropagation();
    setDeleteTarget({ id: p.id, name: p.name, rfi_count: p.rfi_count || 0 });
    setDeleteBy("");
    setDeleteNotes("");
  };

  const confirmDelete = async () => {
    if (!deleteBy.trim())
      return toast.error("Please enter your name for the audit record");
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id, {
        deleted_by: deleteBy.trim(),
        notes: deleteNotes.trim(),
      });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch {}
    setDeleting(false);
  };

  const totalRFIs = projects.reduce((s, p) => s + (p.rfi_count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <PageHeader
        title="RFI Intelligence Platform"
        subtitle="Sobha Design Defect Analysis • Azure OpenAI GPT-4o"
        icon={<SobhaLogo size={46} />}
        actions={
          <button
            className="btn-base bg-primary text-primary-foreground px-7 py-3 gap-2 hover:-translate-y-[1px] hover:brightness-110 transition-all text-sm font-semibold"
            onClick={() => {
              setStep("idle");
              setShowModal(true);
            }}
          >
            <span className="text-lg leading-none -mt-[0.5px]">+</span> New Project
          </button>
        }
      />

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-11 flex flex-col gap-10">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Projects",
              value: projects.length,
              icon: <Building className="w-5 h-5" />,
              sub: "workspaces",
            },
            {
              label: "Total RFIs Loaded",
              value: totalRFIs,
              icon: <ClipboardList className="w-5 h-5" />,
              sub: "across all projects",
            },
            {
              label: "Active Workspaces",
              value: projects.filter((p) => p.rfi_count > 0).length,
              icon: <LayoutGrid className="w-5 h-5" />,
              sub: "with data",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card-base px-7 py-6 hover:bg-muted hover:border-primary/20"
            >
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="text-xl text-muted-foreground">
                  {s.icon}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              <div className="text-2xl font-semibold text-foreground leading-none tracking-tight">
                {s.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Projects section */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-[11px] font-semibold text-foreground tracking-tight m-0 uppercase tracking-wider">
              Project Workspaces
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {projects.length} workspace{projects.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingProjects ? (
            <div className="text-center py-24 px-6 border-2 border-dashed border-border rounded-[22px] bg-muted/10">
              <div className="flex justify-center mb-5 text-muted-foreground/30">
                <Building className="w-16 h-16 animate-pulse" />
              </div>
              <div className="text-[17px] font-medium text-foreground/60">
                Loading projects...
              </div>
            </div>
          ) : !projects.length && !loadingProjects ? (
            <div className="text-center py-24 px-6 border-2 border-dashed border-border rounded-[22px] bg-muted/30">
              <div className="flex justify-center mb-5 text-muted-foreground">
                <Building className="w-16 h-16" />
              </div>
              <div className="text-xl font-semibold text-foreground mb-2.5">
                No projects yet
              </div>
              <div className="text-sm text-muted-foreground mb-9 leading-relaxed">
                Create your first workspace to start uploading
                <br />
                and classifying RFIs with AI
              </div>
              <button
                className="btn-base bg-primary text-primary-foreground px-7 py-3 gap-2 hover:-translate-y-[1px] hover:brightness-110 transition-all text-[15px] font-medium"
                onClick={() => {
                  setStep("idle");
                  setShowModal(true);
                }}
              >
                + Create First Project
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onDeleteClick={openDeleteModal}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        showModal={showModal}
        setShowModal={setShowModal}
        step={step}
        form={form}
        setForm={setForm}
        handleCreate={handleCreate}
      />

      <DeleteConfirmationModal
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleting={deleting}
        deleteBy={deleteBy}
        setDeleteBy={setDeleteBy}
        deleteNotes={deleteNotes}
        setDeleteNotes={setDeleteNotes}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
