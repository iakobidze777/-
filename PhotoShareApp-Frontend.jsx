import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  X,
  LogOut,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertCircle,
  Aperture,
  Play,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function frameNumber(n) {
  return String(n).padStart(3, "0");
}

function SprocketStrip({ className = "" }) {
  return (
    <div
      className={`h-2 w-full ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(245,158,11,0.55) 1.5px, transparent 1.6px)",
        backgroundSize: "14px 8px",
        backgroundPosition: "center",
      }}
      aria-hidden="true"
    />
  );
}

function LoginScreen({ onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      if (response.ok) {
        localStorage.setItem("authToken", value);
        onSuccess(value);
      } else {
        setError("არასწორი პაროლი — სცადეთ თავიდან.");
      }
    } catch (e) {
      setError("სერვერთან დაკავშირება ვერ მოხერხდა.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-full border border-stone-700 flex items-center justify-center mb-4 bg-stone-900">
            <Aperture className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif italic text-3xl text-stone-100 tracking-wide">
            ჩვენი კადრები
          </h1>
          <p className="text-stone-500 text-sm mt-2 tracking-wide">
            პირადი ფოტო-არქივი მეგობრებისთვის
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
            წვდომის კოდი
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="შეიყვანე პაროლი"
              autoFocus
              className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-10 pr-3 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-rose-400 text-sm mt-3">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={checking || !value}
            className="mt-5 w-full bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-lg py-2.5 transition flex items-center justify-center gap-2"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            შესვლა
          </button>
        </form>

        <p className="text-stone-600 text-xs text-center mt-6">
          ეს გვერდი განკუთვნილია მხოლოდ ჩვენი ჯგუფისთვის.
        </p>
      </div>
    </div>
  );
}

function TopBar({ count, onLogout }) {
  return (
    <header className="border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Aperture className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
          <h1 className="font-serif italic text-xl text-stone-100">ჩვენი კადრები</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline font-mono text-xs text-stone-500 tracking-widest">
            №{frameNumber(count)} კადრი
          </span>
          <button
            onClick={onLogout}
            aria-label="გასვლა"
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-100 text-sm transition"
          >
            <LogOut className="h-4 w-4" /> გასვლა
          </button>
        </div>
      </div>
      <SprocketStrip />
    </header>
  );
}

function Dropzone({ onFiles, uploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={`cursor-pointer rounded-2xl border-2 border-dashed transition-colors px-6 py-10 flex flex-col items-center justify-center text-center ${
        isDragging
          ? "border-amber-400 bg-amber-500/5"
          : "border-stone-700 hover:border-stone-600 bg-stone-900/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="h-11 w-11 rounded-full bg-stone-800 flex items-center justify-center mb-3">
        <Upload className="h-5 w-5 text-amber-400" />
      </div>
      <p className="text-stone-200 font-medium">გადმოაგდე ფოტოები აქ</p>
      <p className="text-stone-500 text-sm mt-1">
        ან დააწკაპუნე ფაილების შესარჩევად · მონაცემები გაზიარდება ყველა მომხმარებელთან
      </p>

      {uploading.length > 0 && (
        <div className="mt-5 w-full max-w-xs space-y-1.5">
          {uploading.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 text-xs text-stone-400 bg-stone-900 border border-stone-800 rounded-md px-3 py-1.5"
            >
              <Loader2 className="h-3 w-3 animate-spin text-amber-400 flex-shrink-0" />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, index, onOpen, onDownload, onDelete }) {
  const isVideo = photo.type?.startsWith("video/");
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-stone-800 bg-stone-900">
      {isVideo ? (
        <video
          src={photo.url}
          muted
          playsInline
          preload="metadata"
          onClick={() => onOpen(index)}
          className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <img
          src={photo.url}
          alt={photo.name}
          loading="lazy"
          onClick={() => onOpen(index)}
          className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {isVideo && (
        <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-stone-950/80 flex items-center justify-center pointer-events-none">
          <Play className="h-3 w-3 text-amber-400 fill-amber-400" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-mono text-xs text-stone-300 flex-1 min-w-0 truncate pr-2">
          {frameNumber(index + 1)}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(photo);
            }}
            aria-label="ჩამოტვირთვა"
            className="h-7 w-7 rounded-full bg-stone-950/80 hover:bg-amber-500 hover:text-stone-950 text-stone-200 flex items-center justify-center transition"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo);
            }}
            aria-label="წაშლა"
            className="h-7 w-7 rounded-full bg-stone-950/80 hover:bg-rose-600 text-stone-200 flex items-center justify-center transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ photos, index, onClose, onPrev, onNext, onDownload, onDelete }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  const photo = photos[index];
  if (!photo) return null;
  const isVideo = photo.type?.startsWith("video/");

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <span className="font-mono text-xs text-stone-400 tracking-widest">
          {frameNumber(index + 1)} / {frameNumber(photos.length)}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onDownload(photo)}
            aria-label="ჩამოტვირთვა"
            className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 text-sm transition"
          >
            <Download className="h-4 w-4" /> ჩამოტვირთვა
          </button>
          <button
            onClick={() => onDelete(photo)}
            aria-label="წაშლა"
            className="flex items-center gap-1.5 text-stone-300 hover:text-rose-400 text-sm transition"
          >
            <Trash2 className="h-4 w-4" /> წაშლა
          </button>
          <button onClick={onClose} aria-label="დახურვა" className="text-stone-300 hover:text-stone-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button
            onClick={onPrev}
            aria-label="წინა"
            className="absolute left-2 sm:left-6 h-10 w-10 rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-200 flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {isVideo ? (
          <video
            src={photo.url}
            controls
            playsInline
            autoPlay
            style={{ maxHeight: "78vh" }}
            className="max-w-full rounded-md border border-stone-800"
          />
        ) : (
          <img
            src={photo.url}
            alt={photo.name}
            style={{ maxHeight: "78vh" }}
            className="max-w-full object-contain rounded-md border border-stone-800"
          />
        )}
        {photos.length > 1 && (
          <button
            onClick={onNext}
            aria-label="შემდეგი"
            className="absolute right-2 sm:right-6 h-10 w-10 rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-200 flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-stone-300 text-sm truncate">{photo.name}</p>
        <p className="font-mono text-xs text-stone-600 mt-0.5">{formatBytes(photo.size)}</p>
      </div>
    </div>
  );
}

export default function PhotoShareApp() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setPassword(token);
      setIsAuthed(true);
      loadGallery(token);
    }
  }, []);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(""), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const loadGallery = async (pwd) => {
    setLoadingGallery(true);
    try {
      const response = await fetch(`${API_BASE}/api/photos`, {
        headers: { "x-password": pwd },
      });
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        setBanner("გალერეის ჩატვირთვა ვერ მოხერხდა");
      }
    } catch (e) {
      setBanner("სერვერთან დაკავშირება ვერ მოხერხდა");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      if (files.length === 0) return;

      for (const file of files) {
        const id = genId();
        setUploading((prev) => [...prev, { id, name: file.name }]);
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`${API_BASE}/api/upload`, {
            method: "POST",
            headers: { "x-password": password },
            body: formData,
          });

          if (response.ok) {
            const photoObj = await response.json();
            setPhotos((prev) => [photoObj, ...prev]);
          } else {
            setBanner(`"${file.name}" ატვირთვა ვერ მოხერხდა`);
          }
        } catch (e) {
          setBanner(`"${file.name}" ატვირთვა ვერ მოხერხდა`);
        } finally {
          setUploading((prev) => prev.filter((f) => f.id !== id));
        }
      }
    },
    [password]
  );

  const handleDownload = (photo) => {
    const a = document.createElement("a");
    a.href = `${API_BASE}${photo.url}`;
    a.download = photo.name || `photo-${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (photo) => {
    try {
      const response = await fetch(`${API_BASE}/api/photos/${photo.id}`, {
        method: "DELETE",
        headers: { "x-password": password },
      });

      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setLightboxIndex((curr) => {
          if (curr === null) return null;
          const idx = photos.findIndex((p) => p.id === photo.id);
          if (idx === -1 || idx === curr) return null;
          if (idx < curr) return curr - 1;
          return curr;
        });
      }
    } catch (e) {
      setBanner("ფოტოს წაშლა ვერ მოხერხდა");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
      `}</style>

      {!isAuthed ? (
        <LoginScreen onSuccess={(pwd) => {
          setPassword(pwd);
          setIsAuthed(true);
          loadGallery(pwd);
        }} />
      ) : (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
          <TopBar count={photos.length} onLogout={() => {
            setIsAuthed(false);
            localStorage.removeItem("authToken");
          }} />

          <main className="max-w-6xl mx-auto px-5 py-8">
            {banner && (
              <div className="mb-5 flex items-center gap-2 bg-rose-950/50 border border-rose-900 text-rose-300 text-sm rounded-lg px-4 py-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {banner}
              </div>
            )}

            <Dropzone onFiles={handleFiles} uploading={uploading} />

            <div className="mt-8">
              {loadingGallery ? (
                <div className="flex items-center justify-center py-16 text-stone-500 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> გალერეის ჩატვირთვა...
                </div>
              ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-8 w-8 text-stone-700 mb-3" />
                  <p className="text-stone-400">ჯერ არცერთი ფოტო ან ვიდეო არ არის ატვირთული</p>
                  <p className="text-stone-600 text-sm mt-1">ატვირთე პირველი კადრი ზემოთ</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {photos.map((photo, i) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      index={i}
                      onOpen={setLightboxIndex}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>

          {lightboxIndex !== null && (
            <Lightbox
              photos={photos}
              index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onPrev={() => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length)}
              onNext={() => setLightboxIndex((i) => (i + 1) % photos.length)}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </>
  );
}
