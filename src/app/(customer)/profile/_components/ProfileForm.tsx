"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];
const YEARS = Array.from({ length: 60 }, (_, i) => 2010 - i);

type Gender = "male" | "female" | "other";

export default function ProfileForm() {
  const { account } = useAuthContext();

  const [name, setName] = useState(account?.accountName ?? "");
  const [gender, setGender] = useState<Gender>("male");
  const [day, setDay] = useState("15");
  const [month, setMonth] = useState("Tháng 10");
  const [year, setYear] = useState("1990");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    account?.imageUrl ?? null
  );

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("File vượt quá 1 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSave = () => {
    toast.success("Đã lưu thay đổi!");
  };

  const initials = (account?.accountName ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const AvatarBlock = ({ size = 128 }: { size?: number }) => (
    <div
      className="rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {avatarPreview ? (
        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{
            background: "linear-gradient(135deg, #ff6a00, #ff9a3c)",
            fontSize: size * 0.28,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Avatar — desktop */}
          <div className="hidden md:flex flex-col items-center gap-4 border-r border-slate-200/60 pr-8">
            <AvatarBlock size={128} />
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Chọn ảnh
            </button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Dung lượng file tối đa 1 MB
              <br />
              Định dạng: .JPEG, .PNG
            </p>
          </div>

          {/* Avatar — mobile */}
          <div className="flex flex-col items-center gap-3 md:hidden mb-4">
            <AvatarBlock size={96} />
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="avatar-mobile"
              onChange={handleFileChange}
            />
            <label
              htmlFor="avatar-mobile"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Chọn ảnh
            </label>
          </div>

          {/* Form fields */}
          <div className="flex-grow flex flex-col gap-6">

            {/* Name */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4">
              <label className="col-span-1 text-right text-sm text-slate-500 font-medium">
                Họ và tên
              </label>
              <div className="col-span-2 md:col-span-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:border-[#ff6a00]"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4">
              <label className="col-span-1 text-right text-sm text-slate-500 font-medium">
                Email
              </label>
              <div className="col-span-2 md:col-span-3 flex items-center gap-2">
                <p className="text-sm text-slate-900">
                  {account?.email
                    ? account.email.replace(/^(.{3}).*(@.*)$/, "$1***$2")
                    : "ngu***@gmail.com"}
                </p>
                <button
                  className="text-sm font-semibold underline ml-2 transition-colors"
                  style={{ color: "#ff6a00" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#a14000")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#ff6a00")
                  }
                >
                  Thay đổi
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4">
              <label className="col-span-1 text-right text-sm text-slate-500 font-medium">
                Số điện thoại
              </label>
              <div className="col-span-2 md:col-span-3 flex items-center gap-2">
                <p className="text-sm text-slate-900">*********89</p>
                <button
                  className="text-sm font-semibold underline ml-2 transition-colors"
                  style={{ color: "#ff6a00" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#a14000")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#ff6a00")
                  }
                >
                  Thay đổi
                </button>
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4">
              <label className="col-span-1 text-right text-sm text-slate-500 font-medium">
                Giới tính
              </label>
              <div className="col-span-2 md:col-span-3 flex gap-6">
                {(["male", "female", "other"] as Gender[]).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="w-4 h-4 border-slate-300"
                      style={{ accentColor: "#ff6a00" }}
                    />
                    <span className="text-sm text-slate-900">
                      {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* DOB */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4">
              <label className="col-span-1 text-right text-sm text-slate-500 font-medium">
                Ngày sinh
              </label>
              <div className="col-span-2 md:col-span-3 flex gap-2">
                {/* Day */}
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="flex-1 p-3 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:border-[#ff6a00] bg-white"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                >
                  <option value="">Ngày</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {/* Month */}
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="flex-1 p-3 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:border-[#ff6a00] bg-white"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                >
                  <option value="">Tháng</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {/* Year */}
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="flex-1 p-3 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:border-[#ff6a00] bg-white"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                >
                  <option value="">Năm</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save button */}
            <div className="grid grid-cols-3 md:grid-cols-4 items-center gap-4 mt-2">
              <div className="col-span-1" />
              <div className="col-span-2 md:col-span-3">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 text-white text-sm font-bold rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#ff6a00" }}
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
