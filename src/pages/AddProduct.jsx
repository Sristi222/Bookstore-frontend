import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    author: "",
    genre: "",
    publisher: "",
    isbn: "",
    description: "",
    language: "",
    format: "",
    publicationDate: "",
    price: "",
    discountPercent: "",
    discountStartDate: "",
    discountEndDate: "",
    onSale: false,
    stockQuantity: "",
    isAvailableInStore: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setMessage("❌ Please upload a product image.");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      const value = form[key];
      if (value !== "") {
        formData.append(key, typeof value === "boolean" ? value.toString() : value);
      }
    }
    formData.append("image", imageFile);

    try {
      await axios.post("https://localhost:7085/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Product added successfully!");
      setForm({
        name: "",
        author: "",
        genre: "",
        publisher: "",
        isbn: "",
        description: "",
        language: "",
        format: "",
        publicationDate: "",
        price: "",
        discountPercent: "",
        discountStartDate: "",
        discountEndDate: "",
        onSale: false,
        stockQuantity: "",
        isAvailableInStore: false,
      });
      setImageFile(null);
      setPreview("");
    } catch (err) {
      console.error("FULL BACKEND ERROR:", err.response?.data);
      setMessage(`❌ Failed to add product: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="add-product-container">
      <button className="btn-toggle-form" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Form" : "➕ Add Product"}
      </button>

      {showForm && (
        <div className="add-product-card">
          <div className="add-product-header">
            <h3>Add New Book</h3>
            <p>Fill out the form to add a book to your store</p>
          </div>

          <form onSubmit={handleSubmit} className="add-product-form" encType="multipart/form-data">
            {message && <p>{message}</p>}
            {[
              { label: "Name", name: "name", type: "text", required: true },
              { label: "Author", name: "author", type: "text" },
              { label: "Genre", name: "genre", type: "text" },
              { label: "Publisher", name: "publisher", type: "text" },
              { label: "ISBN", name: "isbn", type: "text" },
              { label: "Description", name: "description", type: "textarea" },
              { label: "Language", name: "language", type: "text" },
              { label: "Format", name: "format", type: "text" },
              { label: "Publication Date", name: "publicationDate", type: "date" },
              { label: "Price", name: "price", type: "number", required: true },
              { label: "Discount %", name: "discountPercent", type: "number" },
              { label: "Discount Start", name: "discountStartDate", type: "date" },
              { label: "Discount End", name: "discountEndDate", type: "date" },
              { label: "Stock Quantity", name: "stockQuantity", type: "number" },
            ].map((input) => (
              <div className="form-group" key={input.name}>
                <label>{input.label}</label>
                {input.type === "textarea" ? (
                  <textarea
                    className="form-control"
                    name={input.name}
                    value={form[input.name]}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    className="form-control"
                    type={input.type}
                    name={input.name}
                    value={form[input.name]}
                    onChange={handleChange}
                    required={input.required || false}
                  />
                )}
              </div>
            ))}

            <div className="form-group">
              <label>
                <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} /> On Sale
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isAvailableInStore"
                  checked={form.isAvailableInStore}
                  onChange={handleChange}
                />{" "}
                Available in Store
              </label>
            </div>

            <div className="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {preview && <img src={preview} alt="Preview" className="image-preview" />}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🔻 Sign Out Button at Bottom */}
      
    </div>
  );
};

export default AddProduct;
