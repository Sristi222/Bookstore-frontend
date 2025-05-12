import { useState, useEffect } from "react";
import axios from "axios";

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    link: "",
    startDateTime: "",
    endDateTime: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const fetchBanners = async () => {
    try {
      const res = await axios.get("https://localhost:7085/api/Banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("Title", form.title);
    data.append("SubTitle", form.subTitle);
    data.append("Link", form.link);
    data.append("StartDateTime", form.startDateTime);
    data.append("EndDateTime", form.endDateTime);
    if (imageFile) data.append("Image", imageFile);

    try {
      await axios.post("https://localhost:7085/api/Banners", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Banner added!");
      setForm({ title: "", subTitle: "", link: "", startDateTime: "", endDateTime: "" });
      setImageFile(null);
      setPreview("");
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      console.error("❌ Failed to add banner:", err);
      alert("❌ Failed to add banner.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await axios.delete(`https://localhost:7085/api/Banners/${id}`);
      alert("Deleted!");
      fetchBanners();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.put(`https://localhost:7085/api/Banners/${id}/activate`);
      alert(`Banner ${id} activated!`);
      fetchBanners();
    } catch (err) {
      console.error("Activate error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Banner Manager</h2>
      <button onClick={() => setShowModal(true)} style={{ marginBottom: "10px" }}>
        ➕ Add Banner
      </button>

      {/* 🟢 Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: "20px", width: "400px", borderRadius: "8px" }}>
            <h3>Add Banner</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ width: "100%" }} /><br /><br />
              <input type="text" name="subTitle" placeholder="SubTitle" value={form.subTitle} onChange={handleChange} required style={{ width: "100%" }} /><br /><br />
              <input type="text" name="link" placeholder="Link (optional)" value={form.link} onChange={handleChange} style={{ width: "100%" }} /><br /><br />
              <input type="datetime-local" name="startDateTime" value={form.startDateTime} onChange={handleChange} style={{ width: "100%" }} /><br /><br />
              <input type="datetime-local" name="endDateTime" value={form.endDateTime} onChange={handleChange} style={{ width: "100%" }} /><br /><br />
              <input type="file" accept="image/*" onChange={handleFileChange} required /><br /><br />
              {preview && <img src={preview} alt="preview" style={{ maxWidth: "100%" }} />}
              <br />
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowModal(false)} style={{ marginLeft: "10px" }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Table */}
      <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Subtitle</th><th>Active</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.title}</td>
              <td>{b.subTitle}</td>
              <td>{b.isActive ? "✅" : ""}</td>
              <td>
                <button onClick={() => handleActivate(b.id)}>Activate</button>
                <button onClick={() => handleDelete(b.id)} style={{ marginLeft: "5px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannerManager;
