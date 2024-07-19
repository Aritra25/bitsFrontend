"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/auth.module.css";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { login, logout } from "@/redux/features/auth-slice";
import { useAppSelector, AppDispatch } from "@/redux/store";

let socket: any = null;
let apiurl = `${process.env.NEXT_PUBLIC_API_URL}`;

const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAppSelector((state) => state.authReducer);
  const [file, setFile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadpercent, setUploadpercent] = useState(0);

  const getFileType = (file: any) => {
    console.log(file)
    const extension = file.name.split(".").pop().toLowerCase();
    console.log(extension)
    switch (extension) {
      case "mp4":
        return "video";
      case "avi":
        return "video";
      case "mov":
        return "video";
      case "jpg":
        return "image";
      case "jpeg":
        return "image";
      case "png":
        return "image";
      case "gif":
        return "image";
      case "pdf":
        return "document";
      case "docx":
        return "document";
      case "doc":
        return "document";
      case "txt":
        return "document";
      default:
        return "unknown";
    }
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    setFile(acceptedFiles[0]);
  }, []);

  const router = useRouter();

  const generatepostobjectUrl = async () => {
    try {
      let res = await fetch(`${apiurl}/file/generatepostobjecturl`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch the post object URL");
      }

      let data = await res.json();

      if (data.ok) {
        toast.success(`url generated successfully`);
        return data;
      } else {
        toast.error("Failed to generate post object URL");
        return null;
      }
    } catch (error) {
      console.error("Error generating post object URL:", error);
      toast.error("An error occurred while generating the post object URL");
      return null;
    }
  };

  const uploadtos3byurl = async (url: any) => {
    setUploading(true);
    try {
      const options = {
        method: "PUT",
        body: file,
      };

      let res = await fetch(url, options);

      if (res.ok) {
        toast.success("File uploaded to S3 successfully");
        return true;
      } else {
        toast.error("Failed to upload file to S3");
        return false;
      }
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      toast.error("An error occurred while uploading the file");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!email) {
      toast.error("Please fill all the fields!");
      return;
    }

    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    setUploading(true);

    try {
      let s3urlobj = await generatepostobjectUrl();

      if (!s3urlobj) {
        setUploading(false);
        return;
      }

      let filekey = s3urlobj.data.filekey;

      let fileType = getFileType(file);
      console.log(fileType)

      let s3url = s3urlobj.data.signedUrl;
      let uploaded = await uploadtos3byurl(s3url);

      if (!uploaded) {
        setUploading(false);
        toast.error("Failed to upload to S3");
        return;
      }

      toast.success("File uploaded successfully");

      let res = await fetch(`${apiurl}/file/sharefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiveremail: email,
          filename: filename,
          filekey: filekey,
          fileType: fileType,
        }),
      });

      let data = await res.json();

      if (data.ok) {
        toast.success("File shared successfully");
        socket.emit("uploaded", {
          from: auth.user.email,
          to: email,
        });
        router.push("/myfiles");
      } else {
        toast.error("Failed to share file");
      }
    } catch (error) {
      // setUploading(false);
      toast.error("An error occurred during the upload");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const viewFile = () => {
    if (!file) {
      toast.error("No file selected to view");
      return;
    }
    const url = URL.createObjectURL(file);

    if (url) window.open(url);
    else toast.error("Unsupported file type for preview");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const [socketId, setSocketId] = useState<string | null>(null);
  socket = useMemo(() => io(apiurl), [apiurl]);

  const getUserData = async () => {
    let res = await fetch(`${apiurl}/auth/getuser`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    let data = await res.json();
    if (data.ok) {
      dispatch(login(data.data));
      return data.data;
    } else {
      dispatch(logout());
      router.push("/login");
    }
  };

  useEffect(() => {
    if (!auth.isAuth) {
      return router.push("/login");
    }
  }, [auth, router]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("FT connected", socket.id);
      setSocketId(socket.id);
    });

    if (auth.user) {
      socket.emit("joinself", auth.user.email);
    } else {
      getUserData()
        .then((user) => {
          socket.emit("joinself", user.email);
        })
        .catch((err) => {
          router.push("/login");
        });
    }

    socket.on("notify", (data: any) => {
      toast.success(`New file from ${data.from}`);
      // Call a function to refresh file list if needed
    });

    return () => {
      socket.off("connect");
      socket.off("notify");
    };
  }, [auth.user, getUserData, router, socket]);

  return (
    <div className={styles.authpage}>
      <div className={styles.inputcontainer}>
        <label htmlFor="email">Receiver's email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className={styles.inputcontainer}>
        <label htmlFor="filename">File Name</label>
        <input
          type="text"
          name="filename"
          id="filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
      </div>
      <div className={styles.inputcontainer}>
        {file ? (
          <div className={styles.filecard}>
            <div className={styles.left}>
              <p>{file.name}</p>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>

            <div className={styles.right}>
              <svg
                onClick={removeFile}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <svg
                onClick={viewFile}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div className={styles.droptext}>
                <p>Drag 'n' drop some files here, or click to select files</p>
                <p>or</p>
                <p>click here to select files</p>
              </div>
            )}
          </div>
        )}
      </div>
      <button className={styles.button1} type="button" onClick={handleUpload}>
        Send
      </button>
      {uploading && (
        <div className={styles.uploadpopup}>
          <div className={styles.uploadsectionrow}>
            <div className={styles.uploadbar}>
              <div
                style={{
                  width: `${uploadpercent}%`,
                  backgroundColor: "lightgreen",
                  height: "100%",
                  borderRadius: "5px",
                }}
              ></div>
            </div>
            <p>{uploadpercent}%</p>
          </div>
          <p>Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default Page;
