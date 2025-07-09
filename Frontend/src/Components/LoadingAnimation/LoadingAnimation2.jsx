import Spline from '@splinetool/react-spline';
import epochPresents from '../../Picture/aicomic2.jpg';
import './LoadingAnimation2.css';

export default function App() {
  return (
    <div className="spline-container" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundColor: 'black',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <div className="animation-wrapper">
        <Spline scene="https://prod.spline.design/dilviIxFoBiODtyE/scene.splinecode" />
      </div>
      <img 
        src={epochPresents} 
        alt="AI Comic X" 
        style={{
          position: 'absolute',
          top: '47%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '280px',
          maxHeight: '280px',
          zIndex: 10
        }}
      />
      <div className="loading-container">
        <div className="loading-title">
          <span className="loading-text">Loading</span>
          <div className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
