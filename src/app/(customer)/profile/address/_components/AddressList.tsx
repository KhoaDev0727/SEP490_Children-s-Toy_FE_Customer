"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddressCard, { type Address } from "./AddressCard";
import AddressModal from "./AddressModal";
import { addressApi } from "@/features/address/services/address-api";
import type { DistrictOption, ProvinceOption, WardOption } from "@/features/address/types/address";

const toViewModel = (item: Awaited<ReturnType<typeof addressApi.getMyAddresses>>[number]): Address => ({
  id: item.addressId,
  name: item.recipientName,
  phone: item.phoneNumber,
  street: item.addressLine,
  ward: item.wardName ?? "",
  district: item.districtName ?? "",
  city: item.provinceName ?? "",
  wardCode: item.wardCode,
  districtId: item.districtId,
  provinceId: item.provinceId,
  isDefault: item.isDefault,
});

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const isMaxAddresses = addresses.length >= 5;

  const loadAddresses = useCallback(async () => {
    const data = await addressApi.getMyAddresses();
    setAddresses(data.map(toViewModel));
  }, []);

  useEffect(() => {
    void loadAddresses();
    addressApi.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, [loadAddresses]);

  // Prevent scrolling when delete confirmation is open
  useEffect(() => {
    if (deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteConfirmId]);

  const handleProvinceChange = useCallback(async (provinceId: number) => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    const items = await addressApi.getDistricts(provinceId);
    setDistricts(items);
    setWards([]);
  }, []);

  const handleDistrictChange = useCallback(async (districtId: number) => {
    if (!districtId) {
      setWards([]);
      return;
    }

    const items = await addressApi.getWards(districtId);
    setWards(items);
  }, []);

  const handleEdit = async (address: Address) => {
    setEditingAddress(address);
    if (address.provinceId) {
      await handleProvinceChange(address.provinceId);
    }
    if (address.districtId) {
      await handleDistrictChange(address.districtId);
    }
    setModalOpen(true);
  };

  const handleSave = async (data: {
    id?: number;
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    provinceId: number;
    districtId: number;
    wardCode: string;
    isDefault: boolean;
  }) => {
    if (data.id) {
      await addressApi.updateAddress(data.id, data);
    } else {
      await addressApi.createAddress(data);
    }
    await loadAddresses();
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await addressApi.deleteAddress(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadAddresses();
    }
  };

  const handleSetDefault = async (id: number) => {
    await addressApi.updateAddress(id, { isDefault: true });
    await loadAddresses();
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">My Addresses</h1>
          <p className="mt-1 text-sm text-[#475569]">Manage your delivery addresses for fast checkout.</p>
        </div>
        <button
          onClick={() => {
            if (isMaxAddresses) return;
            setEditingAddress(null);
            setDistricts([]);
            setWards([]);
            setModalOpen(true);
          }}
          disabled={isMaxAddresses}
          title={isMaxAddresses ? "Maximum 5 addresses reached" : "Add new address"}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0 ${
            isMaxAddresses ? "bg-[#ff4f00]/50 cursor-not-allowed" : "bg-[#ff4f00]"
          }`}
        >
          Add new address
        </button>
      </div>

      <div className="flex flex-col p-6 gap-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-[#ff4f00]/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#ff4f00] text-3xl">location_off</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No addresses found</h3>
            <p className="text-sm text-slate-500 max-w-[250px]">
              You haven't added any shipping addresses yet. Add one to make checkout faster!
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={address.isDefault ? undefined : setDeleteConfirmId}
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
        provinces={provinces}
        districts={districts}
        wards={wards}
        onProvinceChange={handleProvinceChange}
        onDistrictChange={handleDistrictChange}
      />

      {deleteConfirmId && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0f172a]/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative z-10 bg-white w-full max-w-sm mx-4 rounded-xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="mb-4">
              <h3 className="font-bold text-[#0f172a] text-lg">Delete address</h3>
              <p className="text-sm text-[#475569] mt-1">Are you sure you want to delete this address?</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow-md shadow-red-600/10 hover:-translate-y-0.5 transition-all">
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
