import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaMapMarkerAlt, FaClock, FaBed, FaUtensils, FaCamera, FaSave, FaFilePdf } from "react-icons/fa";

export default function ItineraryBuilder() {
  const [tripName, setTripName] = useState("Plan Your Vacation");
  const [days, setDays] = useState([
    {
      id: 1,
      title: "Arrival & City Tour",
      activities: [
        { id: 101, time: "10:00 AM", title: "Check-in at Hotel", type: "stay" },
        { id: 102, time: "01:00 PM", title: "Lunch at Local Cafe", type: "food" },
        { id: 103, time: "03:00 PM", title: "Explore Old Town", type: "explore" }
      ]
    }
  ]);

  // --- CRUD Operations ---
  const addDay = () => {
    const newDay = { id: Date.now(), title: `Day ${days.length + 1} Plan`, activities: [] };
    setDays([...days, newDay]);
  };
  const deleteDay = (dayId) => setDays(days.filter(day => day.id !== dayId));
  const updateDayTitle = (dayId, newTitle) => setDays(days.map(day => day.id === dayId ? { ...day, title: newTitle } : day));

  const addActivity = (dayId) => {
    const newActivity = { id: Date.now(), time: "12:00 PM", title: "New Activity", type: "explore" };
    setDays(days.map(day => day.id === dayId ? { ...day, activities: [...day.activities, newActivity] } : day));
  };
  const deleteActivity = (dayId, activityId) => {
    setDays(days.map(day => day.id === dayId ? { ...day, activities: day.activities.filter(act => act.id !== activityId) } : day));
  };
  const updateActivity = (dayId, activityId, field, value) => {
    setDays(days.map(day => day.id === dayId ? {
      ...day, activities: day.activities.map(act => act.id === activityId ? { ...act, [field]: value } : act)
    } : day
    ));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'stay': return <FaBed className="text-blue-500" />;
      case 'food': return <FaUtensils className="text-orange-500" />;
      case 'explore': return <FaCamera className="text-emerald-500" />;
      default: return <FaMapMarkerAlt className="text-gray-500" />;
    }
  };

  // --- Actions ---
  const handleSave = async () => {
    const newItinerary = {
      id: Date.now(),
      tripName: tripName,
      daysCount: days.length,
      activitiesCount: days.reduce((total, day) => total + day.activities.length, 0),
      dateSaved: new Date().toISOString(),
      days: days // Saves the full layout
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/save-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Vital: Tells backend WHO is saving it via cookie
        body: JSON.stringify({ itinerary: newItinerary })
      });
      const data = await res.json();
      if (data.success) {
        alert("Itinerary permanently saved to your profile!");
      } else {
        alert(data.message); // Prompts to log in if they aren't
      }
    } catch (err) {
      console.error(err);
      alert("Server error while saving.");
    }
  };
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] print:bg-white text-[#14201A] pb-20 print:pb-0">

      {/* 🌟 HERO SECTION 🌟 */}
      <section
        className="relative pt-24 pb-20 px-6 lg:px-10 print:pt-4 print:bg-white bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')` }}
      >
        {/* Replaced green tint with a clean, neutral dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 print:hidden"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">

          {/* Title Area with darker glassmorphism for better contrast */}
          <div className="flex-1 bg-black/20 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-[2rem] shadow-xl print:shadow-none print:bg-transparent print:border-none print:p-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3DD68C] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0F1D16] mb-4 print:hidden shadow-sm">
              Custom Itinerary Builder
            </span>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="block w-full bg-transparent font-serif text-4xl sm:text-5xl lg:text-6xl text-white outline-none border-b-2 border-transparent focus:border-[#3DD68C] transition-colors pb-2 print:text-[#14201A] print:border-none print:p-0 drop-shadow-md"
              placeholder="Name your trip..."
            />
            <p className="mt-4 text-white/90 text-lg max-w-2xl font-medium drop-shadow-sm print:hidden">
              Design your perfect journey day by day. Add destinations, customize times, and build an adventure that stays with you.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 print:hidden">
            <button
              onClick={handleDownloadPDF}
              className="rounded-full bg-black/30 backdrop-blur-md border border-white/30 shadow-lg px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-black/50 hover:-translate-y-1 flex items-center gap-2"
            >
              <FaFilePdf className="text-lg" /> Export PDF
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-[#3DD68C] shadow-[0_10px_25px_-5px_rgba(61,214,140,0.4)] px-8 py-4 text-sm font-extrabold text-[#0F1D16] transition-all duration-300 hover:shadow-[0_15px_30px_-5px_rgba(61,214,140,0.6)] hover:-translate-y-1 flex items-center gap-2"
            >
              <FaSave className="text-lg" /> Save Trip
            </button>
          </div>
        </div>
      </section>

      {/* Main Builder Area */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 print:block print:mt-6">

        {/* Left Column: Day-by-Day Timeline */}
        <div className="lg:col-span-2 space-y-8 print:space-y-6">
          {days.map((day, index) => (
            <div key={day.id} className="bg-white rounded-[2rem] border border-[#E5E7E0] shadow-sm p-6 sm:p-8 print:shadow-none print:rounded-none print:border-gray-300 print:break-inside-avoid">

              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E7E0]">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-[#167A44] text-white font-bold text-lg h-12 w-12 rounded-xl flex items-center justify-center shrink-0 print:border print:border-[#167A44] print:text-[#167A44] print:bg-white">
                    D{index + 1}
                  </div>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDayTitle(day.id, e.target.value)}
                    className="text-2xl font-extrabold text-[#14201A] outline-none border-b border-transparent focus:border-[#3DD68C] w-full print:border-none"
                    placeholder="E.g., Arrival in Paris"
                  />
                </div>
                <button
                  onClick={() => deleteDay(day.id)}
                  className="text-red-400 hover:text-red-600 p-2 transition-colors self-end sm:self-auto print:hidden"
                  title="Delete Day"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Activities List */}
              <div className="space-y-4 pl-2 sm:pl-6 border-l-[3px] border-[#E5E7E0] ml-4 sm:ml-6 print:border-gray-300">
                {day.activities.map((activity) => (
                  <div key={activity.id} className="relative bg-[#F5F4EF] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center group border border-transparent hover:border-[#3DD68C]/30 transition-all print:bg-white print:border-none print:p-2">

                    {/* Timeline Dot */}
                    <div className="absolute -left-[27px] sm:-left-[43.5px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-[#167A44] rounded-full print:border-gray-400"></div>

                    {/* Activity Time & Type */}
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 print:w-auto">
                      <select
                        value={activity.type}
                        onChange={(e) => updateActivity(day.id, activity.id, 'type', e.target.value)}
                        className="bg-white border border-[#E5E7E0] text-[#6B7167] rounded-lg p-2 outline-none text-sm font-medium print:shadow-none print:appearance-auto"
                      >
                        <option value="explore">Explore</option>
                        <option value="food">Dining</option>
                        <option value="stay">Stay</option>
                      </select>
                      <div className="flex items-center gap-2 bg-white border border-[#E5E7E0] rounded-lg px-3 py-2 print:border-none">
                        <FaClock className="text-[#6B7167] text-sm print:hidden" />
                        <input
                          type="text"
                          value={activity.time}
                          onChange={(e) => updateActivity(day.id, activity.id, 'time', e.target.value)}
                          className="w-20 outline-none text-sm font-semibold text-[#14201A] print:font-bold"
                        />
                      </div>
                    </div>

                    {/* Activity Title */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-full shadow-sm border border-[#E5E7E0] print:hidden">
                        {getActivityIcon(activity.type)}
                      </div>
                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) => updateActivity(day.id, activity.id, 'title', e.target.value)}
                        className="w-full bg-transparent font-bold text-[#14201A] outline-none border-b border-transparent focus:border-[#3DD68C] print:border-none"
                        placeholder="What are you doing?"
                      />
                    </div>

                    {/* Delete Activity */}
                    <button
                      onClick={() => deleteActivity(day.id, activity.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity absolute right-4 top-4 sm:relative sm:top-0 sm:right-0 print:hidden"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                {/* Add Activity Button */}
                <button
                  onClick={() => addActivity(day.id)}
                  className="mt-6 flex items-center gap-2 text-[#167A44] font-semibold hover:text-[#125E36] transition-colors print:hidden"
                >
                  <div className="bg-[#1EA35B]/10 p-2 rounded-full">
                    <FaPlus className="text-sm" />
                  </div>
                  Add an activity
                </button>
              </div>
            </div>
          ))}

          {/* Add Day Button */}
          <button
            onClick={addDay}
            className="w-full py-6 rounded-[2rem] text-[#167A44] font-bold text-lg flex items-center justify-center gap-3 bg-[#F5F4EF] shadow-[6px_6px_12px_#dcdbd6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#dcdbd6,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 print:hidden"
          >
            <FaPlus /> Add Another Day
          </button>
        </div>

        {/* Right Column: Tools & Inspiration */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="bg-white rounded-[2rem] border border-[#E5E7E0] p-6 sm:p-8 shadow-sm sticky top-6">
            <h3 className="text-xl font-extrabold text-[#14201A] mb-4">Itinerary Summary</h3>
            <div className="space-y-3 mb-8 bg-[#F5F4EF] p-5 rounded-2xl border border-[#E5E7E0]">
              <div className="flex justify-between text-[#6B7167]">
                <span className="font-medium">Total Days</span>
                <span className="font-bold text-[#14201A]">{days.length}</span>
              </div>
              <div className="flex justify-between text-[#6B7167]">
                <span className="font-medium">Total Activities</span>
                <span className="font-bold text-[#14201A]">{days.reduce((total, day) => total + day.activities.length, 0)}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#14201A] mb-3">Need Inspiration?</h3>
            <p className="text-sm text-[#6B7167] mb-6">
              Browse our curated destinations and instantly add them to your custom itinerary.
            </p>
            <Link
              to="/destinations"
              className="block w-full text-center rounded-full bg-[#167A44] px-6 py-3.5 font-semibold text-white transition hover:bg-[#125E36] hover:shadow-md"
            >
              Browse Destinations
            </Link>

            <div className="mt-5 pt-5 border-t border-[#E5E7E0]">
              <p className="text-sm text-[#6B7167] mb-4 text-center">Or start with a pre-planned route:</p>
              <Link
                to="/packages"
                className="block w-full text-center rounded-full border border-[#E5E7E0] bg-white px-6 py-3.5 font-semibold text-[#167A44] transition hover:bg-[#F5F4EF] hover:border-[#167A44]"
              >
                View Curated Packages
              </Link>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}