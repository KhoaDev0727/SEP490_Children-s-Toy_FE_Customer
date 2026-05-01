"use client";

import { useEffect, useState } from "react";
import type { Address } from "./AddressCard";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<Address, "id"> & { id?: string }) => void;
  editingAddress?: Address | null;
}

const provinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Bình Dương", "Đồng Nai"];

const districtsByProvince: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Quận Bình Thạnh", "Quận 10", "Thủ Đức"],
  "Hà Nội": ["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Cầu Giấy", "Thanh Xuân"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn"],
  "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An"],
  "Đồng Nai": ["Biên Hòa", "Long Khánh", "Nhơn Trạch"],
};

const wardsByDistrict: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Đa Kao"],
  "Quận Bình Thạnh": ["Phường 1", "Phường 3", "Phường 12", "Phường 22", "Phường 25"],
  "Quận 10": ["Phường 1", "Phường 4", "Phường 10", "Phường 15"],
  "Ninh Kiều": ["Phường An Bình", "Phường An Cư", "Phường Hưng Lợi", "Phường Tân An"],
};

export default function AddressModal({ isOpen, onClose, onSave, editingAddress }: AddressModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    street: "",
    isDefault: false,
  });

  useEffect(() => {
    if (editingAddress) {
      setForm({
        name: editingAddress.name,
        phone: editingAddress.phone,
        city: editingAddress.city,
        district: editingAddress.district,
        ward: editingAddress.ward,
        street: editingAddress.street,
        isDefault: editingAddress.isDefault ?? false,
      });
    } else {
      setForm({ name: "", phone: "", city: "", district: "", ward: "", street: "", isDefault: false });
    }
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const districts = form.city ? (districtsByProvince[form.city] ?? []) : [];
  const wards = form.district ? (wardsByDistrict[form.district] ?? []) : [];

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.city || !form.street) return;
    onSave({
      ...(editingAddress?.id ? { id: editingAddress.id } : {}),
      ...form,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Họ và tên</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Họ và tên"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(+84) ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Tỉnh/Thành phố</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value, district: "", ward: "" })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm text-slate-700"
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Quận/Huyện</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value, ward: "" })}
                disabled={!form.city}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm text-slate-700 disabled:opacity-50"
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Phường/Xã</label>
              <select
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                disabled={!form.district}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm text-slate-700 disabled:opacity-50"
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Địa chỉ cụ thể</label>
            <textarea
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              placeholder="Số nhà, tên đường, tòa nhà..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#a14000] focus:border-transparent outline-none transition-all text-sm resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-slate-300 accent-[#a14000]"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
              Đặt làm địa chỉ mặc định
            </span>
          </label>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-[#ff6a00] hover:bg-[#e65f00] text-white font-medium shadow-lg shadow-orange-500/20 transition-all text-sm"
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
}
