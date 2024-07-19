"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/styles/navbar.module.css";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { login, logout } from "@/redux/features/auth-slice";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>()
  const auth = useAppSelector((state) => state.authReducer)
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();


  const checkLogin = async() => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/auth/checklogin',{
      method: 'GET',
      credentials: 'include'
    })
    let data = await res.json();
    if(!data.ok){
      dispatch(logout());
    }
    else{
      getUserData()
    }
  }

  useEffect(() => {
    checkLogin()
  }, []);

  const getUserData = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/auth/getuser',{
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      }
    })
    let data = await res.json();
    if(data.ok){
      return dispatch(login(data.data))
    }
    else{
      return dispatch(logout())
    }
  }

  const handleLogout = async() => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/auth/logout',{
      method: 'POST',
      credentials: 'include'
    })
    let data = await res.json()
    if(data.ok){
      dispatch(logout())
      router.push('/login');
    }
  };

  return (
    <div className={styles.navbar}>
      <h1 onClick={() => router.push("/")}>BitS</h1>
      {auth.isAuth ? (
        <div className={styles.right}>
          <p
            onClick={() => {
              router.push("/myfiles");
            }}
            className={pathname === "/myfiles" ? styles.active : ""}
          >
            My Files
          </p>
          <p
            className={pathname === "/share" ? styles.active : ""}
            onClick={() => {
              router.push("/share");
            }}
          >
            Share
          </p>
          <button onClick={handleLogout} className={styles.logout}>Logout</button>
        </div>
      ) : (
        <div className={styles.right}>
          <p
            className={pathname === "/login" ? styles.active : ""}
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </p>
          <p
            className={pathname === "/signup" ? styles.active : ""}
            onClick={() => {
              router.push("/signup");
            }}
          >
            Sign Up
          </p>
        </div>
      )}
    </div>
  );
};

export default Navbar;
