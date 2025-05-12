import React, { useEffect, useState } from "react";
import axios from "axios";

const BannerPopup = () => {
  const [banner, setBanner] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axios.get("https://localhost:7085/api/Banners");
        console.log("Fetched banner:", res.data);

        if (res.data) {
          setBanner(res.data);
          setShow(true);
        }
      } catch (err) {
        console.error("Error fetching banner", err);
      }
    };

    fetchBanner();
  }, []);

  if (!show || !banner) return null; // 🔥 hide if no banner or closed

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={() => setShow(false)}>✖</button>
        <h2>{banner.title}</h2>
        <p>{banner.subTitle}</p>
        {banner.image && (
          <img
            src={banner.image}
            alt="Banner"
            style={{ maxWidth: "100%", maxHeight: "300px", marginTop: "10px" }}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
  },
  modal: {
    background: "#fff", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "500px", textAlign: "center", position: "relative"
  },
  closeBtn: {
    position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer"
  }
};

export default BannerPopup;
