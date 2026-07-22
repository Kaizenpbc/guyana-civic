import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Send, ImagePlus, X, Flame, Clock, MapPin, Users, Feather } from "lucide-react";

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
    <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
      {tribute.photoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={tribute.photoUrl}
            alt="Memorial photo"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 italic">
        "{tribute.message}"
      </p>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-emerald-700 font-medium">{tribute.name}</span>
          {tribute.relationship && (
            <span className="text-gray-400 ml-2">— {tribute.relationship}</span>
          )}
        </div>
        <span className="text-gray-400">
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

const timelineEvents = [
  {
    date: "Date of Tragedy",
    title: "The Day the River Fell Silent",
    description:
      "A boat carrying passengers along the Barima River in Region 1 capsized, claiming precious lives and leaving a community in shock.",
  },
  {
    date: "Days Following",
    title: "Search and Recovery",
    description:
      "Communities along the river came together as search and recovery efforts were carried out with courage and determination.",
  },
  {
    date: "Week of Mourning",
    title: "A Nation Grieves Together",
    description:
      "Vigils were held across Guyana. Candles were lit in homes, churches, and community centres. The nation stood united in sorrow.",
  },
  {
    date: "Ongoing",
    title: "Remembering Always",
    description:
      "This memorial stands as a lasting tribute — so that every name is spoken, every story is told, and no one is forgotten.",
  },
];

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30">

      {/* ===== HERO SECTION ===== */}
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700">
        <div className="absolute inset-0 bg-black/20" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Flame className="h-16 w-16 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-yellow-400/20 rounded-full" />
            </div>
          </div>
          <p className="text-emerald-300 text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            A Memorial for Guyana
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
            In Loving Memory
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-3 font-light">
            Barima River Boat Tragedy
          </p>
          <p className="text-emerald-200/60 mb-10 flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            Region 1, Barima-Waini, Guyana
          </p>
          <div className="w-20 h-px bg-yellow-400/40 mx-auto mb-10" />
          <p className="text-emerald-100/70 max-w-2xl mx-auto leading-relaxed text-lg font-light">
            They were mothers, fathers, children, neighbours, and friends.
            They were loved. They are remembered. They will never be forgotten.
          </p>
        </div>
      </header>

      {/* ===== GENTLE RETELLING ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Feather className="h-8 w-8 text-emerald-300 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8">
            What Happened on the Barima
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg font-light">
            <p>
              On a quiet stretch of the Barima River in Region 1, a boat carrying
              passengers — families, workers, children — set out on what should have
              been an ordinary journey through the waterways that connect the communities
              of Barima-Waini.
            </p>
            <p>
              The river, which has long been a lifeline for the people of the region,
              became the site of an unimaginable tragedy when the vessel capsized,
              plunging its passengers into the water.
            </p>
            <p>
              Lives were lost. Families were shattered. A community that had always
              depended on the river was left to grieve beside it.
            </p>
          </div>
        </div>
      </section>

      {/* TODO: "A Nation in Mourning" section - add back when real content is available */}

      {/* ===== TIMELINE OF REMEMBRANCE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Clock className="h-8 w-8 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
              Timeline of Remembrance
            </h2>
            <p className="text-gray-500 font-light">
              Moments that marked a nation's grief and resilience
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-emerald-200 transform md:-translate-x-px" />

            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-start mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-emerald-500 rounded-full transform -translate-x-1.5 md:-translate-x-1.5 mt-2 ring-4 ring-emerald-50 z-10" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${
                  index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                }`}>
                  <span className="text-sm text-emerald-600 font-medium">{event.date}</span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1 mb-2">{event.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRIBUTE SECTION ===== */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50/50" id="tributes">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Heart className="h-8 w-8 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
              Tributes from the Heart
            </h2>
            <p className="text-gray-500 font-light max-w-xl mx-auto">
              A space for the people of Guyana to share memories, prayers,
              and words of comfort. Every tribute is a thread in the fabric
              of remembrance.
            </p>
          </div>

          {/* Share tribute button / form */}
          <div className="mb-12">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-5 rounded-xl border-2 border-dashed border-emerald-200
                           text-emerald-600 hover:text-emerald-700 hover:border-emerald-400
                           hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-3 text-lg"
              >
                <Heart className="h-5 w-5" />
                Light a Candle — Share Your Tribute
              </button>
            ) : (
              <div className="bg-white border border-emerald-100 rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-yellow-500" />
                    Share Your Tribute
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-500 text-sm mb-6 font-light">
                  Your words matter. Share a memory, a prayer, or simply let them know
                  they are not forgotten.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Your Name (optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Anonymous"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5
                                   text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Relationship (optional)
                      </label>
                      <input
                        type="text"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        placeholder="e.g. Family, Friend, Community Member"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5
                                   text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Your Message <span className="text-emerald-600">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share a memory, a prayer, or words of comfort..."
                      rows={5}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3
                                 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400
                                 resize-none"
                    />
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
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
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 text-gray-400 hover:text-emerald-600
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
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed
                                 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
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
            <p className="text-center text-gray-400 text-sm mb-8">
              {tributes.length} tribute{tributes.length !== 1 ? "s" : ""} shared by the people of Guyana
            </p>
          )}

          {/* Tributes wall */}
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading tributes...
            </div>
          ) : tributes.length === 0 ? (
            <div className="text-center py-16">
              <Flame className="h-10 w-10 text-emerald-300 mx-auto mb-4" />
              <p className="text-gray-400 font-light">
                Be the first to light a candle and share a tribute.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tributes.map((tribute) => (
                <TributeCard key={tribute.id} tribute={tribute} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CLOSING MESSAGE ===== */}
      <section className="py-24 px-4 bg-emerald-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Flame className="h-12 w-12 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-yellow-400/20 rounded-full" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Until We Meet Again
          </h2>
          <p className="text-emerald-100/70 leading-relaxed text-lg font-light mb-8">
            The waters of the Barima still flow, carrying with them the memory
            of those we have lost. Though they are no longer with us in body,
            they remain with us in spirit — in every story we tell, in every
            prayer we whisper, in every candle we light.
          </p>
          <p className="text-emerald-100/50 font-light mb-10">
            May they rest in eternal peace. May their families find comfort.
            May Guyana never forget.
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400/60 text-sm">
            <Flame className="h-4 w-4" />
            <span>This flame burns in their honour</span>
            <Flame className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-emerald-950 py-8 text-center text-emerald-400/40 text-sm">
        <p className="mb-2">
          A tribute by the people of Guyana, for the people of Guyana.
        </p>
        <p className="text-emerald-400/25">
          barima.reimagine-guyana.com
        </p>
      </footer>
    </div>
  );
}
