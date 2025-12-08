// app/food/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
const CATEGORY_OPTIONS = ["Makanan Berat", "Cemilan", "Minuman", "Lainnya"];
const FILTER_OPTIONS = ["Semua", ...CATEGORY_OPTIONS];

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [weight, setWeight] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Semua");

  const sortedFoods = [...foods].sort((a, b) => {
    const nameA = a.name?.toLowerCase() ?? "";
    const nameB = b.name?.toLowerCase() ?? "";
    return nameA.localeCompare(nameB);
  });

  // filter berdasarkan kategori yang dipilih di UI
  const visibleFoods =
    filterCategory === "Semua"
      ? sortedFoods
      : sortedFoods.filter((food) => food.category === filterCategory);

  const resetForm = () => {
    setName("");
    setCategory("");
    setTagsInput("");
    setWeight(1);
    setIsActive(true);
    setEditingId(null);
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/foods");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);

    const tags =
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [];

    const payload = {
      name,
      category,
      tags,
      weight: Number(weight) || 1,
      isActive
    };

    try {
      const url = editingId ? `/api/foods/${editingId}` : "/api/foods";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error("Failed submit");
        toast.error("Oops, Gagal Menambahkan Makanan!");
      } else {
        await fetchFoods();
        toast.success("Data Makanan Berhasil Disimpan!");
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (food) => {
    setEditingId(food._id);
    setName(food.name || "");
    setCategory(food.category || "");
    setTagsInput((food.tags || []).join(", "));
    setWeight(food.weight || 1);
    setIsActive(food.isActive ?? true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus?")) return;

    try {
      const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Oops, Gagal Menghapus Data");
        console.error("Failed delete");
      } else {
        toast.success("Data Makanan Berhasil Dihapus 👍");
        fetchFoods();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Kelola Makanan</h1>
          <Link href="/" className="text-sm text-blue-600 underline">
            &larr; Kembali
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="font-semibold mb-3">
            {editingId ? "Edit Makanan" : "Tambah Makanan"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Nama*</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nasi Padang"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Kategori</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Pilih kategori</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">
                Tags (pisah dengan koma)
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="pedas, murah, enak, menggugah selera, penuh micin"
              />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-sm mb-1">Bobot</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 mt-5">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-60"
              >
                {submitting
                  ? "Menyimpan..."
                  : editingId
                  ? "Update"
                  : "Tambah"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg text-sm border"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="font-semibold">Daftar Makanan</h2>
            <select
              className="border rounded-lg px-2 py-1 text-xs bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {FILTER_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Semua" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : foods.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data.</p>
          ) : (
            <ul className="space-y-3">
              {visibleFoods.map((food) => (
                <li
                  key={food._id}
                  className="border rounded-lg px-3 py-2 flex justify-between items-start gap-3"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {food.name}{" "}
                      {!food.isActive && (
                        <span className="text-xs text-red-500">(nonaktif)</span>
                      )}
                    </p>
                    {food.category && (
                      <p className="text-xs text-gray-500">
                        Kategori: {food.category}
                      </p>
                    )}
                    {food.tags && food.tags.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Tags: {food.tags.join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">Weight: {food.weight}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(food)}
                      className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
