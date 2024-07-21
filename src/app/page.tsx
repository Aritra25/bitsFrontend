"use client";

import React from "react";
// import styles from '@/styles/home.module.css'
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: bold;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
  font-size: 2rem;
  color: #333;
  animation: ${fadeIn} 2s ease-in-out;
  h1: {
    margin: 25px;
  }
`;

const page = () => {
  return (
    <React.StrictMode>
      <StyledHome>
        <h1>Welcome to Bits!</h1>
        <h4>Share files with anyone...</h4>
      </StyledHome>
    </React.StrictMode>
  );
};

export default page;
