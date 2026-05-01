"use client";

import { useState } from "react";
import AddressCard, { type Address } from "./AddressCard";
import AddressModal from "./AddressModal";

const initialAddresses: Address[] = [
  {
    id: "1",
    name: "Nguyễn Văn Khách",
    phone: "(+84) 912 345 678",
    street: "Tòa nhà Landmark 81, 720A Điện Biên Phủ",
    ward: "Phường 22",
    district: "Quận Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: "2",
    name: "Nguyễn Văn Khách",
    phone: "(+84) 987 654 321",
    street: "Số 123 Đường Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
  },
  {
    id: "3",
    name: "Trần Thị B",
    phone: "(+84) 901 234 567",
    street: "Căn hộ 12A, Tòa A, Chung cư An Bình",
    ward: "Phường 10",
    district: "Quận 10",
    city: "TP. Hồ Chí Minh",
  },
];

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Address, "id"> & { id?: string }) => {
    if (data.id) {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === data.id) return { ...a, ...data } as Address;
          if (data.isDefault) return { ...a, isDefault: false };
          return a;
        }),
      );
    } else {
      const newAddress: Address = {
        ...data,
        id: Date.now().toString(),
      };
      setAddresses((prev) => {
        const updated = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        return [...updated, newAddress];
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setAddresses((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-bold text-[#261812]">Địa chỉ của tôi</h1>
        <button
          onClick={handleAdd}
          className="bg-[#ff6a00] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e65f00] transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm địa chỉ mới
        </button>
      </div>

      <div className="flex flex-col p-6 gap-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#5a4136]">
            <span className="material-symbols-outlined text-5xl opacity-30 mb-3">location_off</span>
            <p className="text-sm">Bạn chưa có địa chỉ nào.</p>
            <button onClick={handleAdd} className="mt-4 text-[#a14000] text-sm font-medium hover:underline">
              + Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={address.isDefault ? undefined : handleDelete}
              onSetDefault={address.isDefault ? undefined : handleSetDefault}
            />
          ))
        )}
      </div>

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingAddress={editingAddress}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white w-full max-w-sm mx-4 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Xóa địa chỉ</h3>
                <p className="text-sm text-slate-500">Bạn có chắc chắn muốn xóa địa chỉ này?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
