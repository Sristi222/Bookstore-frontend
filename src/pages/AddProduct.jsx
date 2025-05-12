import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
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
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else if (key === "price" || key === "discountPercent" || key === "stockQuantity") {
          formData.append(key, parseFloat(value));
        } else {
          formData.append(key, value);
        }
      }
    }

    formData.append("image", imageFile);

    try {
      const res = await axios.post("https://localhost:7085/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Product added successfully!");
      console.log(res.data);

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
    <div style={{ padding: "20px" }}>
      <h2>Admin &gt; Add Product</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input type="text" name="author" value={form.author} onChange={handleChange} placeholder="Author" />
        <input type="text" name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" />
        <input type="text" name="publisher" value={form.publisher} onChange={handleChange} placeholder="Publisher" />
        <input type="text" name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} />
        <input type="text" name="language" value={form.language} onChange={handleChange} placeholder="Language" />
        <input type="text" name="format" value={form.format} onChange={handleChange} placeholder="Format" />
        <input type="date" name="publicationDate" value={form.publicationDate} onChange={handleChange} />
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" required />
        <input type="number" name="discountPercent" value={form.discountPercent} onChange={handleChange} placeholder="Discount %" />
        <input type="date" name="discountStartDate" value={form.discountStartDate} onChange={handleChange} />
        <input type="date" name="discountEndDate" value={form.discountEndDate} onChange={handleChange} />
        <label>
          <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} /> On Sale
        </label>
        <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} placeholder="Stock Quantity" />
        <label>
          <input type="checkbox" name="isAvailableInStore" checked={form.isAvailableInStore} onChange={handleChange} /> Available in Store
        </label>
        <div>
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {preview && <img src={preview} alt="Preview" style={{ maxWidth: "120px", marginTop: "10px" }} />}
        </div>
        <button type="submit" style={{ padding: "10px", background: "#333", color: "#fff", border: "none" }}>
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
