import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../shared/Navbar";
import axios from "axios";

function Card({ title, showSendButton = true, showDownloadButton = false, onFileChange, onDownload, image, inputId }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    if (typeof image === "string") {
      setPreview(image);
    } else {
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm lg:w-80 min-h-[200px] mb-8 relative z-10 font-poppins">
      <div className="flex flex-col items-center mb-6 gap-4">
        <label htmlFor={`${inputId}-file`} className="cursor-pointer">
          {preview ? (
            <img className="w-full rounded-xl" src={preview} alt="preview" />
          ) : (
            !showDownloadButton && (
              <img
                src="https://cdn-icons-png.flaticon.com/128/1665/1665680.png"
                className="h-20 w-20"
                alt="placeholder"
              />
            )
          )}
        </label>
        {!showDownloadButton && (
          <input
            id={`${inputId}-file`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        )}
      </div>

      <div className="text-center text-lg font-semibold mb-4">{title}</div>

      {showSendButton && (
        <div className="flex justify-center">
          <Button className="w-full bg-neutral-800 text-white rounded-lg shadow-md hover:bg-neutral-900 hover:scale-105 transition-all font-poppins">
            Send
          </Button>
        </div>
      )}

      {showDownloadButton && image && (
        <div className="flex justify-center">
          <Button
            onClick={onDownload}
            className="w-full bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition-all font-poppins"
          >
            Download
          </Button>
        </div>
      )}
    </div>
  );
}

function TryHere() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [personImageUrl, setPersonImageUrl] = useState("");
  const [clothImageUrl, setClothImageUrl] = useState("");
  const [clothType, setClothType] = useState("Upper");
  const [outputURL, setOutputURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadToCloudinary = async (imageFile) => {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "VirtualOutfit");
    data.append("cloud_name", "name");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/name/upload", {
        method: "POST",
        body: data,
      });
      const cloudData = await res.json();
      return cloudData.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const saveImages = async () => {
    if (!personImage || !clothImage) {
      toast.error("Please upload both images.");
      return;
    }

    setLoading(true);

    try {
      const [personUrl, clothUrl] = await Promise.all([
        uploadToCloudinary(personImage),
        uploadToCloudinary(clothImage),
      ]);

      setPersonImageUrl(personUrl);
      setClothImageUrl(clothUrl);

      const response = await axios.post("http://localhost:3000/api/cloth-swap", {
        input_url: personUrl,
        cloth_url: clothUrl,
        cloth_type: clothType.toLowerCase(),
      });

      setOutputURL(response.data.output[0]);
      toast.success("Request processed successfully!");
    } catch (error) {
      console.error("Upload or backend request failed:", error);
      toast.error("Upload or backend request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!outputURL) return;
    const response = await fetch(outputURL, { mode: "cors" });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clothType.toLowerCase()}_result_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="font-poppins">
      <Navbar />
     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-20 py-10 pt-24">

        <div className="flex flex-col justify-center items-center gap-10 min-h-screen">

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Card
              title="Upload person image"
              showSendButton={false}
              onFileChange={(e) => setPersonImage(e.target.files[0])}
              image={personImage}
              inputId="file-upload-person"
            />
            <Card
              title="Upload cloth image"
              showSendButton={false}
              onFileChange={(e) => setClothImage(e.target.files[0])}
              image={clothImage}
              inputId="file-upload-cloth"
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <label htmlFor="cloth-type" className="text-lg font-semibold text-gray-700">
              Select Cloth Type
            </label>
            <select
              id="cloth-type"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={clothType}
              onChange={(e) => setClothType(e.target.value)}
            >
              <option value="Upper">Upper</option>
              <option value="Lower">Lower</option>
              <option value="Overall">Overall</option>
            </select>

            <Button
              onClick={saveImages}
              disabled={loading}
              className={`w-full max-w-xs text-white rounded-lg shadow-md px-4 py-2 font-poppins transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-neutral-800 hover:bg-neutral-900 hover:scale-105"
              }`}
            >
              {loading ? "Processing..." : "Submit"}
            </Button>
          </div>

          <Card
            title="Download your result"
            showSendButton={false}
            showDownloadButton={true}
            inputId="file-download-dummy"
            image={outputURL}
            onDownload={handleDownload}
          />
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default TryHere;
