"use client";

import { useEffect, useState } from "react";
import ChildCard from "./ChildCard";
import AddEditChildModal from "./AddEditChildModal";
import { childrenApi } from "@/features/profile/services/children-api";
import { Child, CreateChildPayload, UpdateChildPayload } from "@/features/profile/types/children";
import { toast } from "react-hot-toast";

export default function ChildrenGrid() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const data = await childrenApi.getMyChildren();
      setChildren(data);
    } catch (error) {
      console.error("Failed to fetch children:", error);
      toast.error("Could not load children list");
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (child: Child) => {
    setEditTarget(child);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateChildPayload | UpdateChildPayload) => {
    try {
      if (editTarget) {
        await childrenApi.updateChild(editTarget.childId, data as UpdateChildPayload);
        toast.success("Updated successfully");
      } else {
        await childrenApi.createChild(data as CreateChildPayload);
        toast.success("Added successfully");
      }
      fetchChildren();
    } catch (error: any) {
      const errorData = error.response?.data;
      let message = "Something went wrong";

      if (errorData) {
        if (errorData.errors) {
          // Extract first validation error
          const firstKey = Object.keys(errorData.errors)[0];
          message = errorData.errors[firstKey][0];
        } else if (errorData.message) {
          message = errorData.message;
        }
      }

      toast.error(message);
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm !== null) {
      setIsDeleting(true);
      try {
        await childrenApi.deleteChild(deleteConfirm);
        toast.success("Child profile deleted");
        fetchChildren();
      } catch (error) {
        toast.error("Could not delete child profile");
      } finally {
        setIsDeleting(false);
        setDeleteConfirm(null);
      }
    }
  };


  return (
    <>
      {/* Section header */}
      <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#261812] mb-1">Children's Birthdays</h1>
          <p className="text-sm text-[#5a4136]">
            Manage information and birthdays for your children.
          </p>
        </div>
        <button
          onClick={() => {
            if (children.length >= 4) return;
            openAdd();
          }}
          disabled={children.length >= 4}
          title={children.length >= 4 ? "Maximum limit of 4 children reached" : "Add new child"}
          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-all ${
            children.length >= 4 
              ? "bg-[#ff6a00]/50 cursor-not-allowed" 
              : "bg-[#ff6a00] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {children.length >= 4 ? "lock" : "add"}
          </span>
          Add new child
        </button>
      </div>

      {/* Cards grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-[180px] bg-slate-50 animate-pulse rounded-xl border border-[#e2bfb0]/30" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffdbcc] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-[#a14000]">child_care</span>
            </div>
            <p className="text-base font-semibold text-[#261812] mb-1">No children profiles yet</p>
            <p className="text-sm text-[#5a4136] mb-6">
              Add your children's birthdays to receive special offers!
            </p>
            <button
              onClick={openAdd}
              className="bg-[#ff6a00] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              Add first child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child, index) => (
              <ChildCard
                key={child.childId}
                child={child}
                index={index}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditChildModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editTarget={editTarget}
      />

      {/* Delete confirmation dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ffdad6] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#ba1a1a] text-2xl">delete</span>
            </div>
            <h3 className="text-lg font-bold text-[#261812] mb-2">Delete child profile?</h3>
            <p className="text-sm text-[#5a4136] mb-6">
              This action cannot be undone. Are you sure you want to delete?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full border border-[#e2bfb0] text-sm font-semibold text-[#5a4136] hover:bg-[#fff1eb] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-[#ba1a1a] text-white text-sm font-semibold hover:bg-[#93000a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
