import { IoMdAdd } from 'react-icons/io';
import './FloatingButton.css';

const FloatingButton = ({ onClick }) => {
    return (
      <button className="floating-button" onClick={onClick}>
        <IoMdAdd className="floating-button__icon" />
      </button>
    );
  };
  
  export default FloatingButton;
  