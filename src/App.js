import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { useSelector } from 'react-redux';
import Spinner from './components/Spinner';
import NewsIndex from './pages/NewsIndex';
import EditProfile from './pages/EditProfile';
import Education from './pages/Education';


function App() {
  const {loading} = useSelector(state => state.alerts);
  return (
    <div className="App">
      {loading && <div className='loader-parent'>
      <Spinner/>
      </div>}
      <BrowserRouter>
        <Routes>
          <Route path='/' element= {<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/NewsIndex' element= {<ProtectedRoute><NewsIndex /></ProtectedRoute>} />
          <Route path='/Education' element= {<ProtectedRoute><Education /></ProtectedRoute>} />
          <Route path='/EditProfile' element= {<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path='/Login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/Register' element={<PublicRoute><Register /></PublicRoute>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
