import { useState, useEffect } from "react";
import axios from "axios";
import "./BannerManager.css";

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
    Object.keys(form).forEach((key) => data.append(key, form[key]));
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
    <div className="banner-container">
      <h2 className="banner-heading">Banner Manager</h2>
      <button className="btn-add-banner" onClick={() => setShowModal(true)}>
        ➕ Add Banner
      </button>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add Banner</h3>
            <form onSubmit={handleSubmit} className="banner-form">
              <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="form-control" />
              <input type="text" name="subTitle" placeholder="Subtitle" value={form.subTitle} onChange={handleChange} required className="form-control" />
              <input type="text" name="link" placeholder="Link (optional)" value={form.link} onChange={handleChange} className="form-control" />
              <input type="datetime-local" name="startDateTime" value={form.startDateTime} onChange={handleChange} className="form-control" />
              <input type="datetime-local" name="endDateTime" value={form.endDateTime} onChange={handleChange} className="form-control" />
              <input type="file" accept="image/*" onChange={handleFileChange} required className="form-control" />
              {preview && <img src={preview} alt="Preview" className="image-preview" />}
              <div className="form-actions">
                <button type="submit" className="btn-submit">Submit</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="banner-table">
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
                  <button onClick={() => handleActivate(b.id)} className="btn-edit">Activate</button>
                  <button onClick={() => handleDelete(b.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerManager;
