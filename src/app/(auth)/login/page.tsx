"use client";
import { useState } from "react";
import styles from "@/styles/auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, logout } from "@/redux/features/auth-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}


const page = () => {
  const router = useRouter();
  const auth = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name,value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  };

  const handleLogin = async() => {
    if(formData.email=='' || formData.password==''){
      toast.error('Please fill all the fields')
      return
    }
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/auth/login',{
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    let data = await res.json();

    if(data.ok){
      toast.success('Login Success');
      getUserData()
    }
    else{
      toast.error(data.message)
    }
  };

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
      dispatch(login(data.data))
      router.push('/myfiles')
    }
    else{
      dispatch(logout())
    }
  }

  return (
    <div className={styles.authpage}>
      <h1>Login</h1>
      <div className={styles.inputcontainer}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputcontainer}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>
      <button className={styles.button1} type="button" onClick={handleLogin}>
        Login
      </button>
      <Link href="/signup">Create an account?</Link>
      <h4 className={styles.h4}>or</h4>
      <Link href="/forgotpassword">Forgot Password?</Link>
    </div>
  );
};

export default page;
