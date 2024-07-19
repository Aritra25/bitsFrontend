"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/myfiles.module.css";
import io from "socket.io-client";
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
  filetype: string | null;
  recieveremail: string;
  senderemail: string;
  sharedAt: string;
  updatedAt: string;
  _id: string;
}

let socket: any = null;
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

  const getAllFiles = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/file/getfiles", {
      method: "GET",
      credentials: "include",
    });
    let resjson = await res.json();
    if (resjson.ok) {
      console.log(resjson.data);
      setAllFiles(resjson.data);
    }
  };

  const getFileType = (fileurl: any) => {
    const extension = fileurl.split(".").pop().toLowerCase();

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

  useEffect(() => {
    getAllFiles();
  }, []);

  const [socketId, setSocketId] = useState<string | null>(null);
  socket = useMemo(() => io(apiurl), []);

  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuth) {
      return router.push("/login");
    }
  }, [auth]);

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
      getAllFiles();
      toast.success("New file from " + data.from);
    });
  }, []);

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
      console.log(data);
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
            <th>File Type</th>
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

              file.filetype = getFileType(file.fileurl);
              return (
                <tr key={index}>
                  <td>{file.filename}</td>
                  <td>{file?.fileType || "Unknown"}</td>
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

//   return (
//     <div className={styles.allfiles}>
//       {tempFiles.map((file, index) => {
//         return (
//           <div className={styles.filecard} key={index}>
//             <div className={styles.left}>
//               {file.filetype === "video" && (
//                 <svg
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
//                   <g
//                     id="SVGRepo_tracerCarrier"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   ></g>
//                   <g id="SVGRepo_iconCarrier">
//                     {" "}
//                     <path
//                       d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z"
//                       stroke="#000000"
//                       stroke-width="2"
//                       stroke-linecap="round"
//                       stroke-linejoin="round"
//                     ></path>{" "}
//                   </g>
//                 </svg>
//               )}
//               {file.filetype === "image" && (
//                 <svg
//                   fill="#000000"
//                   viewBox="0 0 512 512"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
//                   <g
//                     id="SVGRepo_tracerCarrier"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   ></g>
//                   <g id="SVGRepo_iconCarrier">
//                     <path d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 336H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h404a6 6 0 0 1 6 6v276a6 6 0 0 1-6 6zM128 152c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zM96 352h320v-80l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L192 304l-39.515-39.515c-4.686-4.686-12.284-4.686-16.971 0L96 304v48z"></path>
//                   </g>
//                 </svg>
//               )}
//               {file.filetype === "document" && (
//                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V9C20 7.34315 18.6569 6 17 6H5C4.44772 6 4 5.55228 4 5ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9142 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9142 7.25 15.5Z" fill="#111318"></path> <path d="M4.40879 4.0871C4.75727 4.24338 5 4.59334 5 5H17C17.3453 5 17.6804 5.04375 18 5.12602V4.30604C18 3.08894 16.922 2.15402 15.7172 2.32614L4.91959 3.86865C4.72712 3.89615 4.55271 3.97374 4.40879 4.0871Z" fill="#111318"></path> </g></svg>
//               )}
//               <h3>{file.filename}</h3>
//               <p>{file.filetype}</p>
//               <p>{file.sharedAt.toString()}</p>
//             </div>
//             <div className={styles.right}>
//             <svg
//                 onClick={viewFile}
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke-width="1.5"
//                 stroke="currentColor"
//                 class="size-6"
//               >
//                 <path
//                   stroke-linecap="round"
//                   stroke-linejoin="round"
//                   d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
//                 />
//                 <path
//                   stroke-linecap="round"
//                   stroke-linejoin="round"
//                   d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//                 />
//               </svg>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

export default Page;
