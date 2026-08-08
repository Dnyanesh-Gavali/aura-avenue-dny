import React, { useState } from "react";

/**
 * Manage Packages Component
 * 
 * Description:
 * Admin dashboard view for managing travel packages. Allows administrators to search, 
 * view, add, edit, and securely delete travel packages via interactive modals.
 * 
 * @param {Object} props
 * @param {Array} props.packages - List of current travel packages.
 * @param {Function} props.onRefresh - Callback to refresh/reload package data.
 * @param {Function} props.triggerSuccess - Callback to display success toast/notification.
 * @param {Function} props.triggerError - Callback to display error toast/notification.
 */
export default function ManagePackages({ packages = [], onRefresh, triggerSuccess, triggerError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Delete Modal State
  const [deletePackageId, setDeletePackageId] = useState(null);

  // Initial Form State
  const initialFormState = {
    title: "",
    badge: "",
    category: "International",
    continent: "",
    country: "",
    duration: "",
    location: "",
    price: "",
    originalPrice: "",
    rating: 4.5,
    type: "",
    image: "",
    about: "",
    features: "",   
    itinerary: "",  
  };

  const [formData, setFormData] = useState(initialFormState);

  // Open Modal For Add New Package
  const handleOpenAddModal = () => {
    setEditingPackageId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Modal For Editing Existing Package
  const handleOpenEditModal = (pkg) => {
    setEditingPackageId(pkg._id);
    setFormData({
      title: pkg.title || "",
      badge: pkg.badge || "",
      category: pkg.category || "International",
      continent: pkg.continent || "",
      country: pkg.country || "",
      duration: pkg.duration || "",
      location: pkg.location || "",
      price: pkg.price || "",
      originalPrice: pkg.originalPrice || "",
      rating: pkg.rating || 4.5,
      type: pkg.type || "",
      image: pkg.image || "",
      about: pkg.about || "",
      features: Array.isArray(pkg.features) ? pkg.features.join(", ") : "",
      itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary.join("\n") : "",
    });
    setIsModalOpen(true);
  };

  // Handle Generic Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = Boolean(editingPackageId);
    const url = isEditing
      ? `${import.meta.env.VITE_SERVER_URL}/admin/update-package/${editingPackageId}`
      : `${import.meta.env.VITE_SERVER_URL}/admin/add-package`;

    const method = isEditing ? "PATCH" : "POST";

    const payload = {
      ...formData,
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      itinerary: formData.itinerary.split("\n").map((i) => i.trim()).filter(Boolean),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        triggerSuccess(data.message);
        setIsModalOpen(false);
        onRefresh();
      } else {
        triggerError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      triggerError("Server error. Please try again.");
    }
  };

  // Trigger Custom Delete Confirmation Modal
  const confirmDelete = (id) => {
    setDeletePackageId(id);
  };

  // Actual Delete Handler (Triggered after confirmation)
  const handleConfirmDelete = async () => {
    if (!deletePackageId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/delete-package/${deletePackageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        triggerSuccess(data.message);
        onRefresh();
      } else {
        triggerError(data.message || "Failed to delete package.");
      }
    } catch (err) {
      console.error(err);
      triggerError("Server error while deleting package.");
    } finally {
      setDeletePackageId(null);
    }
  };

  // Search Filter Logic
  const filteredPackages = packages.filter((pkg) => {
    const query = searchQuery.toLowerCase();
    return (
      pkg.title?.toLowerCase().includes(query) ||
      pkg.location?.toLowerCase().includes(query) ||
      pkg.category?.toLowerCase().includes(query) ||
      pkg.country?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 antialiased pb-10">
      {/* Top Header & Search Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Manage Travel Packages</h1>
          <p className="text-xs text-slate-500 mt-0.5">Total Available: <span className="font-semibold text-slate-700">{filteredPackages.length}</span></p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Input Bar */}
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 text-xs sm:text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search title, location, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 text-xs sm:text-sm transition shrink-0 active:scale-[0.98]"
          >
            <span className="text-base font-bold leading-none">+</span> Add Package
          </button>
        </div>
      </div>

      {/* Package Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPackages.map((pkg) => (
          <div key={pkg._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 overflow-hidden flex flex-col justify-between transition group">
            
            {/* Package Image & Badge */}
            <div className="relative h-36 sm:h-32 bg-slate-100 overflow-hidden">
              <img 
                src={pkg.image} 
                alt={pkg.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              {pkg.badge && (
                <span className="absolute top-2.5 left-2.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                  {pkg.badge}
                </span>
              )}
            </div>

            {/* Package Details */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 tracking-tight" title={pkg.title}>{pkg.title}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium shrink-0">{pkg.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{pkg.location}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{pkg.duration}</p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-600">₹{pkg.price?.toLocaleString()}</span>
                  {pkg.originalPrice && (
                    <span className="text-[11px] text-slate-400 line-through">₹{pkg.originalPrice?.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(pkg)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-xl text-xs flex justify-center items-center gap-1.5 transition active:scale-[0.98]"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => confirmDelete(pkg._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-xs transition active:scale-[0.98]"
                  title="Delete Package"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-lg border border-slate-100">
            📭
          </div>
          <p className="text-sm font-semibold text-slate-700">No travel packages found</p>
          <p className="text-xs text-slate-400 mt-1">No results matching "{searchQuery}"</p>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deletePackageId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-red-100 shadow-inner">
              🗑️
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">Are you sure?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Do you really want to delete this travel package? This process cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletePackageId(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-500/20 transition active:scale-[0.98]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup for Add / Edit Package Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>

            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 tracking-tight">
              {editingPackageId ? "Edit Travel Package" : "Add New Travel Package"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. Bora Bora Discovery" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Badge</label>
                  <input name="badge" value={formData.badge} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. Luxury / Trending" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition">
                    <option value="International">International</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Honeymoon">Honeymoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Continent</label>
                  <input name="continent" value={formData.continent} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. Australia / Asia" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Country</label>
                  <input name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. French Polynesia" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Location</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. Bora Bora, French Polynesia" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Duration</label>
                  <input name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. 5 Days / 4 Nights" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Type</label>
                  <input name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="e.g. Nature / Adventure" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Price (₹)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="150000" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Original Price (₹)</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="180000" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Image URL</label>
                <input required name="image" value={formData.image} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">About Package</label>
                <textarea name="about" value={formData.about} onChange={handleChange} rows={2} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none" placeholder="Describe the trip..." />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Features (Comma-separated)</label>
                <input name="features" value={formData.features} onChange={handleChange} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder="5-Star Stay, Free Snorkeling, Daily Breakfast" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Itinerary (Each day on a NEW line)</label>
                <textarea name="itinerary" value={formData.itinerary} onChange={handleChange} rows={3} className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" placeholder={"Day 1: Arrive\nDay 2: Boat Tour\nDay 3: Departure"} />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-[0.98]">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-[0.98]">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}