import React, { useRef, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for routing

import PdfViewer from "../components/pdfViewer";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

export default function Content() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ pdfUrls: [], name: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const navigate = useNavigate();
  const [myPdfs, setMyPdfs] = useState(null);

  // Function to handle file upload to Firebase Storage
  const handleUpload = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // Function to handle file submission
  const handleFileSubmit = (e) => {
    if (files.length === 1 && files.length + formData.pdfUrls.length < 2) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(handleUpload(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          const newName = formData.name;
          setFormData({
            ...formData,
            pdfUrls: [...formData.pdfUrls, { name: newName, pdfUrl: urls }],
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((error) => {
          setImageUploadError("image upload failed (5mb max)");
          setUploading(false);
        });
    } else {
      setImageUploadError("you can upload only 1 file");
      setUploading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.pdfUrls.length < 1)
        return setError("you must upload at least one PDF file");
      setLoading(true);
      const res = await fetch("/api/auth/uploadfiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();

      setLoading(false);
      if (data.message === false) {
        setError(data.message);
      }
      navigate(`/pdf/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Function to handle input change
  const handleChange = (e) => {
    if (e.target.id === "text") {
      setFormData({ ...formData, name: e.target.value });
    }
  };

  // Function to remove a PDF from the list
  const handleRemovePdf = (index) => {
    setFormData({
      ...formData,
      pdfUrls: formData.pdfUrls.filter((_, i) => i !== index),
    });
  };

  // Function to fetch and display user's PDFs
  const handleShowPdfs = async (e) => {
    try {
      const res = await fetch(`/api/auth/pdfs/${currentUser._id}`);
      const data = await res.json();
      setMyPdfs(data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-10 my-12"
      >
        {/* Form Title */}
        <strong>
          <h1 className="text-3xl">Remove PDF pages</h1>
        </strong>
        {/* Form Subtitle */}
        <h2 className="text-center">
          Select and remove the PDF pages you don’t need. Get a new file without
          your deleted pages.
        </h2>
        {/* Form Inputs */}
        <div className="flex justify-center items-center">
          {/* Input for Title */}
          <input
            id="text"
            type="text"
            className="form-input"
            placeholder="Title"
            required
            onChange={handleChange}
          />
          {/* Input for PDF File */}
          <input
            id="pdf"
            type="file"
            onChange={(e) => setFiles(e.target.files)}
            accept=".pdf"
            className="form-input"
          />
        </div>
        {/* Upload and Submit Buttons */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFileSubmit}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-80 w-40 mr-5"
          >
            Upload
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white font-bold py-2 px-4 rounded opacity-80 w-40"
          >
            Submit
          </button>
        </div>
      </form>
      {/* Display Uploaded PDFs */}
      <div className="flex flex-col justify-center items-center">
        <h2>Uploaded PDFs:</h2>
        {formData.pdfUrls.length > 0 &&
          formData.pdfUrls.map((url, index) => (
            <div
              key={index}
              className="flex justify-between p-3 border items-center"
            >
              <p>{url.name}</p>
              <button
                onClick={() => handleRemovePdf(index)}
                type="button"
                className="text-red-700 p-3 rounded-lg uppercase hover:opacity-60"
              >
                Delete
              </button>
            </div>
          ))}
        {/* Button to Show User's PDFs */}
        <button
          onClick={handleShowPdfs}
          className="text-green-600 w-full bg-transparent border border-green-500 hover:border-transparent hover:bg-green-500 text-sm font-semibold py-2 px-4 rounded-full transition duration-500 ease-in-out transform hover:scale-105 mt-5"
        >
          Show PDFs
        </button>
        {/* Display User's PDFs */}
        {myPdfs &&
          myPdfs.map((item) => (
            <div key={item._id}>
              <Link to={`/pdf/${item._id}`}>
                <button className="mt-2">{item.name}</button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
