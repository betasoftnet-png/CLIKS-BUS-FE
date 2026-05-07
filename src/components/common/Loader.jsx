import React from 'react';
import styled, { keyframes } from 'styled-components';
import logoPng from '../../assets/cliks.png';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(27, 107, 58, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 40px 10px rgba(27, 107, 58, 0.2);
  }
`;

const Loader = () => {
    return (
        <StyledWrapper>
            <div className="loader-container">
                <div className="logo-pulse">
                    <img src={logoPng} alt="CLIKS" className="loader-logo" />
                </div>
                <div className="loading-text">
                    <span>C</span>
                    <span>L</span>
                    <span>I</span>
                    <span>K</span>
                    <span>S</span>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .logo-pulse {
    width: 120px;
    height: 120px;
    animation: ${pulse} 2s ease-in-out infinite;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }

  .loading-text {
    font-family: 'Inter', sans-serif;
    display: flex;
    gap: 8px;
    
    span {
      color: #1B6B3A;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 4px;
      animation: text-pulse 1.5s ease-in-out infinite;
      opacity: 0.3;
      
      &:nth-child(1) { animation-delay: 0.0s; }
      &:nth-child(2) { animation-delay: 0.1s; }
      &:nth-child(3) { animation-delay: 0.2s; }
      &:nth-child(4) { animation-delay: 0.3s; }
      &:nth-child(5) { animation-delay: 0.4s; }
    }
  }

  @keyframes text-pulse {
    0%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-4px);
    }
  }
`;

export default Loader;
