// import styles from "./Menu.module.css";
import { Outlet } from "react-router-dom";
import styles from "./Root.module.css";
import Menu from "../components/UI/Menu/Menu";
function Root() {
  return (
    <div className={styles.main}>
      <Menu />
      <div className={styles.content}>
        <p>conten</p>

        <Outlet />
      </div>
    </div>
  );
}

export default Root;
