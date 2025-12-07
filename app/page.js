// app/page.js
"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

const CATEGORY_OPTIONS = ["Semua", "Makanan Berat", "Cemilan", "Minuman", "Lainnya"];

function pickRandomFood(list) {
  if (!list.length) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [currentFood, setCurrentFood] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredFoods = foods.filter((food) => {
    // jangan ikutkan yang nonaktif
    if (food.isActive === false) return false;

    // kalau "Semua" ya ambil semua yang aktif
    if (selectedCategory === "Semua") return true;

    // kalau kategori spesifik, cocokin string-nya
    return food.category === selectedCategory;
  });

  useEffect(() => {
    async function fetchFoods() {
      try {
        const res = await fetch("/api/foods");
        const data = await res.json();
        setFoods(data);
        if (data.length > 0) setCurrentFood(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  const handleGacha = () => {
    if (isRolling || filteredFoods.length === 0) return;

    setIsRolling(true);
    let count = 0;
    const maxCount = 15;

    const interval = setInterval(() => {
      const random = pickRandomFood(filteredFoods);
      if (random) setTempName(random.name);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);

        const finalFood = pickRandomFood(filteredFoods);
        setCurrentFood(finalFood);

        // 🎆🔥 Tambah confetti di sini:
        // confetti({
        //   particleCount: 120,
        //   spread: 80,
        //   origin: { y: 0.6 }
        // });
        const burst = () => {
          confetti({
            particleCount: 70,
            spread: 80,
            startVelocity: 40,
            origin: { y: 0.6 }
          });
        };

        burst();
        setTimeout(burst, 250);
        setTimeout(burst, 500);

        setIsRolling(false);
      }
    }, 80);
  };


  const displayName = (() => {
    if (loading) return "Lagi ngambil data...";
    if (!foods.length) return "Belum ada data makanan di database";
    if (!filteredFoods.length) return "Tidak ada makanan untuk kategori ini";
    if (isRolling) return tempName || currentFood?.name || "...";
    return currentFood?.name || "Belum ada pilihan";
  })();


  return (
    <main className="min-h-screen bg-[#3642DE] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-orbit bg-orbit--1" />
        <div className="bg-orbit bg-orbit--2" />
        <div className="bg-orbit bg-orbit--3" />
      </div>

      <div className="w-full max-w-md text-center">
        <h1 className="text-white text-3xl font-bold mb-2">Gacha Makan 🍽️</h1>
        {/* <p className="text-white/80 text-xs mb-6">
          Data makanan bisa diatur di halaman /food
        </p> */}

        <div className="bg-white/90 rounded-2xl shadow-xl p-6 mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Hari ini makan apa ya?
          </p>

          <div className="border rounded-xl px-4 py-6 mb-3 min-h-[80px] flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-900">
              {displayName}
            </span>
          </div>

          {currentFood?.category && (
            <p className="text-xs text-gray-500 mb-1">
              Kategori:{" "}
              <span className="font-medium">{currentFood.category}</span>
            </p>
          )}

          {currentFood?.tags && currentFood.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {currentFood.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar justify-center">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActiveCat = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={
                  "px-3 py-1 rounded-full text-xs border whitespace-nowrap transition " +
                  (isActiveCat
                    ? "bg-white text-[#3642DE] border-white shadow-sm"
                    : "bg-white/10 text-white/80 border-white/30")
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleGacha}
          className="w-full py-4 rounded-2xl bg-white text-[#3642DE] font-bold text-lg disabled:opacity-60 active:scale-95 transition"
          disabled={isRolling || loading || currentFood.length === 0}
        >
          {loading
            ? "Loading..."
            : isRolling
            ? "LAGI MIKIRIN MAKANAN..."
            : "GACHA MAKAN!"}
        </button>

        <a
          href="/food"
          className="block mt-4 text-white/80 text-xs underline"
        >
          Kelola daftar makanan
        </a>
      </div>
    </main>
  );
}
