"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  getCategories, addCategory, updateCategory, deleteCategory,
  addSubcategory, updateSubcategory, deleteSubcategory,
  addItem, updateItem, deleteItem,
} from "@/lib/api/api";
import toast from "react-hot-toast";
import { Info } from "lucide-react";
import PageHeader from "@/components/blocks/PageHeader";
import CategoryCard from "./components/CategoryCard";
import CategoryModal from "./components/CategoryModal";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const params = useParams();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const loadData = async () => {
    try {
      const data = await getCategories();
      
      // Deep sort: Categories -> Subcategories -> Items
      const sorted = [...data].sort((a, b) => (parseFloat(a.no) || 0) - (parseFloat(b.no) || 0));
      
      sorted.forEach(cat => {
        if (cat.subcategories) {
          cat.subcategories.sort((a, b) => (parseFloat(a.no) || 0) - (parseFloat(b.no) || 0));
          cat.subcategories.forEach(sub => {
            if (sub.items) {
              sub.items.sort((a, b) => (parseFloat(a.no) || 0) - (parseFloat(b.no) || 0));
            }
          });
        }
      });

      setCats(sorted);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (type, data = {}) => {
    setModal({ type, data });
    setForm({ ...data });
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  const handleSave = async () => {
    if (!form.no?.trim() || !form.name?.trim()) {
      return toast.error("Number and Name are required");
    }

    setSaving(true);
    try {
      const { type, data } = modal;
      
      if (type === "addCat") {
        await addCategory({ 
          no: form.no, 
          name: form.name, 
          description: form.description || "", 
          added_by: form.added_by || "" 
        });
        toast.success("Category added");
      } else if (type === "editCat") {
        await updateCategory(data.id, { 
          no: form.no, 
          name: form.name, 
          description: form.description 
        });
        toast.success("Category updated");
      } else if (type === "addSub") {
        await addSubcategory({ 
          no: form.no, 
          name: form.name, 
          category_id: data.id 
        });
        toast.success("Subcategory added");
      } else if (type === "editSub") {
        await updateSubcategory(data.id, { 
          no: form.no, 
          name: form.name 
        });
        toast.success("Subcategory updated");
      } else if (type === "addItem") {
        await addItem({ 
          no: form.no, 
          name: form.name, 
          subcategory_id: data.id, 
          added_by: form.added_by || "" 
        });
        toast.success("Item added");
      } else if (type === "editItem") {
        await updateItem(data.id, { 
          no: form.no, 
          name: form.name 
        });
        toast.success("Item updated");
      }
      
      closeModal();
      loadData();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id, label) => {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return;
    
    try {
      if (type === "cat") await deleteCategory(id);
      else if (type === "sub") await deleteSubcategory(id);
      else if (type === "item") await deleteItem(id);
      toast.success("Deleted successfully");
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const totalItemsCount = cats.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((sAcc, sub) => sAcc + sub.items.length, 0), 
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-muted/20 overflow-hidden">
      <PageHeader 
        title="Categories"
        subtitle={`${cats.length} design defect categories · ${totalItemsCount} classification items`}
        actions={
          <button
            onClick={() => openModal("addCat")}
            className="bg-primary/90 text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-themed p-4 md:p-[24px_48px]">
        <div className="max-w-7xl mx-auto">
          {/* Info Banner */}
          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 mb-8 flex items-start gap-4 max-w-4xl mx-auto">
            <div className="p-2 bg-primary/5 rounded-xl">
              <Info className="w-5 h-5 text-primary/70" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-primary/80 mb-1 uppercase tracking-tight">Understanding Hierarchies</h4>
              <p className="text-[13px] text-foreground/60 leading-relaxed">
                The AI classifies each RFI through a three-level hierarchy: <span className="font-medium text-foreground">Design Defect Category</span> → <span className="font-medium text-foreground">Specific Level Category</span> → <span className="font-medium text-foreground">Sub-level Item</span>. 
                Managing these correctly ensures high-accuracy AI classification.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-card/50 border border-border rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
              {cats.map((cat, idx) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={(c) => openModal("editCat", c)}
                  onDelete={(c) => handleDelete("cat", c.id, c.name)}
                  onAddSub={(c) => openModal("addSub", c)}
                  onEditSub={(s) => openModal("editSub", s)}
                  onDeleteSub={(s) => handleDelete("sub", s.id, s.name)}
                  onAddItem={(s) => openModal("addItem", s)}
                  onEditItem={(i) => openModal("editItem", i)}
                  onDeleteItem={(i) => handleDelete("item", i.id, i.name)}
                />
              ))}
            </div>
          )}

          {!loading && cats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-3xl text-center px-10 max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-[17px] font-medium text-foreground mb-2">No categories found</h3>
              <p className="text-muted-foreground text-[14px] max-w-sm mb-6">
                Start by adding your first design defect category to enable AI classification.
              </p>
              <button 
                onClick={() => openModal("addCat")}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
              >
                Add Your First Category
              </button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <CategoryModal
          type={modal.type}
          data={modal.data}
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
