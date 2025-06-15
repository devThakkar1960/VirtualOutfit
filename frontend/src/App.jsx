import React from 'react'
import TryHere
 from '../components/TryHere'
import Home from '../components/Home'
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const appRouter = createBrowserRouter([
  {
    path:'/',
    element:<Home/>
  },
  {
    path:'/try',
    element:<TryHere/>
  }
]) 
function App() {
  return (
    <>
      <RouterProvider router={appRouter}/>
    </>
  );
}

export default App;