"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ChildCard from "./ChildCard";
import AddEditChildModal from "./AddEditChildModal";
import { childrenApi } from "@/features/profile/services/children-api";
import { Child, CreateChildPayload, UpdateChildPayload } from "@/features/profile/types/children";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";

export default function ChildrenGrid() {
  const maxChildProfileEdits = 2;
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  // Prevent scrolling when delete confirmation is open
  useEffect(() => {
    if (deleteConfirm !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteConfirm]);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const data = await childrenApi.getMyChildren();
      setChildren(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch children:", error);
      }
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
    if (child.editCount >= maxChildProfileEdits) {
      toast.error(`You can only edit a child profile up to ${maxChildProfileEdits} times.`);
      return;
    }
    setEditTarget(child);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateChildPayload | UpdateChildPayload) => {
    try {
      const incomingDob = data.dob ? data.dob.split("T")[0] : "";
      if (incomingDob) {
        const duplicate = children.some((child) => {
          if (editTarget && child.childId === editTarget.childId) return false;
          return child.dob.split("T")[0] === incomingDob;
        });
        if (duplicate) {
          toast("Warning: This date of birth already exists for another child.");
        }
      }

      if (editTarget) {
        if (editTarget.editCount >= maxChildProfileEdits) {
          toast.error(`You can only edit a child profile up to ${maxChildProfileEdits} times.`);
          return;
        }
        await childrenApi.updateChild(editTarget.childId, data as UpdateChildPayload);
        toast.success("Child profile updated successfully");
      } else {
        await childrenApi.createChild(data as CreateChildPayload);
        toast.success("Child profile added successfully");
      }
      fetchChildren();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{
        errors?: Record<string, string[]>;
        message?: string;
      }>;
      const errorData = axiosError.response?.data;
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
      <div className="px-6 py-4 border-b border-gray-200/60 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Children's Birthdays</h1>
          <p className="text-sm text-gray-500">
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
          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${
            children.length >= 4 ? "bg-[#ff6a00]/50 cursor-not-allowed" : "bg-[#ff6a00]"
          }`}
        >
          Add new child
        </button>
      </div>

      {/* Cards grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-[180px] bg-slate-50 animate-pulse rounded-xl border border-gray-200/80" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ff4f00]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-[#ff4f00]">child_care</span>
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">No children profiles yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Add your children's birthdays to receive special offers!
            </p>
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
      {deleteConfirm !== null && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center border border-gray-200/80">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-155">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete child profile?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. Are you sure you want to delete?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isDeleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}
