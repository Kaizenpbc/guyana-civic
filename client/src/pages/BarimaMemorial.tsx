import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Send, ImagePlus, X, Flame } from "lucide-react";

interface Tribute {
  id: string;
  name: string;
  relationship: string;
  message: string;
  photoUrl: string | null;
  createdAt: string;
}

function TributeCard({ tribute }: { tribute: Tribute }) {
  const date = new Date(tribute.createdAt);
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all hover:bg-white/10">
      {tribute.photoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={tribute.photoUrl}
            alt="Memorial photo"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <p className="text-white/90 leading-relaxed whitespace-pre-wrap mb-4">
        {tribute.message}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-amber-300 font-medium">{tribute.name}</span>
          {tribute.relationship && (
            <span className="text-white/50 ml-2">— {tribute.relationship}</span>
          )}
        </div>
        <span className="text-white/40">
          {date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

export default function BarimaMemorial() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: tributes = [], isLoading } = useQuery<Tribute[]>({
    queryKey: ["/api/memorial/tributes"],
    queryFn: async () => {
      const res = await fetch("/api/memorial/tributes");
      if (!res.ok) throw new Error("Failed to load tributes");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("relationship", relationship);
      formData.append("message", message);
      if (photo) formData.append("photo", photo);

      const res = await fetch("/api/memorial/tributes", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit tribute");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memorial/tributes"] });
      setName("");
      setRelationship("");
      setMessage("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowForm(false);
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo must be under 5MB");
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <Flame className="h-12 w-12 text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            In Loving Memory
          </h1>
          <p className="text-xl text-white/70 mb-2">
            Barima River Boat Tragedy
          </p>
          <p className="text-white/50 mb-8">
            Honouring the lives lost — Region 1, Barima-Waini
          </p>
          <div className="w-24 h-px bg-amber-400/50 mx-auto mb-8" />
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            This page is a space for the people of Guyana to share memories,
            stories, and tributes for those who perished. Your words help keep
            their memory alive.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Share tribute button / form */}
        <div className="mb-12">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-white/20
                         text-white/60 hover:text-white hover:border-amber-400/50
                         transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Heart className="h-5 w-5" />
              Share a Tribute
            </button>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-400" />
                  Share Your Tribute
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                                 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">
                      Relationship (optional)
                    </label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Family, Friend, Community Member"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                                 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Your Message <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a memory, a prayer, or words of comfort..."
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3
                               text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50
                               resize-none"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Photo (optional)
                  </label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-32 rounded-lg object-cover"
                      />
                      <button
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 text-white/40 hover:text-amber-400
                                      cursor-pointer transition-colors text-sm">
                      <ImagePlus className="h-5 w-5" />
                      <span>Add a photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={!message.trim() || submitMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed
                               text-black font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {submitMutation.isPending ? "Submitting..." : "Submit Tribute"}
                  </button>
                </div>

                {submitMutation.isError && (
                  <p className="text-red-400 text-sm">
                    Failed to submit. Please try again.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tribute count */}
        {tributes.length > 0 && (
          <p className="text-center text-white/40 text-sm mb-8">
            {tributes.length} tribute{tributes.length !== 1 ? "s" : ""} shared
          </p>
        )}

        {/* Tributes wall */}
        {isLoading ? (
          <div className="text-center text-white/40 py-12">
            Loading tributes...
          </div>
        ) : tributes.length === 0 ? (
          <div className="text-center py-16">
            <Flame className="h-10 w-10 text-amber-400/40 mx-auto mb-4" />
            <p className="text-white/40">
              Be the first to share a tribute.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tributes.map((tribute) => (
              <TributeCard key={tribute.id} tribute={tribute} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-white/30 text-sm">
        <p>Rest in peace. You will never be forgotten.</p>
      </footer>
    </div>
  );
}
