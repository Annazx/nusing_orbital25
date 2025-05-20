import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"></link>
        
      </head>
      <h1>Welcome to NUSing My Brain!</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">About</Link>
          </li>
          <li>
            <Link to="/student">I'm a student</Link>
          </li>
          <li>
            <Link to="/tutor">I'm a peer tutor</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;