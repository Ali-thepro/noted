import { useDispatch, useSelector } from 'react-redux';
import { me } from '../services/auth';
import { setUser } from '../redux/reducers/authReducer';
import { useEffect } from 'react';
import { toast } from 'react-toastify'

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  useEffect(() => {
    async function fetchUser() {
      try {
        if (!user) {
          const response = await me(); 
          dispatch(setUser(response));
          toast.success('Logged in');
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchUser();
  }, [dispatch]);
  return (
    <div className="container mx-auto p-4">
      <h1 className='text-3xl'>Welcome to the Home Page</h1>
    </div>
  )
}

export default Home