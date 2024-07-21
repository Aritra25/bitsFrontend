"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/myfiles.module.css";
// import io from "socket.io-client";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { login, logout } from "@/redux/features/auth-slice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface File {
  createdAt: string;
  filename: string;
  fileurl: string;
  fileType: string | null;
  receiveremail: string;
  senderemail: string;
  sharedAt: string;
  updatedAt: string;
  _id: string;
}

// let socket: any = null;
let apiurl = `${process.env.NEXT_PUBLIC_API_URL}`;

const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAppSelector((state) => state.authReducer);

  const [allFiles, setAllFiles] = useState<File[]>([]);

  // const tempFiles = [
  //   {
  //     filename: "test1.png",
  //     fileurl: "",
  //     filetype: "image",
  //     sharedAt: new Date(),
  //   },
  //   {
  //     filename: "test2.jpeg",
  //     fileurl: "",
  //     filetype: "image",
  //     sharedAt: new Date(),
  //   },
  //   {
  //     filename: "test3.pdf",
  //     fileurl: "",
  //     filetype: "document",
  //     sharedAt: new Date(),
  //   },
  // ];

  const getFileType = (fileurl: string) => {
    const extension = fileurl.split(".").pop()?.toLowerCase() || "";
    
    switch (extension) {
      case "mp4":
      case "avi":
      case "mov":
        return "video";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "pdf":
      case "docx":
      case "doc":
      case "txt":
        return "document";
      default:
        // console.warn(`Unknown file extension: ${extension}`); // Log unknown extensions
        return "unknown";
    }
  };
  
  useEffect(() => {
    const getAllFiles = async () => {
      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/file/getfiles", {
        method: "GET",
        credentials: "include",
      });
      let resjson = await res.json();
      if (resjson.ok) {
        const filesWithTypes = resjson.data.map((file: File) => ({
          ...file,
          fileType: getFileType(file.fileurl),
        }));
        setAllFiles(filesWithTypes);
      }
    };
    getAllFiles();
  }, []);

  // const [socketId, setSocketId] = useState<string | null>(null);
  // socket = useMemo(() => io(apiurl), []);

  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuth) {
      return router.push("/login");
    }
  }, [auth,router]);

  const getUserData = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/getuser", {
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

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log("FT connected", socket.id);
  //     setSocketId(socket.id);
  //   });

  //   if (auth.user) {
  //     socket.emit("joinself", auth.user.email);
  //   } else {
  //     getUserData()
  //       .then((user) => {
  //         socket.emit("joinself", user.email);
  //       })
  //       .catch((err) => {
  //         router.push("/login");
  //       });
  //   }
  //   socket.on("notify", (data: any) => {
  //     getAllFiles();
  //     toast.success("New file from " + data.from);
  //   });
  // }, []);

  const getImageUrls3 = async (key: string) => {
    let res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/file/gets3urlbykey/" + key,
      {
        method: "GET",
        credentials: "include",
      }
    );

    let data = await res.json();

    if (data.ok) {
      return data.data.signedUrl
    }
    else
    return null
  };


  return (
    <div className={styles.allfiles}>
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            {/* <th>File Type</th> */}
            <th>Sender Email</th>
            <th>Receiver Email</th>
            <th>Shared At</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {allFiles
            .sort((a, b) => {
              return (
                new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
              );
            })
            .map((file, index) => {
              // console.log(file.recieveremail.email)

              file.fileType = getFileType(file.fileurl);
              return (
                <tr key={index}>
                  <td>{file.filename}</td>
                  {/* <td>{file?.fileType || "Unknown"}</td> */}
                  <td>{file.senderemail}</td>
                  <td>{file?.receiveremail}</td>
                  <td>{new Date(file.sharedAt).toLocaleString()}</td>
                  <td>
                    <svg
                      onClick={async () => {
                        let s3Url: string | null = await getImageUrls3(
                          file.fileurl
                        );

                        if (s3Url) {
                          window.open(s3Url, "_blank");
                        }
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z"
                          stroke="#000000"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z"
                          stroke="#000000"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};


export default Page;
