import { Outlet } from "react-router-dom";
import housebuyLogo from "../img/housebuy-logo.svg";

const Layout = () => {
  return (
    <>
      <div className="flex shrink-0 justify-center h-16 items-center border-b border-gray-200 ">
        <a href="/">
          <div
            className="bg-contain bg-center bg-no-repeat"
            style={{
              height: 30,
              width: 165,
              backgroundImage: `url(${housebuyLogo})`,
            }}
          ></div>
        </a>
      </div>
      <Outlet />
    </>
  );
};

export default Layout;
